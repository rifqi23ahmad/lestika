const API_BASE = 'https://sheetdb.io/api/v1/r5268rzwhhrtw';
const API_STUDENTS = `${API_BASE}/students`;
const API_SCHEDULES = `${API_BASE}/schedules`;
const API_SETTINGS = `${API_BASE}/settings`;

let user = null;
let billingThreshold = 6;

// Generic fetch
async function fetchJSON(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Login
async function login() {
  try {
    const username = el('#username').value.trim();
    const password = el('#password').value.trim();
    const students = await fetchJSON(API_STUDENTS);
    const match = students.find(s => s.username === username && s.password === password);
    if (!match) {
      alert('Username atau password salah');
      return;
    }
    user = match;

    // Load settings
    const settings = await fetchJSON(API_SETTINGS);
    if (settings.length) billingThreshold = Number(settings[0].billing_threshold);

    if (user.role === 'admin') initAdmin();
    else initStudent();
  } catch (err) {
    console.error(err);
    alert('Gagal login, cek koneksi API');
  }
}

el('#login-btn').addEventListener('click', login);

// Admin
function initAdmin() {
  toggle('#login-screen', '#admin-dashboard');
  setupModals();
  loadStudents();
}

async function loadStudents() {
  const students = await fetchJSON(API_STUDENTS);
  const schedules = await fetchJSON(API_SCHEDULES);
  const tbody = el('#students-table tbody');
  tbody.innerHTML = '';

  students.filter(s => s.role === 'student').forEach(s => {
    const meetCount = schedules.filter(sc => sc.student_id === s.id).length;
    const nextDue = meetCount >= billingThreshold ? s.cetak || new Date().toLocaleDateString() : '-';
    tbody.innerHTML += `
      <tr>
        <td>${s.name}</td>
        <td>${meetCount}</td>
        <td>${billingThreshold}</td>
        <td>${nextDue}</td>
        <td><button onclick="window.print()">Print</button></td>
      </tr>
    `;
  });
}

function setupModals() {
  el('#open-create-student').onclick = () => toggle('#modal-create');
  el('#open-settings').onclick = () => toggle('#modal-settings');
  document.querySelectorAll('.close-modal').forEach(b => b.onclick = () => toggle('.modal'));
  el('#create-student-btn').onclick = createStudent;
  el('#save-settings').onclick = saveSettings;
}

async function createStudent() {
  const data = {
    name: el('#new-name').value,
    username: el('#new-username').value,
    password: el('#new-password').value,
    fee: el('#new-fee').value,
    role: 'student'
  };
  await fetchJSON(API_STUDENTS, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ data }) });
  toggle('#modal-create'); loadStudents();
}

async function saveSettings() {
  billingThreshold = Number(el('#threshold-select').value);
  // update sheet
  await fetchJSON(API_SETTINGS, { method: 'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ data: [{ billing_threshold: billingThreshold }] }) });
  toggle('#modal-settings'); loadStudents();
}

// Student
function initStudent() {
  toggle('#login-screen', '#student-dashboard');
  el('#student-name').textContent = user.name;
  loadSchedule();
}

async function loadSchedule() {
  const schedules = await fetchJSON(API_SCHEDULES);
  const my = schedules.filter(sc => sc.student_id === user.id);
  const ul = el('#schedule-list'); ul.innerHTML = '';
  my.forEach(r => ul.innerHTML += `<li>${r.date} — ${r.subject}</li>`);
  if (my.length >= billingThreshold) {
    el('#billing-info').innerHTML = `Amount due: ${user.fee} <button onclick="window.print()">Print Invoice</button>`;
  }
}

// Helpersunction el(s) { return document.querySelector(s); }
function toggle(...sels) { sels.forEach(s => document.querySelectorAll(s).forEach(el => el.classList.toggle('hidden'))); }