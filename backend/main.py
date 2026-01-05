from typing import Optional, List
from fastapi import FastAPI, Depends
from sqlmodel import SQLModel, Field, create_engine, Session, select
from fastapi.middleware.cors import CORSMiddleware

# 1. THE DATABASE SETUP
# This creates a file named "database.db" in your folder.
# Later, we replace this URL with the PostgreSQL URL.
sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

# The "Engine" is the car engine that drives the connection to the database.
engine = create_engine(sqlite_url)

# 2. THE MODEL (The Blueprint)
# table=True tells SQLModel: "Create a real table in the database for this"
class Student(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True) # Auto-generated ID
    name: str
    student_id: int
    department: str

# 3. CREATE TABLES
# This function runs when the server starts to create the file if it doesn't exist
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

# 4. DATABASE SESSION
# This is a helper to get a "fresh connection" for every request
def get_session():
    with Session(engine) as session:
        yield session

# 5. THE APP
app = FastAPI()

# This allows the frontend (localhost:5173) to talk to this backend
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

# Run the table creation when the app starts
@app.on_event("startup")
def on_startup():
    create_db_and_tables()

@app.get("/")
def read_root():
    return {"message": "Welcome to the Smart Campus Database!"}

# 6. POST (Save to DB)
# We use "session" to talk to the database
@app.post("/students/", response_model=Student)
def create_student(student: Student, session: Session = Depends(get_session)):
    session.add(student)     # 1. Add to the holding area
    session.commit()         # 2. Save permanently to disk
    session.refresh(student) # 3. Refresh data (get the auto-generated ID)
    return student

# 7. GET (Read from DB)
@app.get("/students/", response_model=List[Student])
def read_students(session: Session = Depends(get_session)):
    students = session.exec(select(Student)).all() # Run a SQL "SELECT * FROM student"
    return students