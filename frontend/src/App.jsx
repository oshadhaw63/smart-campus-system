import { useState, useEffect } from "react";

// --- ICONS ---
const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
);
const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
);

function App() {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({ name: "", student_id: "", department: "" });

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/students/");
      const data = await res.json();
      setStudents(data);
    } catch (error) { console.error(error); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.student_id || !formData.department) return;
    try {
      await fetch("http://127.0.0.1:8000/students/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      fetchStudents();
      setFormData({ name: "", student_id: "", department: "" });
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this student?")) return;
    try {
      await fetch(`http://127.0.0.1:8000/students/${id}`, { method: "DELETE" });
      fetchStudents();
    } catch (error) { console.error(error); }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold text-blue-400 tracking-tight">🎓 SmartCampus</h1>
          <p className="text-xs text-slate-400 mt-1">University Management</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <div className="flex items-center gap-3 px-4 py-3 bg-blue-600 rounded-lg text-white cursor-pointer transition shadow-lg shadow-blue-900/20">
            <UsersIcon />
            <span className="font-medium">Students</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg cursor-pointer transition">
            <span>📚</span>
            <span className="font-medium">Courses</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg cursor-pointer transition">
            <span>⚙️</span>
            <span className="font-medium">Settings</span>
          </div>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <div className="text-xs text-slate-500 text-center">v1.0.0 Beta</div>
        </div>
      </aside>

      {/* MAIN CONTENT Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">Student Directory</h2>
            <p className="text-slate-500 mt-1">Manage student registrations and academic records.</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200 text-sm text-slate-600">
            Current Session: <span className="font-semibold text-blue-600">Spring 2026</span>
          </div>
        </header>

        {/* SECTION 1: ADD STUDENT FORM */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-gray-100 pb-2">Register New Student</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
              <input 
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                type="text" placeholder="e.g. John Doe" 
                value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Student ID</label>
              <input 
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                type="number" placeholder="e.g. 2024001" 
                value={formData.student_id} onChange={(e) => setFormData({...formData, student_id: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Department</label>
              <select 
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})}
              >
                <option value="">Select Dept</option>
                <option value="CSE">CSE</option>
                <option value="ENTC">ENTC</option>
                <option value="IT">IT</option>
                <option value="MECH">MECH</option>
              </select>
            </div>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition shadow-md hover:shadow-lg active:scale-95 transform">
              + Add Student
            </button>
          </form>
        </div>

        {/* SECTION 2: TABLE */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-200 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Student ID</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-blue-50 transition duration-150">
                  <td className="px-6 py-4 text-slate-500">#{student.id}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{student.name}</td>
                  <td className="px-6 py-4 text-slate-600 font-mono text-sm">{student.student_id}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                      {student.department}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(student.id)}
                      className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition"
                      title="Delete Student"
                    >
                      <TrashIcon />
                    </button>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-slate-400">
                    No students found. Add one above!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </main>
    </div>
  );
}

export default App;