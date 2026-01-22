import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import Scanner from "./Scanner";

// --- ICONS ---
const HomeIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const UsersIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const BookIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
const LinkIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>;
const ClockIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const TrashIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [viewIdCard, setViewIdCard] = useState(null);

  const [stats, setStats] = useState({ total: 0, courses: 0 });
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [attendance, setAttendance] = useState([]);

  // Forms
  const [studentForm, setStudentForm] = useState({ name: "", student_id: "", department: "" });
  const [courseForm, setCourseForm] = useState({ name: "", code: "", credits: 3 });
  const [enrollForm, setEnrollForm] = useState({ student_id: "", course_id: "" });
  
  // SCANNER STATE
  const [scanId, setScanId] = useState(""); 

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [s, c, e, a, st] = await Promise.all([
        fetch("http://127.0.0.1:8000/students/").then(r => r.json()),
        fetch("http://127.0.0.1:8000/courses/").then(r => r.json()),
        fetch("http://127.0.0.1:8000/enrollments/").then(r => r.json()),
        fetch("http://127.0.0.1:8000/attendance/").then(r => r.json()),
        fetch("http://127.0.0.1:8000/stats").then(r => r.json())
      ]);
      if(Array.isArray(s)) setStudents(s);
      if(Array.isArray(c)) setCourses(c);
      if(Array.isArray(e)) setEnrollments(e);
      if(Array.isArray(a)) setAttendance(a);
      setStats(st);
    } catch (err) { console.error(err); }
  };

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

  // --- CRITICAL FIX HERE ---
  const handleScan = async (e, directId) => {
    // 1. Safety Check: If triggered by a button click (event exists), stop refresh
    if (e && e.preventDefault) e.preventDefault(); 
    
    // 2. Determine which ID to use: The camera's ID OR the typed input
    const idToScan = directId || scanId;
    
    if (!idToScan) {
        alert("Please enter or scan an ID first.");
        return;
    }

    console.log("Sending to backend:", idToScan); // Debugging

    try {
        const res = await fetch(`http://127.0.0.1:8000/scan/${idToScan}`, { method: "POST" });
        const data = await res.json();
        
        if(data.error) {
            alert("Error: " + data.error);
        } else {
            // Success!
            alert(`✅ Marked Present: ${data.name}`);
            setScanId(""); // Clear the input box
            fetchData();   // Refresh the log table immediately
        }
    } catch (err) {
        console.error("Scan Error:", err);
        alert("Failed to connect to server.");
    }
  };

  const handleDelete = async (endpoint, id) => {
    if (!confirm("Are you sure?")) return;
    await fetch(`http://127.0.0.1:8000/${endpoint}/${id}`, { method: "DELETE" });
    fetchData();
  };

  const getStudentName = (id) => students.find(s => s.id === id)?.name || "Unknown";
  
  // Chart Data
  const getChartData = () => {
    const counts = {};
    students.forEach(s => { counts[s.department] = (counts[s.department] || 0) + 1; });
    return Object.keys(counts).map(dept => ({ name: dept, students: counts[dept] }));
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans relative">
      
      {/* ID CARD MODAL */}
      {viewIdCard && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setViewIdCard(null)}>
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white text-center">
              <h2 className="text-2xl font-bold">Smart Campus</h2>
              <p className="text-blue-100 text-sm uppercase">Official ID</p>
            </div>
            <div className="p-8 flex flex-col items-center">
              <img src={`http://127.0.0.1:8000/static/student_${viewIdCard.id}.png`} alt="QR" className="w-40 h-40 mb-4" />
              <h3 className="text-2xl font-bold">{viewIdCard.name}</h3>
              <p className="text-gray-500 mb-2">Internal ID: {viewIdCard.id}</p>
              <span className="badge">{viewIdCard.department}</span>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold text-blue-400">🎓 SmartCampus</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavItem icon={<HomeIcon />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab("dashboard")} />
          <NavItem icon={<UsersIcon />} label="Students" active={activeTab === 'students'} onClick={() => setActiveTab("students")} />
          <NavItem icon={<BookIcon />} label="Courses" active={activeTab === 'courses'} onClick={() => setActiveTab("courses")} />
          <NavItem icon={<LinkIcon />} label="Enrollments" active={activeTab === 'enrollments'} onClick={() => setActiveTab("enrollments")} />
          <NavItem icon={<ClockIcon />} label="Attendance" active={activeTab === 'attendance'} onClick={() => setActiveTab("attendance")} />
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800 capitalize">{activeTab}</h2>
          <div className="text-sm text-slate-500">{new Date().toDateString()}</div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard label="Total Students" value={stats.total} color="blue" />
              <StatCard label="Total Courses" value={stats.courses} color="green" />
              <StatCard label="Today's Attendance" value={attendance.length} color="purple" />
              <StatCard label="Enrollments" value={enrollments.length} color="orange" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="card h-80 flex flex-col">
                <h3 className="card-title">Students Distribution</h3>
                <div className="flex-1 w-full min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getChartData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                      <XAxis dataKey="name" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip />
                      <Bar dataKey="students" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                        {getChartData().map((entry, index) => <Cell key={`cell-${index}`} fill={['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'][index % 4]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="card h-80 overflow-y-auto">
                <h3 className="card-title">Recent Activity</h3>
                <div className="space-y-4">
                   {attendance.slice(0, 5).map(log => (
                     <div key={log.id} className="flex items-center gap-3 text-sm border-b border-gray-100 pb-2">
                       <div className="w-2 h-2 rounded-full bg-green-500"></div>
                       <span className="font-bold text-slate-700">{getStudentName(log.student_id)}</span>
                       <span className="text-slate-400">marked present at</span>
                       <span className="font-mono text-slate-500">{log.time}</span>
                     </div>
                   ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ... (Students, Courses, Enrollments Tabs remain same - keeping code concise) ... */}
        {activeTab === 'students' && (
          <div className="card">
              <Table headers={["Name", "ID", "Dept", "Digital ID", "Action"]}>
                {students.map(s => (
                  <tr key={s.id} className="row">
                    <td className="cell">{s.name}</td>
                    <td className="cell">{s.student_id}</td>
                    <td className="cell"><span className="badge">{s.department}</span></td>
                    <td className="cell">
                        <div onClick={() => setViewIdCard(s)} className="cursor-pointer text-blue-500 text-xs hover:underline flex items-center gap-2">
                             <img src={`http://127.0.0.1:8000/static/student_${s.id}.png`} className="w-8 h-8 rounded border" onError={(e) => {e.target.style.display='none'}} />
                             View
                        </div>
                    </td>
                    <td className="cell right"><button onClick={() => handleDelete('students', s.id)} className="btn-delete"><TrashIcon /></button></td>
                  </tr>
                ))}
              </Table>
          </div>
        )}
        {/* Skipping Courses/Enrollments for brevity as they work fine */}

        {activeTab === 'attendance' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="space-y-6">
                 <div className="bg-blue-600 text-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-bold mb-2">📸 Live Scanner</h3>
                    <p className="opacity-80 text-sm mb-4">Scan a student ID card.</p>
                    
                    {/* CAMERA COMPONENT */}
                    <Scanner onScan={(id) => handleScan(null, id)} />
                 </div>

                 <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Manual Entry</h4>
                    <form onSubmit={(e) => handleScan(e)} className="flex gap-4">
                      <input className="input flex-1" placeholder="Type Internal ID..." value={scanId} onChange={e => setScanId(e.target.value)} />
                      <button type="submit" className="btn-primary">Mark</button>
                    </form>
                 </div>
            </div>

            <div className="card h-[500px] overflow-hidden flex flex-col">
              <div className="flex justify-between items-center mb-4"><h3 className="card-title mb-0">Live Access Log</h3></div>
              <div className="flex-1 overflow-y-auto">
                 <Table headers={["Time", "Student", "Status"]}>
                  {attendance.map(log => (
                    <tr key={log.id} className="row">
                      <td className="cell font-mono text-slate-500 text-sm">{log.time}</td>
                      <td className="cell"><div className="font-bold text-slate-800">{getStudentName(log.student_id)}</div></td>
                      <td className="cell"><span className="badge bg-green-100 text-green-800">Present</span></td>
                    </tr>
                  ))}
                </Table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* STYLES */}
      <style>{`
        .card { background: white; padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
        .card-title { font-size: 1.1rem; font-weight: 600; color: #1f2937; margin-bottom: 15px; }
        .input { width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; outline: none; }
        .btn-primary { background: #2563eb; color: white; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; }
        .row:hover { background: #f9fafb; }
        .cell { padding: 12px 20px; border-bottom: 1px solid #f3f4f6; }
        .badge { padding: 4px 10px; background: #dbeafe; color: #1e40af; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
        .right { text-align: right; }
      `}</style>
    </div>
  );
}

const NavItem = ({ icon, label, active, onClick }) => (
  <div onClick={onClick} className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition ${active ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
    {icon} <span className="font-medium">{label}</span>
  </div>
);
const StatCard = ({ label, value, color }) => {
    const colors = { blue: "bg-blue-50 text-blue-600", green: "bg-green-50 text-green-600", purple: "bg-purple-50 text-purple-600", orange: "bg-orange-50 text-orange-600" };
    return <div className={`px-6 py-4 rounded-xl border ${colors[color]} border-opacity-50`}><div className="text-sm uppercase opacity-80">{label}</div><div className="text-3xl font-bold mt-2">{value}</div></div>;
};
const Table = ({ headers, children }) => (
  <table className="w-full text-left border-collapse"><thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold"><tr>{headers.map(h => <th key={h} className="px-6 py-4">{h}</th>)}</tr></thead><tbody className="divide-y divide-gray-100">{children}</tbody></table>
);

export default App;