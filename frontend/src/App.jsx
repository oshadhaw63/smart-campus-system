import { useState, useEffect } from "react";

// --- ICONS ---
const UsersIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const BookIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
const LinkIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>;
const TrashIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

function App() {
  const [activeTab, setActiveTab] = useState("students");
  const [stats, setStats] = useState({ total: 0, courses: 0, cse: 0, entc: 0 });
  
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);

  // Forms
  const [studentForm, setStudentForm] = useState({ name: "", student_id: "", department: "" });
  const [courseForm, setCourseForm] = useState({ name: "", code: "", credits: 3 });
  const [enrollForm, setEnrollForm] = useState({ student_id: "", course_id: "" });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [s, c, e, st] = await Promise.all([
        fetch("http://127.0.0.1:8000/students/").then(r => r.json()),
        fetch("http://127.0.0.1:8000/courses/").then(r => r.json()),
        fetch("http://127.0.0.1:8000/enrollments/").then(r => r.json()),
        fetch("http://127.0.0.1:8000/stats").then(r => r.json())
      ]);
      if(Array.isArray(s)) setStudents(s);
      if(Array.isArray(c)) setCourses(c);
      if(Array.isArray(e)) setEnrollments(e);
      setStats(st);
    } catch (err) { console.error(err); }
  };

  // --- SUBMIT HANDLERS ---
  const handleGenericSubmit = async (endpoint, data, resetFn, resetData) => {
    await fetch(`http://127.0.0.1:8000/${endpoint}/`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
    });
    resetFn(resetData);
    fetchData();
  };

  const handleEnroll = (e) => {
    e.preventDefault();
    if(!enrollForm.student_id || !enrollForm.course_id) return;
    handleGenericSubmit("enrollments", enrollForm, setEnrollForm, { student_id: "", course_id: "" });
  };

  const handleDelete = async (endpoint, id) => {
    if (!confirm("Are you sure?")) return;
    await fetch(`http://127.0.0.1:8000/${endpoint}/${id}`, { method: "DELETE" });
    fetchData();
  };

  // Helper to find name by ID
  const getStudentName = (id) => students.find(s => s.id === id)?.name || "Unknown Student";
  const getCourseName = (id) => courses.find(c => c.id === id)?.name || "Unknown Course";

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold text-blue-400">🎓 SmartCampus</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavItem icon={<UsersIcon />} label="Students" active={activeTab === 'students'} onClick={() => setActiveTab("students")} />
          <NavItem icon={<BookIcon />} label="Courses" active={activeTab === 'courses'} onClick={() => setActiveTab("courses")} />
          <NavItem icon={<LinkIcon />} label="Enrollments" active={activeTab === 'enrollments'} onClick={() => setActiveTab("enrollments")} />
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800 capitalize">{activeTab} Manager</h2>
          <div className="flex gap-4">
             <StatCard label="Students" value={stats.total} />
             <StatCard label="Courses" value={stats.courses} />
             <StatCard label="Enrollments" value={enrollments.length} />
          </div>
        </header>

        {/* --- STUDENTS VIEW --- */}
        {activeTab === 'students' && (
          <>
            <div className="card mb-8">
              <h3 className="card-title">Register Student</h3>
              <form onSubmit={(e) => {e.preventDefault(); handleGenericSubmit("students", studentForm, setStudentForm, {name:"", student_id:"", department:""})}} className="form-grid">
                <input className="input" placeholder="Name" value={studentForm.name} onChange={e => setStudentForm({...studentForm, name: e.target.value})} />
                <input className="input" placeholder="ID" type="number" value={studentForm.student_id} onChange={e => setStudentForm({...studentForm, student_id: e.target.value})} />
                <select className="input" value={studentForm.department} onChange={e => setStudentForm({...studentForm, department: e.target.value})}>
                  <option value="">Dept</option><option>CSE</option><option>ENTC</option><option>IT</option>
                </select>
                <button type="submit" className="btn-primary">+ Add</button>
              </form>
            </div>
            <div className="card">
              <Table headers={["Name", "ID", "Dept", "Action"]}>
                {students.map(s => (
                  <tr key={s.id} className="row">
                    <td className="cell">{s.name}</td>
                    <td className="cell">{s.student_id}</td>
                    <td className="cell"><span className="badge">{s.department}</span></td>
                    <td className="cell right"><button onClick={() => handleDelete('students', s.id)} className="btn-delete"><TrashIcon /></button></td>
                  </tr>
                ))}
              </Table>
            </div>
          </>
        )}

        {/* --- COURSES VIEW --- */}
        {activeTab === 'courses' && (
          <>
            <div className="card mb-8">
              <h3 className="card-title">Create Course</h3>
              <form onSubmit={(e) => {e.preventDefault(); handleGenericSubmit("courses", courseForm, setCourseForm, {name:"", code:"", credits:3})}} className="form-grid">
                <input className="input" placeholder="Course Name" value={courseForm.name} onChange={e => setCourseForm({...courseForm, name: e.target.value})} />
                <input className="input" placeholder="Code (CS101)" value={courseForm.code} onChange={e => setCourseForm({...courseForm, code: e.target.value})} />
                <button type="submit" className="btn-primary">+ Create</button>
              </form>
            </div>
            <div className="card">
              <Table headers={["Course", "Code", "Credits", "Action"]}>
                {courses.map(c => (
                  <tr key={c.id} className="row">
                    <td className="cell">{c.name}</td>
                    <td className="cell">{c.code}</td>
                    <td className="cell">{c.credits}</td>
                    <td className="cell right"><button onClick={() => handleDelete('courses', c.id)} className="btn-delete"><TrashIcon /></button></td>
                  </tr>
                ))}
              </Table>
            </div>
          </>
        )}

        {/* --- ENROLLMENTS VIEW --- */}
        {activeTab === 'enrollments' && (
          <>
            <div className="card mb-8">
              <h3 className="card-title">Enroll Student in Course</h3>
              <form onSubmit={handleEnroll} className="form-grid">
                {/* Dropdown for Students */}
                <select className="input" value={enrollForm.student_id} onChange={e => setEnrollForm({...enrollForm, student_id: e.target.value})}>
                  <option value="">Select Student...</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.student_id})</option>)}
                </select>

                {/* Dropdown for Courses */}
                <select className="input" value={enrollForm.course_id} onChange={e => setEnrollForm({...enrollForm, course_id: e.target.value})}>
                  <option value="">Select Course...</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                </select>
                
                <button type="submit" className="btn-primary">Enroll Now</button>
              </form>
            </div>

            <div className="card">
              <Table headers={["Student Name", "Course Name", "Status"]}>
                {enrollments.map(e => (
                  <tr key={e.id} className="row">
                    <td className="cell font-bold">{getStudentName(e.student_id)}</td>
                    <td className="cell text-blue-600">{getCourseName(e.course_id)}</td>
                    <td className="cell"><span className="badge bg-green-100 text-green-800">Enrolled</span></td>
                  </tr>
                ))}
              </Table>
              {enrollments.length === 0 && <div className="p-4 text-center text-gray-400">No enrollments yet.</div>}
            </div>
          </>
        )}
      </main>

      {/* --- STYLES & COMPONENTS --- */}
      <style>{`
        .card { background: white; padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
        .card-title { font-size: 1.1rem; font-weight: 600; color: #1f2937; margin-bottom: 15px; }
        .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; align-items: end; }
        .input { width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; outline: none; }
        .input:focus { border-color: #2563eb; ring: 2px; }
        .btn-primary { background: #2563eb; color: white; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; }
        .btn-primary:hover { background: #1d4ed8; }
        .btn-delete { color: #9ca3af; cursor: pointer; }
        .btn-delete:hover { color: #ef4444; }
        .row:hover { background: #f9fafb; }
        .cell { padding: 12px 20px; border-bottom: 1px solid #f3f4f6; }
        .badge { padding: 4px 10px; background: #dbeafe; color: #1e40af; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
        .right { text-align: right; }
      `}</style>
    </div>
  );
}

// Sub-components to keep code clean
const NavItem = ({ icon, label, active, onClick }) => (
  <div onClick={onClick} className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition ${active ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
    {icon} <span className="font-medium">{label}</span>
  </div>
);
const StatCard = ({ label, value }) => (
  <div className="bg-white px-5 py-2 rounded-lg shadow-sm border text-sm flex flex-col items-center">
    <span className="text-slate-400 text-xs uppercase">{label}</span>
    <span className="font-bold text-lg text-slate-800">{value}</span>
  </div>
);
const Table = ({ headers, children }) => (
  <table className="w-full text-left border-collapse">
    <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
      <tr>{headers.map(h => <th key={h} className="px-6 py-4">{h}</th>)}</tr>
    </thead>
    <tbody className="divide-y divide-gray-100">{children}</tbody>
  </table>
);

export default App;