import { useState, useEffect } from "react";

// --- ICONS ---
const UsersIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const TrashIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const ChartIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;

function App() {
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({ total: 0, cse: 0, entc: 0, other: 0 });
  const [formData, setFormData] = useState({ name: "", student_id: "", department: "" });

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch both Students AND Stats
  const fetchData = async () => {
    try {
      const studentRes = await fetch("http://127.0.0.1:8000/students/");
      const statsRes = await fetch("http://127.0.0.1:8000/stats");
      
      const studentData = await studentRes.json();
      const statsData = await statsRes.json();

      setStudents(studentData);
      setStats(statsData);
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
      fetchData(); // Refresh everything
      setFormData({ name: "", student_id: "", department: "" });
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this student?")) return;
    try {
      await fetch(`http://127.0.0.1:8000/students/${id}`, { method: "DELETE" });
      fetchData(); // Refresh everything
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
          <div className="flex items-center gap-3 px-4 py-3 bg-blue-600 rounded-lg text-white cursor-pointer shadow-lg shadow-blue-900/20">
            <UsersIcon /> <span className="font-medium">Students</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 rounded-lg cursor-pointer transition">
            <ChartIcon /> <span className="font-medium">Analytics</span>
          </div>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto">
        
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">Dashboard</h2>
            <p className="text-slate-500 mt-1">Real-time campus overview.</p>
          </div>
        </header>

        {/* --- NEW: STATS CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Card 1: Total */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-slate-500 text-sm font-medium uppercase">Total Students</div>
            <div className="text-3xl font-bold text-slate-800 mt-2">{stats.total}</div>
          </div>
          {/* Card 2: CSE */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 bg-blue-50">
            <div className="text-blue-600 text-sm font-medium uppercase">CSE Dept</div>
            <div className="text-3xl font-bold text-blue-700 mt-2">{stats.cse}</div>
          </div>
          {/* Card 3: ENTC */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-100 bg-purple-50">
            <div className="text-purple-600 text-sm font-medium uppercase">ENTC Dept</div>
            <div className="text-3xl font-bold text-purple-700 mt-2">{stats.entc}</div>
          </div>
           {/* Card 4: Other */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-slate-500 text-sm font-medium uppercase">Other Depts</div>
            <div className="text-3xl font-bold text-slate-800 mt-2">{stats.other}</div>
          </div>
        </div>

        {/* REGISTER FORM */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-gray-100 pb-2">Register New Student</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
              <input className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" type="text" placeholder="e.g. John Doe" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Student ID</label>
              <input className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" type="number" placeholder="e.g. 2024001" value={formData.student_id} onChange={(e) => setFormData({...formData, student_id: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Department</label>
              <select className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})}>
                <option value="">Select Dept</option>
                <option value="CSE">CSE</option>
                <option value="ENTC">ENTC</option>
                <option value="IT">IT</option>
                <option value="MECH">MECH</option>
              </select>
            </div>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition shadow-md">+ Add</button>
          </form>
        </div>

        {/* STUDENT TABLE */}
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
                <tr key={student.id} className="hover:bg-blue-50 transition">
                  <td className="px-6 py-4 text-slate-500">#{student.id}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{student.name}</td>
                  <td className="px-6 py-4 text-slate-600 font-mono text-sm">{student.student_id}</td>
                  <td className="px-6 py-4"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{student.department}</span></td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(student.id)} className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition"><TrashIcon /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default App;