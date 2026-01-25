import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import Scanner from "./Scanner";

// --- ICONS ---
const MenuIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>;
const CloseIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>;
const HomeIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const UsersIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const BookIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
const LinkIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>;
const ClockIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const TrashIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const LockIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;

function App() {
  // --- AUTH STATE ---
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");

  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile Menu State

  // App State
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
  const [scanId, setScanId] = useState(""); 

  useEffect(() => { 
    fetchData(); 
  }, []);

  const fetchData = async () => {
    try {
      const sRes = await fetch("https://smart-campus-backend.onrender.com/students/");
      const cRes = await fetch("https://smart-campus-backend.onrender.com/courses/");
      const eRes = await fetch("https://smart-campus-backend.onrender.com/enrollments/");
      const aRes = await fetch("https://smart-campus-backend.onrender.com/attendance/");
      const stRes = await fetch("https://smart-campus-backend.onrender.com/stats");

      if (sRes.ok) setStudents(await sRes.json());
      if (cRes.ok) setCourses(await cRes.json());
      if (eRes.ok) setEnrollments(await eRes.json());
      if (aRes.ok) setAttendance(await aRes.json());
      if (stRes.ok) setStats(await stRes.json());
    } catch (err) { console.error("Error fetching data:", err); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    const formData = new URLSearchParams();
    formData.append('username', loginForm.username);
    formData.append('password', loginForm.password);

    try {
        const res = await fetch("https://smart-campus-backend.onrender.com/token", {
            method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: formData
        });
        if (!res.ok) throw new Error("Invalid Credentials");
        const data = await res.json();
        setToken(data.access_token);
        localStorage.setItem("token", data.access_token);
        setLoginForm({ username: "", password: "" });
        setActiveTab("dashboard");
    } catch (err) { setLoginError("Login Failed: Incorrect username or password."); }
  };

  const handleLogout = () => {
      setToken(""); localStorage.removeItem("token"); setActiveTab("dashboard"); setIsSidebarOpen(false);
  };

  const handleGenericSubmit = async (endpoint, data, resetFn, resetData) => {
    if (!token) { alert("Please log in first!"); return; }
    const res = await fetch(`https://smart-campus-backend.onrender.com/${endpoint}/`, {
      method: "POST", 
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }, 
      body: JSON.stringify(data)
    });
    if (res.status === 401) { alert("Session expired."); handleLogout(); return; }
    if (!res.ok) { alert("Error submitting data"); return; }
    resetFn(resetData); fetchData();
  };

  const handleEnroll = (e) => {
    e.preventDefault();
    if(!enrollForm.student_id || !enrollForm.course_id) return;
    handleGenericSubmit("enrollments", enrollForm, setEnrollForm, { student_id: "", course_id: "" });
  };

  const handleDelete = async (endpoint, id) => {
    if (!token) { alert("Access Denied."); return; }
    if (!confirm("Are you sure?")) return;
    const res = await fetch(`https://smart-campus-backend.onrender.com/${endpoint}/${id}`, { 
        method: "DELETE", headers: { "Authorization": `Bearer ${token}` }
    });
    if (res.status === 401) { alert("Session expired."); handleLogout(); return; }
    fetchData();
  };

  const handleScan = async (e, directId) => {
    if (e && e.preventDefault) e.preventDefault(); 
    const idToScan = directId || scanId;
    if (!idToScan) return;
    try {
        const res = await fetch(`https://smart-campus-backend.onrender.com/scan/${idToScan}`, { method: "POST" });
        const data = await res.json();
        if(data.error) alert("Error: " + data.error);
        else { alert(`✅ Marked Present: ${data.name}`); setScanId(""); fetchData(); }
    } catch (err) { alert("Failed to connect."); }
  };

  const getStudentName = (id) => students.find(s => s.id === id)?.name || "Unknown";
  const getCourseName = (id) => courses.find(c => c.id === id)?.name || "Unknown";
  const getChartData = () => {
    const counts = {}; students.forEach(s => { counts[s.department] = (counts[s.department] || 0) + 1; });
    return Object.keys(counts).map(dept => ({ name: dept, students: counts[dept] }));
  };

  // Helper to close menu when clicking a link on mobile
  const navClick = (tab) => { setActiveTab(tab); setIsSidebarOpen(false); };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 font-sans relative">
      
      {/* MOBILE HEADER */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center shadow-md z-40 sticky top-0">
          <div className="flex items-center gap-2 font-bold text-lg"><span className="text-blue-400">🎓</span> SmartCampus</div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded hover:bg-slate-800 transition">
              {isSidebarOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
      </div>

      {/* ID CARD MODAL */}
      {viewIdCard && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[60] p-4 backdrop-blur-sm" onClick={() => setViewIdCard(null)}>
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-sm w-full relative" onClick={e => e.stopPropagation()}>
              <button className="absolute top-2 right-2 p-2 bg-gray-100 rounded-full" onClick={() => setViewIdCard(null)}><CloseIcon /></button>
              <img src={`https://smart-campus-backend.onrender.com/static/student_${viewIdCard.id}.png`} alt="QR" className="w-full object-contain p-8" />
              <div className="text-center pb-6 font-bold text-lg">{viewIdCard.name}</div>
          </div>
        </div>
      )}

      {/* SIDEBAR (Responsive) */}
      <aside className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col shadow-2xl transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 md:static md:h-screen md:shadow-none
      `}>
        <div className="p-6 border-b border-slate-800 hidden md:block">
          <h1 className="text-2xl font-bold text-blue-400">🎓 SmartCampus</h1>
          <div className="mt-2 text-xs text-slate-500 uppercase font-semibold">
              {token ? "🟢 Admin Mode" : "⚪ Guest Mode"}
          </div>
        </div>
        
        {/* Mobile-only User Status */}
        <div className="md:hidden p-4 bg-slate-800 text-xs text-center text-slate-400 uppercase font-bold tracking-wider">
             {token ? "Logged in as Admin" : "Guest View"}
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavItem icon={<HomeIcon />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => navClick("dashboard")} />
          <NavItem icon={<UsersIcon />} label="Students" active={activeTab === 'students'} onClick={() => navClick("students")} />
          <NavItem icon={<BookIcon />} label="Courses" active={activeTab === 'courses'} onClick={() => navClick("courses")} />
          <NavItem icon={<LinkIcon />} label="Enrollments" active={activeTab === 'enrollments'} onClick={() => navClick("enrollments")} />
          <NavItem icon={<ClockIcon />} label="Attendance" active={activeTab === 'attendance'} onClick={() => navClick("attendance")} />
        </nav>
        
        <div className="p-4 border-t border-slate-800">
            {token ? (
                <button onClick={handleLogout} className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg text-sm font-semibold transition">Logout</button>
            ) : (
                <button onClick={() => navClick("login")} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2"><LockIcon /> Admin Login</button>
            )}
        </div>
      </aside>

      {/* OVERLAY FOR MOBILE (Close sidebar when clicking outside) */}
      {isSidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>}

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-[calc(100vh-64px)] md:h-screen">
        <header className="flex justify-between items-center mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 capitalize">{activeTab === 'login' ? 'Admin Access' : activeTab}</h2>
        </header>

        {/* --- LOGIN TAB --- */}
        {activeTab === 'login' && !token && (
            <div className="flex justify-center items-center h-full min-h-[400px]">
                <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
                    <h3 className="text-2xl font-bold text-center mb-6 text-slate-800">System Login</h3>
                    {loginError && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm text-center">{loginError}</div>}
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-1">Username</label>
                            <input className="input" type="text" value={loginForm.username} onChange={e => setLoginForm({...loginForm, username: e.target.value})} placeholder="admin" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-1">Password</label>
                            <input className="input" type="password" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} placeholder="admin123" />
                        </div>
                        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition">Unlock System</button>
                    </form>
                    <p className="text-center text-xs text-gray-400 mt-6">Default: admin / admin123</p>
                </div>
            </div>
        )}

        {/* --- DASHBOARD --- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 md:space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <StatCard label="Students" value={stats.total} color="blue" />
              <StatCard label="Courses" value={stats.courses} color="green" />
              <StatCard label="Active" value={attendance.length} color="purple" />
              <StatCard label="Enrolled" value={enrollments.length} color="orange" />
            </div>
            <div className="card h-64 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getChartData()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                        <XAxis dataKey="name" fontSize={12} />
                        <YAxis fontSize={12} />
                        <Tooltip />
                        <Bar dataKey="students" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* --- STUDENTS --- */}
        {activeTab === 'students' && (
          <>
            {token && (
            <div className="card mb-6 md:mb-8">
              <h3 className="text-lg font-semibold mb-4 text-slate-700">Add New Student</h3>
              <form onSubmit={(e) => {e.preventDefault(); handleGenericSubmit("students", studentForm, setStudentForm, {name:"", student_id:"", department:""})}} 
                    className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="w-full">
                    <label className="text-xs font-bold text-gray-400 uppercase">Full Name</label>
                    <input className="input mt-1" placeholder="e.g. John Doe" value={studentForm.name} onChange={e => setStudentForm({...studentForm, name: e.target.value})} />
                </div>
                <div className="w-full">
                    <label className="text-xs font-bold text-gray-400 uppercase">Student ID</label>
                    <input className="input mt-1" placeholder="e.g. 2024001" type="number" value={studentForm.student_id} onChange={e => setStudentForm({...studentForm, student_id: e.target.value})} />
                </div>
                <div className="w-full">
                    <label className="text-xs font-bold text-gray-400 uppercase">Department</label>
                    <select className="input mt-1" value={studentForm.department} onChange={e => setStudentForm({...studentForm, department: e.target.value})}>
                        <option value="">Select Dept</option><option>CSE</option><option>ENTC</option><option>IT</option>
                    </select>
                </div>
                <button type="submit" className="btn-primary w-full h-[46px]">+ Add Student</button>
              </form>
            </div>
            )}
            
            <div className="card overflow-x-auto">
              <Table headers={["Name", "ID", "Dept", "Digital ID", "Action"]}>
                {students.map(s => (
                  <tr key={s.id} className="row">
                    <td className="cell whitespace-nowrap">{s.name}</td>
                    <td className="cell">{s.student_id}</td>
                    <td className="cell"><span className="badge">{s.department}</span></td>
                    <td className="cell"><button onClick={() => setViewIdCard(s)} className="text-blue-500 text-xs hover:underline whitespace-nowrap">View ID</button></td>
                    <td className="cell right">
                        {token && <button onClick={() => handleDelete('students', s.id)} className="btn-delete"><TrashIcon /></button>}
                    </td>
                  </tr>
                ))}
              </Table>
            </div>
          </>
        )}

        {/* --- COURSES --- */}
        {activeTab === 'courses' && (
           <>
            {token && (
            <div className="card mb-6 md:mb-8">
              <h3 className="text-lg font-semibold mb-4 text-slate-700">Create New Course</h3>
              <form onSubmit={(e) => {e.preventDefault(); handleGenericSubmit("courses", courseForm, setCourseForm, {name:"", code:"", credits:3})}} 
                    className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Course Name</label>
                    <input className="input mt-1" placeholder="e.g. Data Structures" value={courseForm.name} onChange={e => setCourseForm({...courseForm, name: e.target.value})} />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase">Course Code</label>
                    <input className="input mt-1" placeholder="e.g. CS101" value={courseForm.code} onChange={e => setCourseForm({...courseForm, code: e.target.value})} />
                </div>
                <button type="submit" className="btn-primary h-[46px] w-full">+ Create</button>
              </form>
            </div>
            )}
            <div className="card overflow-x-auto">
              <Table headers={["Course", "Code", "Credits", "Action"]}>
                {courses.map(c => (
                  <tr key={c.id} className="row">
                    <td className="cell whitespace-nowrap">{c.name}</td>
                    <td className="cell">{c.code}</td>
                    <td className="cell">{c.credits}</td>
                    <td className="cell right">
                        {token && <button onClick={() => handleDelete('courses', c.id)} className="btn-delete"><TrashIcon /></button>}
                    </td>
                  </tr>
                ))}
              </Table>
            </div>
          </>
        )}

        {/* --- ENROLLMENTS --- */}
        {activeTab === 'enrollments' && (
          <>
            {token && (
            <div className="card mb-6 md:mb-8">
              <h3 className="text-lg font-semibold mb-4 text-slate-700">Enroll Student</h3>
              <form onSubmit={handleEnroll} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase">Select Student</label>
                    <select className="input mt-1" value={enrollForm.student_id} onChange={e => setEnrollForm({...enrollForm, student_id: e.target.value})}>
                    <option value="">Select...</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase">Select Course</label>
                    <select className="input mt-1" value={enrollForm.course_id} onChange={e => setEnrollForm({...enrollForm, course_id: e.target.value})}>
                    <option value="">Select...</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <button type="submit" className="btn-primary h-[46px] w-full">Enroll Now</button>
              </form>
            </div>
            )}
            <div className="card overflow-x-auto">
              <Table headers={["Student", "Course", "Status"]}>
                {enrollments.map(e => (
                  <tr key={e.id} className="row">
                    <td className="cell font-bold whitespace-nowrap">{getStudentName(e.student_id)}</td>
                    <td className="cell text-blue-600 whitespace-nowrap">{getCourseName(e.course_id)}</td>
                    <td className="cell"><span className="badge bg-green-100 text-green-800">Enrolled</span></td>
                  </tr>
                ))}
              </Table>
            </div>
          </>
        )}

        {/* --- ATTENDANCE --- */}
        {activeTab === 'attendance' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
             {/* LEFT SIDE: SCANNER */}
             <div className="space-y-6">
                 <div className="bg-blue-600 text-white p-4 md:p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-bold mb-2">📸 Live Scanner</h3>
                    <p className="text-blue-200 text-sm mb-4">Automatically scan student ID cards.</p>
                    <Scanner onScan={(id) => handleScan(null, id)} />
                 </div>
                 
                 <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm">
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Manual Entry</label>
                    <form onSubmit={(e) => handleScan(e)} className="flex gap-4">
                      <input className="input flex-1" placeholder="ID..." value={scanId} onChange={e => setScanId(e.target.value)} />
                      <button type="submit" className="btn-primary whitespace-nowrap">Mark</button>
                    </form>
                 </div>
            </div>

            {/* RIGHT SIDE: LOGS */}
            <div className="card h-[400px] md:h-[600px] overflow-hidden flex flex-col">
              <h3 className="text-lg font-bold mb-4 text-slate-800 border-b pb-2">Live Access Log</h3>
              <div className="flex-1 overflow-y-auto">
                 <Table headers={["Time", "Student", "Status"]}>
                  {attendance.map(log => (
                    <tr key={log.id} className="row">
                      <td className="cell font-mono text-slate-500 text-xs md:text-sm">{log.time}</td>
                      <td className="cell"><div className="font-bold text-slate-800 text-sm">{getStudentName(log.student_id)}</div></td>
                      <td className="cell"><span className="badge bg-green-100 text-green-800 text-xs">Present</span></td>
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
        .card { background: white; padding: 20px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .input { width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; transition: border 0.2s; font-size: 0.95rem; }
        .input:focus { border-color: #3b82f6; ring: 2px; }
        .btn-primary { background: #2563eb; color: white; padding: 0 24px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: background 0.2s; display:flex; align-items:center; justify-content:center; }
        .btn-primary:hover { background: #1d4ed8; }
        .row:hover { background: #f8fafc; }
        .cell { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; }
        .badge { padding: 4px 10px; background: #dbeafe; color: #1e40af; border-radius: 9999px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
        .right { text-align: right; }
      `}</style>
    </div>
  );
}

const NavItem = ({ icon, label, active, onClick }) => (
  <div onClick={onClick} className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
    {icon} <span className="font-medium">{label}</span>
  </div>
);
const StatCard = ({ label, value, color }) => {
    const colors = { blue: "bg-blue-50 text-blue-600 border-blue-100", green: "bg-green-50 text-green-600 border-green-100", purple: "bg-purple-50 text-purple-600 border-purple-100", orange: "bg-orange-50 text-orange-600 border-orange-100" };
    return <div className={`p-4 md:px-6 md:py-5 rounded-2xl border ${colors[color]}`}><div className="text-[10px] md:text-xs font-bold uppercase tracking-wider opacity-70 mb-1">{label}</div><div className="text-xl md:text-3xl font-extrabold">{value}</div></div>;
};
const Table = ({ headers, children }) => (
  <table className="w-full text-left border-collapse"><thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold tracking-wider"><tr>{headers.map(h => <th key={h} className="px-4 py-3 md:px-6 md:py-4">{h}</th>)}</tr></thead><tbody className="divide-y divide-gray-100">{children}</tbody></table>
);

export default App;