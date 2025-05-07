document.addEventListener('DOMContentLoaded', () => {
  // Static guru credentials
  const GURU = { user: 'guru', pass: 'guru123' };
  // Load students and schedules from localStorage
  const students = JSON.parse(localStorage.getItem('students') || '[]');
  const schedules = JSON.parse(localStorage.getItem('schedules') || '[]');
  const meetingsCount = JSON.parse(localStorage.getItem('meetingsCount') || '{}');
  const invoices = JSON.parse(localStorage.getItem('invoices') || '{}');

  // Elements
  const loginScreen = document.getElementById('login-screen');
  const teacherDash = document.getElementById('teacher-dashboard');
  const studentDash = document.getElementById('student-dashboard');
  const uname = document.getElementById('username');
  const pwd = document.getElementById('password');
  const err = document.getElementById('login-error');

  // Login
  document.getElementById('login-btn').onclick = () => {
    const u = uname.value, p = pwd.value;
    if (u === GURU.user && p === GURU.pass) return showTeacher();
    const s = students.find(s => s.username === u && s.password === p);
    if (s) return showStudent(s.username);
    err.textContent = 'Login gagal';
  };

  function showTeacher() {
    loginScreen.classList.add('hidden'); teacherDash.classList.remove('hidden');
    refreshTeacher();
  }
  function showStudent(user) {
    loginScreen.classList.add('hidden'); studentDash.classList.remove('hidden');
    refreshStudent(user);
  }

  document.getElementById('logout-btn').onclick = () => location.reload();
  document.getElementById('logout2-btn').onclick = () => location.reload();

  // Add student
  document.getElementById('add-student-btn').onclick = () => {
    const name = document.getElementById('new-student-name').value;
    const user = document.getElementById('new-student-username').value;
    const pass = document.getElementById('new-student-password').value;
    if (students.find(s => s.username === user)) return;
    students.push({name, username: user, password: pass});
    localStorage.setItem('students', JSON.stringify(students));
    document.getElementById('student-message').textContent = 'Siswa ditambahkan';
    refreshTeacher();
  };

  document.getElementById('add-schedule-btn').onclick = () => {
    const date = document.getElementById('sch-date').value;
    const time = document.getElementById('sch-time').value;
    const stud = document.getElementById('sch-student').value;
    schedules.push({date, time, student: stud});
    localStorage.setItem('schedules', JSON.stringify(schedules));
    meetingsCount[stud] = (meetingsCount[stud]||0) + 1;
    localStorage.setItem('meetingsCount', JSON.stringify(meetingsCount));
    invoices[stud] = meetingsCount[stud] * 100000; // example price
    localStorage.setItem('invoices', JSON.stringify(invoices));
    refreshTeacher();
  };

  function refreshTeacher() {
    // Populate student select
    const sel = document.getElementById('sch-student'); sel.innerHTML = '';
    students.forEach(s => sel.add(new Option(s.name, s.username)));
    // Schedule table
    const tbody = document.querySelector('#schedule-table tbody'); tbody.innerHTML = '';
    schedules.forEach(r => {
      const tr = tbody.insertRow(); tr.insertCell().textContent = r.date;
      tr.insertCell().textContent = r.time;
      const name = students.find(s=>s.username===r.student)?.name||r.student;
      tr.insertCell().textContent = name;
    });
    // Invoice table
    const invT = document.querySelector('#invoice-table tbody'); invT.innerHTML = '';
    students.forEach(s => {
      const tr = invT.insertRow();
      tr.insertCell().textContent = s.name;
      tr.insertCell().textContent = meetingsCount[s.username]||0;
      tr.insertCell().textContent = invoices[s.username]||0;
      const btn = document.createElement('button'); btn.textContent='Cetak'; btn.onclick=()=>window.print();
      tr.insertCell().appendChild(btn);
    });
  }

  function refreshStudent(user) {
    const userSch = schedules.filter(r=>r.student===user);
    const tb = document.querySelector('#student-schedule-table tbody'); tb.innerHTML='';
    userSch.forEach((r,i)=>{
      const tr=tb.insertRow(); tr.insertCell().textContent=i+1;
      tr.insertCell().textContent=r.date; tr.insertCell().textContent=r.time;
    });
    if ((meetingsCount[user]||0) === (userSch.length) && invoices[user]>0) {
      document.getElementById('due-invoice').classList.remove('hidden');
    }
  }
});