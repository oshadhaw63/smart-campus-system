import { useState, useEffect } from 'react'

function App() {
  // --- 1. STATE MANAGEMENT ---
  const [students, setStudents] = useState([])
  
  // New State for the Form Inputs
  const [formData, setFormData] = useState({
    name: "",
    student_id: "",
    department: ""
  })

  // --- 2. LOAD DATA ON STARTUP ---
  useEffect(() => {
    fetchStudents()
  }, [])

  // --- 3. API FUNCTIONS ---
  
  // GET: Fetch the list
  const fetchStudents = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/students/")
      const data = await response.json()
      setStudents(data)
    } catch (error) {
      console.error("Error fetching students:", error)
    }
  }

  // POST: Send new student to backend
  const handleSubmit = async (e) => {
    e.preventDefault() // Stop the page from reloading
    
    // Check if fields are not empty
    if (!formData.name || !formData.student_id || !formData.department) {
        alert("Please fill in all fields")
        return
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/students/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData) // Convert JS object to JSON text
      })

      if (response.ok) {
        // If successful:
        fetchStudents() // 1. Refresh the list immediately
        setFormData({ name: "", student_id: "", department: "" }) // 2. Clear the form
      } else {
        alert("Failed to add student")
      }
    } catch (error) {
      console.error("Error adding student:", error)
    }
  }

  // Helper to update state when user types
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // --- 4. THE UI (HTML) ---
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px", fontFamily: "Arial" }}>
      <h1 style={{ textAlign: "center", color: "#eae4e4ff" }}>🎓 Smart Campus Portal</h1>

      {/* --- THE FORM --- */}
      <div style={{ background: "#070707ff", padding: "50px", borderRadius: "8px", marginBottom: "30px" }}>
        <h3>Register New Student</h3>
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          
          <input 
            type="text" 
            name="name" 
            placeholder="Student Name" 
            value={formData.name}
            onChange={handleChange}
            style={{ padding: "8px", flex: "1" }}
          />
          
          <input 
            type="number" 
            name="student_id" 
            placeholder="ID (e.g. 2024001)" 
            value={formData.student_id}
            onChange={handleChange}
            style={{ padding: "8px", width: "150px" }}
          />
          
          <input 
            type="text" 
            name="department" 
            placeholder="Department (CSE)" 
            value={formData.department}
            onChange={handleChange}
            style={{ padding: "8px", width: "150px" }}
          />

          <button 
            type="submit" 
            style={{ padding: "8px 16px", background: "#007bff", color: "white", border: "none", cursor: "pointer" }}
          >
            Add Student
          </button>
        </form>
      </div>

      {/* --- THE TABLE --- */}
      <h3>Student Directory</h3>
      <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr style={{ background: "#070606ff" }}>
            <th>ID</th>
            <th>Name</th>
            <th>Student ID</th>
            <th>Department</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td>{student.id}</td>
              <td>{student.name}</td>
              <td>{student.student_id}</td>
              <td>{student.department}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default App