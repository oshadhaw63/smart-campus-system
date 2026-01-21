from typing import Optional, List
from fastapi import FastAPI, Depends
from sqlmodel import SQLModel, Field, create_engine, Session, select
from fastapi.middleware.cors import CORSMiddleware

# 1. THE DATABASE SETUP (Back to Local SQLite)
sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

engine = create_engine(sqlite_url, echo=True)

# 2. THE MODEL
class Student(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    student_id: int
    department: str

class Course(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    code: str      # e.g., "CS2012"
    credits: int   # e.g., 3

class Enrollment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: int
    course_id: int
    grade: Optional[str] = None  # e.g., "A", "B" (Optional for now)

# 3. CREATE TABLES
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

# 4. SESSION HELPER
def get_session():
    with Session(engine) as session:
        yield session

# 5. THE APP
app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

@app.get("/")
def read_root():
    return {"message": "Smart Campus Backend is Running (Local Mode)"}

@app.post("/students/", response_model=Student)
def create_student(student: Student, session: Session = Depends(get_session)):
    session.add(student)
    session.commit()
    session.refresh(student)
    return student

@app.get("/students/", response_model=List[Student])
def read_students(session: Session = Depends(get_session)):
    students = session.exec(select(Student)).all()
    return students

@app.delete("/students/{student_id}")
def delete_student(student_id: int, session: Session = Depends(get_session)):
    student = session.get(Student, student_id)
    if not student:
        return {"error": "Student not found"}
    session.delete(student)
    session.commit()
    return {"message": "Student deleted successfully"}

@app.get("/stats")
def get_stats(session: Session = Depends(get_session)):
    total_students = len(session.exec(select(Student)).all())
    total_courses = len(session.exec(select(Course)).all()) # New!
    
    cse_count = len(session.exec(select(Student).where(Student.department == "CSE")).all())
    entc_count = len(session.exec(select(Student).where(Student.department == "ENTC")).all())
    
    return {
        "total": total_students,
        "courses": total_courses, # New!
        "cse": cse_count,
        "entc": entc_count,
        "other": total_students - (cse_count + entc_count)
    }

# --- COURSE ENDPOINTS ---
@app.post("/courses/", response_model=Course)
def create_course(course: Course, session: Session = Depends(get_session)):
    session.add(course)
    session.commit()
    session.refresh(course)
    return course

@app.get("/courses/", response_model=List[Course])
def read_courses(session: Session = Depends(get_session)):
    courses = session.exec(select(Course)).all()
    return courses

@app.delete("/courses/{course_id}")
def delete_course(course_id: int, session: Session = Depends(get_session)):
    course = session.get(Course, course_id)
    if not course:
        return {"error": "Course not found"}
    session.delete(course)
    session.commit()
    return {"message": "Course deleted successfully"}

@app.post("/enrollments/", response_model=Enrollment)
def enroll_student(enrollment: Enrollment, session: Session = Depends(get_session)):
    # Check if they exist first (Safety Check)
    student = session.get(Student, enrollment.student_id)
    course = session.get(Course, enrollment.course_id)
    if not student or not course:
         # In a real app, we would raise an error here
         return enrollment 
    
    session.add(enrollment)
    session.commit()
    session.refresh(enrollment)
    return enrollment

@app.get("/enrollments/")
def read_enrollments(session: Session = Depends(get_session)):
    return session.exec(select(Enrollment)).all()