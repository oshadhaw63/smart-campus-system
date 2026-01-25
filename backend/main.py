from typing import Optional, List
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlmodel import SQLModel, Field, create_engine, Session, select
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import qrcode
from datetime import datetime
import pika

# --- DATABASE SETUP ---
sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"
engine = create_engine(sqlite_url, echo=True)

RABBITMQ_URL = "amqps://ftnvthix:EJ74G9eFWRfIpENoNsgTxUAmmxnmdF-3@armadillo.rmq.cloudamqp.com/ftnvthix" 

def publish_message(message: str):
    try:
        # Parse the URL
        params = pika.URLParameters(RABBITMQ_URL)
        connection = pika.BlockingConnection(params)
        channel = connection.channel()
        
        # Create a queue named 'attendance_emails' if it doesn't exist
        channel.queue_declare(queue='attendance_emails')
        
        # Send the message
        channel.basic_publish(exchange='', routing_key='attendance_emails', body=message)
        
        connection.close()
        print(f"Sent to RabbitMQ: {message}")
    except Exception as e:
        print(f"Failed to send to RabbitMQ: {e}")

# --- MODELS ---
class Student(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    student_id: int
    department: str

class Course(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    code: str
    credits: int

class Enrollment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: int
    course_id: int
    grade: Optional[str] = None

class Attendance(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: int
    date: str
    time: str
    status: str

# --- APP SETUP ---
app = FastAPI()

# Mount Static for Images
app.mount("/static", StaticFiles(directory="static"), name="static")

# CORS
origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

# ==========================================
# 🔒 SECURITY SECTION (NEW)
# ==========================================

# This tells FastAPI: "Look for the token in the Authorization header"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# 1. THE LOGIN ENDPOINT
@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # HARDCODED CREDENTIALS (In a real app, check DB and hash password)
    if form_data.username == "admin" and form_data.password == "admin123":
        # Return a "Fake" JWT Token
        return {"access_token": "super-secret-token", "token_type": "bearer"}
    else:
        raise HTTPException(status_code=400, detail="Incorrect username or password")

# 2. THE SECURITY GUARD (Dependency)
# Any function using this will FAIL if the user doesn't have the token
def get_current_user(token: str = Depends(oauth2_scheme)):
    if token != "super-secret-token":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return "admin"

# ==========================================
# 🚀 ENDPOINTS
# ==========================================

# PUBLIC ENDPOINTS (Anyone can read data)
@app.get("/")
def read_root():
    return {"message": "Smart Campus Backend Running"}

@app.get("/students/", response_model=List[Student])
def read_students(session: Session = Depends(get_session)):
    return session.exec(select(Student)).all()

@app.get("/courses/", response_model=List[Course])
def read_courses(session: Session = Depends(get_session)):
    return session.exec(select(Course)).all()

@app.get("/enrollments/")
def read_enrollments(session: Session = Depends(get_session)):
    return session.exec(select(Enrollment)).all()

@app.get("/attendance/")
def read_attendance(session: Session = Depends(get_session)):
    logs = session.exec(select(Attendance)).all()
    return logs[::-1] 

@app.get("/stats")
def get_stats(session: Session = Depends(get_session)):
    total_students = len(session.exec(select(Student)).all())
    total_courses = len(session.exec(select(Course)).all())
    return {"total": total_students, "courses": total_courses}

# PROTECTED ENDPOINTS (Must be logged in to Modify Data)
# Note: We added 'user: str = Depends(get_current_user)'

@app.post("/students/", response_model=Student)
def create_student(student: Student, session: Session = Depends(get_session), user: str = Depends(get_current_user)):
    session.add(student)
    session.commit()
    session.refresh(student)
    # Generate QR
    qr_data = f"Name: {student.name}\nID: {student.student_id}\nDept: {student.department}"
    img = qrcode.make(qr_data)
    img.save(f"static/student_{student.id}.png")
    return student

@app.delete("/students/{student_id}")
def delete_student(student_id: int, session: Session = Depends(get_session), user: str = Depends(get_current_user)):
    student = session.get(Student, student_id)
    if not student: return {"error": "Not found"}
    session.delete(student)
    session.commit()
    return {"message": "Deleted"}

@app.post("/courses/", response_model=Course)
def create_course(course: Course, session: Session = Depends(get_session), user: str = Depends(get_current_user)):
    session.add(course)
    session.commit()
    session.refresh(course)
    return course

@app.delete("/courses/{course_id}")
def delete_course(course_id: int, session: Session = Depends(get_session), user: str = Depends(get_current_user)):
    course = session.get(Course, course_id)
    if not course: return {"error": "Not found"}
    session.delete(course)
    session.commit()
    return {"message": "Deleted"}

@app.post("/enrollments/", response_model=Enrollment)
def enroll_student(enrollment: Enrollment, session: Session = Depends(get_session), user: str = Depends(get_current_user)):
    session.add(enrollment)
    session.commit()
    session.refresh(enrollment)
    return enrollment

# PUBLIC: Scanning should be public (or protected by a different 'scanner' user, but let's keep public for ease)
@app.post("/scan/{student_id}")
def mark_attendance(student_id: int, session: Session = Depends(get_session)):
    student = session.get(Student, student_id)
    if not student: return {"error": "Student not found", "name": "Unknown"}
    now = datetime.now()
    log = Attendance(student_id=student_id, date=now.strftime("%Y-%m-%d"), time=now.strftime("%H:%M:%S"), status="Present")
    session.add(log)
    session.commit()

    message_body = f"Notification: {student.name} marked present at {log.time}"
    publish_message(message_body)
    return {"message": "Attendance Marked", "name": student.name, "time": log.time}