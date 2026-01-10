import { useState, useEffect } from "react";

// --- ICONS ---
const UsersIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const BookIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
const TrashIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

function App() {
  const [activeTab, setActiveTab] = useState("students"); // Navigation State
  const [stats, setStats] = useState({ total: 0, courses: 0, cse: 0, entc: 0 });
  
  // Data States
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);

  // Form States
  const [studentForm, setStudentForm] = useState({ name: "", student_id: "", department: "" });
  const [courseForm, setCourseForm] = useState({ name: "", code: "", credits: 3 });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [sRes, cRes, statsRes] = await Promise.all([
        fetch("http://127.0.0.1:8000/students/"),
        fetch("http://127.0.0.1:8000/courses/"),
        fetch("http://127.0.0.1:8000/stats")
      ]);
      setStudents(await sRes.json());
      setCourses(await cRes.json());
      setStats(await statsRes.json());
    } catch (err) { console.error(err); }
  };

  // --- SUBMIT HANDLERS ---
  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!studentForm.name) return;
    await fetch("http://127.0.0.1:8000/students/", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(studentForm)
    });
    setStudentForm({ name: "", student_id: "", department: "" });
    fetchData();
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (!courseForm.name) return;
    await fetch("http://127.0.0.1:8000/courses/", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(courseForm)
    });
    setCourseForm({ name: "", code: "", credits: 3 });
    fetchData();
  };

  const handleDelete = async (endpoint, id) => {
    if (!confirm("Are you sure?")) return;
    await fetch(`http://127.0.0.1:8000/${endpoint}/${id}`, { method: "DELETE" });
    fetchData();
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold text-blue-400">🎓 SmartCampus</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <div onClick={() => setActiveTab("students")} 
               className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition ${activeTab === 'students' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>
            <UsersIcon /> <span className="font-medium">Students</span>
          </div>
          <div onClick={() => setActiveTab("courses")} 
               className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition ${activeTab === 'courses' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>
            <BookIcon /> <span className="font-medium">Courses</span>
          </div>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800">
            {activeTab === 'students' ? 'Student Directory' : 'Course Management'}
          </h2>
          {/* Top Stats Bar */}
          <div className="flex gap-4">
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border text-sm">Students: <b>{stats.total}</b></div>
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border text-sm">Courses: <b>{stats.courses}</b></div>
          </div>
        </header>

        {/* --- STUDENTS VIEW --- */}
        {activeTab === 'students' && (
          <>
            {/* Add Student Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Register Student</h3>
              <form onSubmit={handleAddStudent} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <input className="input-field" type="text" placeholder="Name" value={studentForm.name} onChange={e => setStudentForm({...studentForm, name: e.target.value})} />
                <input className="input-field" type="number" placeholder="ID" value={studentForm.student_id} onChange={e => setStudentForm({...studentForm, student_id: e.target.value})} />
                <select className="input-field" value={studentForm.department} onChange={e => setStudentForm({...studentForm, department: e.target.value})}>
                  <option value="">Dept</option><option>CSE</option><option>ENTC</option><option>IT</option>
                </select>
                <button type="submit" className="btn-primary">+ Add</button>
              </form>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
                  <tr><th className="px-6 py-4">Name</th><th className="px-6 py-4">ID</th><th className="px-6 py-4">Dept</th><th className="px-6 py-4 text-right">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {students.map(s => (
                    <tr key={s.id} className="hover:bg-blue-50">
                      <td className="px-6 py-4 font-medium">{s.name}</td>
                      <td className="px-6 py-4 text-slate-600">{s.student_id}</td>
                      <td className="px-6 py-4"><span className="badge">{s.department}</span></td>
                      <td className="px-6 py-4 text-right"><button onClick={() => handleDelete('students', s.id)} className="text-red-400 hover:text-red-600"><TrashIcon /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* --- COURSES VIEW --- */}
        {activeTab === 'courses' && (
          <>
            {/* Add Course Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Create New Course</h3>
              <form onSubmit={handleAddCourse} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <input className="input-field" type="text" placeholder="Course Name (e.g. Data Structures)" value={courseForm.name} onChange={e => setCourseForm({...courseForm, name: e.target.value})} />
                <input className="input-field" type="text" placeholder="Code (e.g. CS2012)" value={courseForm.code} onChange={e => setCourseForm({...courseForm, code: e.target.value})} />
                <input className="input-field" type="number" placeholder="Credits" value={courseForm.credits} onChange={e => setCourseForm({...courseForm, credits: e.target.value})} />
                <button type="submit" className="btn-primary">+ Create Course</button>
              </form>
            </div>

            {/* Courses Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
                  <tr><th className="px-6 py-4">Course Name</th><th className="px-6 py-4">Code</th><th className="px-6 py-4">Credits</th><th className="px-6 py-4 text-right">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {courses.map(c => (
                    <tr key={c.id} className="hover:bg-green-50">
                      <td className="px-6 py-4 font-medium">{c.name}</td>
                      <td className="px-6 py-4 text-slate-600 font-mono">{c.code}</td>
                      <td className="px-6 py-4">{c.credits}</td>
                      <td className="px-6 py-4 text-right"><button onClick={() => handleDelete('courses', c.id)} className="text-red-400 hover:text-red-600"><TrashIcon /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {courses.length === 0 && <div className="p-8 text-center text-slate-400">No courses yet. Add one!</div>}
            </div>
          </>
        )}
      </main>
      
      {/* CSS Utility Classes (Embedded for cleaner JSX) */}
      <style>{`
        .input-field { width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; outline: none; }
        .input-field:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
        .btn-primary { background-color: #2563eb; color: white; padding: 10px 20px; border-radius: 8px; font-weight: 600; transition: all 0.2s; }
        .btn-primary:hover { background-color: #1d4ed8; transform: translateY(-1px); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .badge { padding: 4px 10px; background-color: #dbeafe; color: #1e40af; border-radius: 9999px; font-size: 0.85rem; font-weight: 500; }
      `}</style>
    </div>
  );
}

export default App;