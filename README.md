# Smart Campus Management System 🎓

A scalable, microservices-based platform designed to modernize university operations using AI, IoT, and Event-Driven Architecture.

## 🚀 Technical Architecture

The system follows a **Hub-and-Spoke** architecture tailored for a solo-developer implementation:

* **Core Backend (The Hub):** FastAPI (Python) handles Users, Authentication, and Data persistence.
* **Frontend:** React.js (Vite) provides a unified dashboard for students and faculty.
* **AI Services (The Spokes):** Independent workers for specialized tasks (YOLOv8 Security, OR-Tools Scheduling) connected via RabbitMQ.
* **Database:** PostgreSQL (via SQLModel).

## 🛠️ Tech Stack

* **Backend:** Python 3.10+, FastAPI, SQLModel (ORM)
* **Frontend:** React.js, TailwindCSS (Planned), Vite
* **Database:** PostgreSQL / SQLite (for dev)
* **Message Broker:** RabbitMQ
* **AI/ML:** YOLOv8, Google OR-Tools, TensorFlow

## 📦 Installation & Setup

### Prerequisites
* Python 3.10+
* Node.js (LTS)
* Git

### 1. Clone the Repository
```bash
git clone [https://github.com/oshadhaw63/smart-campus-system.git](https://github.com/oshadhaw63/smart-campus-system.git)
cd smart-campus-system

# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn sqlmodel

# Run Server
uvicorn main:app --reload

# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Run Server
npm run dev

📅 Roadmap

[x] Phase 1: Core REST API & React Setup

[ ] Phase 2: Database Integration (PostgreSQL)

[ ] Phase 3: Student Portal UI Implementation

[ ] Phase 4: Event-Driven Architecture (RabbitMQ)

[ ] Phase 5: AI Security Module Integration