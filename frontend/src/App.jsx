import { useState, useEffect } from 'react'

function App() {
  // 1. STATE: Where we store the data coming from the backend
  const [students, setStudents] = useState([])

  // 2. EFFECT: Run this automatically when the page loads
  useEffect(() => {
    fetchStudents()
  }, [])

  // 3. FUNCTION: The actual code that calls the API
  const fetchStudents = async () => {
    try {
      // "fetch" is the JavaScript tool to make requests
      const response = await fetch("http://127.0.0.1:8000/students/")
      const data = await response.json()
      console.log("Data received:", data) // Check your browser console!
      setStudents(data) // Save the data to our state
    } catch (error) {
      console.error("Error fetching students:", error)
    }
  }

  // 4. THE UI: What the user sees
  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>🎓 Smart Campus Student Portal</h1>
      <p>Total Students: {students.length}</p>

      {/* A Simple Table to display data */}
      <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr style={{ background: "#782222ff" }}>
            <th>ID</th>
            <th>Name</th>
            <th>Student ID</th>
            <th>Department</th>
          </tr>
        </thead>
        <tbody>
          {/* Loop through the students list and create a row for each */}
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