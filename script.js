// Hardcoded users
const users = [
    { username: "guru", password: "guru123", role: "guru" },
    { username: "zahra", password: "zahra123", role: "siswa" },
    { username: "dean", password: "deab123", role: "siswa" },
    { username: "avan", password: "tika123", role: "siswa" },
    { username: "bila", password: "bila123", role: "siswa" },
    { username: "adam", password: "adam123", role: "siswa" },
    { username: "raisa", password: "raisae", role: "siswa" },
    { username: "gendis", password: "gendis123", role: "siswa" },
    { username: "Fadhil", password: "fadhil23", role: "siswa" },
    { username: "Avan", password: "avan23", role: "siswa" }



];

// API endpoint
const API_URL = "https://sheetdb.io/api/v1/r5268rzwhhrtw";

// Global variables
let currentUser = null;
let allSchedules = [];

// DOM elements
const loginSection = document.getElementById('login-section');
const guruDashboard = document.getElementById('guru-dashboard');
const siswaDashboard = document.getElementById('siswa-dashboard');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');

// Login functionality
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = user;
        loginError.textContent = '';
        loginSection.style.display = 'none';
        
        if (user.role === 'guru') {
            guruDashboard.style.display = 'block';
            loadGuruData();
        } else {
            siswaDashboard.style.display = 'block';
            loadSiswaData();
        }
    } else {
        loginError.textContent = 'Username atau password salah';
    }
});

// Logout functionality
function logout() {
    currentUser = null;
    guruDashboard.style.display = 'none';
    siswaDashboard.style.display = 'none';
    loginSection.style.display = 'block';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

// Tab functionality
function openTab(evt, tabName) {
    const tabcontent = document.getElementsByClassName("tabcontent");
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    const tablinks = document.getElementsByClassName("tablinks");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

// Load data for guru dashboard
async function loadGuruData() {
    try {
        const response = await fetch(`${API_URL}?students`);
        const data = await response.json();
        allSchedules = data;
        
        // Filter only siswa data
        const siswaData = data.filter(item => item.role === 'siswa');
        
        // Populate jadwal mengajar table
        // Di fungsi loadGuruData(), ubah bagian yang menampilkan jadwal mengajar:

        
        // Populate tagihan table
     // Di fungsi loadGuruData(), ubah bagian yang menampilkan jadwal mengajar:
        const jadwalTable = document.getElementById('guru-jadwal-table').getElementsByTagName('tbody')[0];
        jadwalTable.innerHTML = '';
        siswaData.forEach(item => {
            const hariList = item.hari.split(', ');
            hariList.forEach(hari => {
                const row = jadwalTable.insertRow();
                row.insertCell(0).textContent = item.nama_siswa;
                row.insertCell(1).textContent = hari.trim();
                row.insertCell(2).textContent = item.jam;
            });
        });
        
        // Calculate total pendapatan
        const lunasData = siswaData.filter(item => item.status === 'Lunas');
        const totalPendapatan = lunasData.reduce((total, item) => {
             return total + (parseInt(item.jumlah) * parseInt(item.tagihan));
        }, 0);
        document.getElementById('total-pendapatan').textContent = `Rp ${totalPendapatan}`;
        
        // Populate nama siswa dropdown for adding new schedule
        const namaSiswaSelect = document.getElementById('nama-siswa');
        namaSiswaSelect.innerHTML = '<option value="">Pilih Siswa</option>';
        const uniqueStudents = [...new Set(siswaData.map(item => item.nama_siswa))];
        uniqueStudents.forEach(student => {
            const option = document.createElement('option');
            option.value = student;
            option.textContent = student;
            namaSiswaSelect.appendChild(option);
        });
        
        // Populate edit jadwal table
        const editTable = document.getElementById('edit-jadwal-table').getElementsByTagName('tbody')[0];
        editTable.innerHTML = '';
        siswaData.forEach(item => {
            const row = editTable.insertRow();
            row.insertCell(0).textContent = item.nama_siswa;
            row.insertCell(1).textContent = item.hari;
            row.insertCell(2).textContent = item.jam;
            
            const editCell = row.insertCell(3);
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.onclick = () => showEditForm(item);
            editButton.style.backgroundColor = '#2196F3';
            editCell.appendChild(editButton);
        });
        
        // Populate siswa dropdown for invoice
        const siswaInvoiceSelect = document.getElementById('siswa-invoice');
        siswaInvoiceSelect.innerHTML = '<option value="">Pilih Siswa</option>';
        uniqueStudents.forEach(student => {
            const option = document.createElement('option');
            option.value = student;
            option.textContent = student;
            siswaInvoiceSelect.appendChild(option);
        });
        
        // Setup form for adding new schedule
        document.getElementById('tambah-jadwal-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const namaSiswa = document.getElementById('nama-siswa').value;
            const jam = document.getElementById('jam').value;
            const tagihan = document.getElementById('tagihan').value;
            const bulan = document.getElementById('bulan').value;
            const jumlah = document.getElementById('jumlah').value;
            const status = document.getElementById('status').value;
            
            // Get selected days
            const dayCheckboxes = document.querySelectorAll('input[name="hari"]:checked');
            if (dayCheckboxes.length === 0) {
                document.getElementById('tambah-error').textContent = 'Pilih minimal 1 hari';
                return;
            }
            const selectedDays = Array.from(dayCheckboxes).map(cb => cb.value);
            const hari = selectedDays.join(', ');
            
            // Find username based on nama_siswa
            const siswa = allSchedules.find(item => item.nama_siswa === namaSiswa);
            if (!siswa) {
                document.getElementById('tambah-error').textContent = 'Siswa tidak ditemukan';
                return;
            }
            
            const newSchedule = {
                username: siswa.username,
                role: 'siswa',
                hari: hari,
                jam: jam,
                tagihan: tagihan,
                nama_siswa: namaSiswa,
                bulan: bulan,
                jumlah: jumlah,
                status: status
            };
            
            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ data: [newSchedule] })
                });
                
                const result = await response.json();
                
                if (result.created > 0) {
                    document.getElementById('tambah-success').textContent = 'Jadwal berhasil ditambahkan!';
                    document.getElementById('tambah-error').textContent = '';
                    document.getElementById('tambah-jadwal-form').reset();
                    // Uncheck all checkboxes
                    document.querySelectorAll('input[name="hari"]').forEach(cb => cb.checked = false);
                    // Reload data
                    setTimeout(loadGuruData, 1000);
                } else {
                    document.getElementById('tambah-error').textContent = 'Gagal menambahkan jadwal';
                }
            } catch (error) {
                document.getElementById('tambah-error').textContent = 'Terjadi kesalahan: ' + error.message;
            }
        });

    } catch (error) {
        console.error('Error loading data:', error);
    }
const editTagihanTable = document.getElementById('edit-tagihan-table').getElementsByTagName('tbody')[0];
editTagihanTable.innerHTML = '';
const uniqueStudents = [...new Set(siswaData.map(item => item.nama_siswa))];
uniqueStudents.forEach(student => {
    const studentData = siswaData.find(item => item.nama_siswa === student);
    const row = editTagihanTable.insertRow();
    row.insertCell(0).textContent = student;
    row.insertCell(1).textContent = `Rp ${studentData.tagihan}`;
    row.insertCell(2).textContent = studentData.jumlah;
    row.insertCell(3).textContent = studentData.status;
    
    const editCell = row.insertCell(4);
    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.onclick = () => showEditTagihanForm(studentData);
    editButton.style.backgroundColor = '#2196F3';
    editCell.appendChild(editButton);
});

// Fungsi untuk menampilkan form edit tagihan
function showEditTagihanForm(item) {
    document.getElementById('edit-tagihan-username').value = item.username;
    document.getElementById('edit-tagihan-nama-siswa').value = item.nama_siswa;
    document.getElementById('edit-tagihan-tagihan').value = item.tagihan;
    document.getElementById('edit-tagihan-jumlah').value = item.jumlah;
    document.getElementById('edit-tagihan-status').value = item.status;
    
    document.getElementById('edit-tagihan-form-container').style.display = 'block';
    document.getElementById('edit-tagihan-form').scrollIntoView();
    
    // Setup form submission
    document.getElementById('edit-tagihan-form').onsubmit = async function(e) {
        e.preventDefault();
        
        const updatedData = {
            username: document.getElementById('edit-tagihan-username').value,
            role: 'siswa',
            nama_siswa: document.getElementById('edit-tagihan-nama-siswa').value,
            hari: item.hari, // Pertahankan nilai hari dari data lama
            jam: item.jam,    // Pertahankan nilai jam dari data lama
            tagihan: document.getElementById('edit-tagihan-tagihan').value,
            bulan: item.bulan, // Pertahankan nilai bulan dari data lama
            jumlah: document.getElementById('edit-tagihan-jumlah').value,
            status: document.getElementById('edit-tagihan-status').value
        };
        
        try {
            // Update logic similar to the edit jadwal form
            // ...
        } catch (error) {
            document.getElementById('edit-tagihan-error').textContent = 'Terjadi kesalahan: ' + error.message;
        }
    };
}

function cancelEditTagihan() {
    document.getElementById('edit-tagihan-form-container').style.display = 'none';
    document.getElementById('edit-tagihan-success').textContent = '';
    document.getElementById('edit-tagihan-error').textContent = '';
}
    
}

// Show edit form
function showEditForm(item) {
    document.getElementById('edit-username').value = item.username;
    document.getElementById('edit-nama-siswa').value = item.nama_siswa;
    document.getElementById('edit-jam').value = item.jam;
    
    // Set checkbox hari berdasarkan data yang ada
    const hariList = item.hari.split(', ');
    document.querySelectorAll('input[name="edit-hari"]').forEach(checkbox => {
        checkbox.checked = hariList.includes(checkbox.value);
    });
    
    document.getElementById('edit-form-container').style.display = 'block';
    document.getElementById('edit-jadwal-form').scrollIntoView();
    
    // Setup form submission
    document.getElementById('edit-jadwal-form').onsubmit = async function(e) {
        e.preventDefault();
        
        // Get selected days
        const dayCheckboxes = document.querySelectorAll('input[name="edit-hari"]:checked');
        if (dayCheckboxes.length === 0) {
            document.getElementById('edit-error').textContent = 'Pilih minimal 1 hari';
            return;
        }
        const selectedDays = Array.from(dayCheckboxes).map(cb => cb.value);
        const hari = selectedDays.join(', ');
        
        const updatedData = {
            username: document.getElementById('edit-username').value,
            role: 'siswa',
            nama_siswa: document.getElementById('edit-nama-siswa').value,
            hari: hari,
            jam: document.getElementById('edit-jam').value,
            // Pertahankan nilai tagihan dan jumlah dari data lama
            tagihan: item.tagihan,
            bulan: item.bulan,
            jumlah: item.jumlah,
            status: item.status
        };
        
        try {
            // First, delete the old record
            const deleteResponse = await fetch(`${API_URL}/username/${item.username}`, {
                method: 'DELETE'
            });
            
            const deleteResult = await deleteResponse.json();
            
            if (deleteResult.deleted > 0) {
                // Then, add the new record
                const addResponse = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ data: [updatedData] })
                });
                
                const addResult = await addResponse.json();
                
                if (addResult.created > 0) {
                    document.getElementById('edit-success').textContent = 'Jadwal berhasil diperbarui!';
                    document.getElementById('edit-error').textContent = '';
                    // Reload data
                    setTimeout(loadGuruData, 1000);
                    cancelEdit();
                } else {
                    document.getElementById('edit-error').textContent = 'Gagal memperbarui jadwal';
                }
            } else {
                document.getElementById('edit-error').textContent = 'Gagal menghapus jadwal lama';
            }
         } catch (error) {
            document.getElementById('edit-error').textContent = 'Terjadi kesalahan: ' + error.message;
        }
    };
}
// Cancel edit
function cancelEdit() {
    document.getElementById('edit-form-container').style.display = 'none';
    document.getElementById('edit-success').textContent = '';
    document.getElementById('edit-error').textContent = '';
}

// Generate invoice for selected student
function generateInvoice() {
    const selectedStudent = document.getElementById('siswa-invoice').value;
    if (!selectedStudent) return;
    
    const studentData = allSchedules.find(item => item.nama_siswa === selectedStudent && item.role === 'siswa');
    if (!studentData) return;
    
    document.getElementById('inv-nama').textContent = studentData.nama_siswa;
    document.getElementById('inv-bulan').textContent = studentData.bulan;
    
    const jadwalTbody = document.getElementById('inv-jadwal');
    jadwalTbody.innerHTML = '';
    
    const hariList = studentData.hari.split(', ');
    hariList.forEach(hari => {
        const row = jadwalTbody.insertRow();
        row.insertCell(0).textContent = hari;
        row.insertCell(1).textContent = studentData.jam;
    });
    
    document.getElementById('inv-jumlah').textContent = studentData.jumlah;
    document.getElementById('inv-tagihan').textContent = studentData.tagihan;
    document.getElementById('inv-total').textContent = parseInt(studentData.jumlah) * parseInt(studentData.tagihan);
    
    document.getElementById('invoice-container').style.display = 'block';
}

// Load data for siswa dashboard
async function loadSiswaData() {
    try {
        const response = await fetch(`${API_URL}?students`);
        const data = await response.json();
        
        // Filter data for current siswa
        const siswaData = data.filter(item => item.username === currentUser.username);
        
        // Populate jadwal table
        const jadwalTable = document.getElementById('siswa-jadwal-table').getElementsByTagName('tbody')[0];
        jadwalTable.innerHTML = '';
        siswaData.forEach(item => {
            const row = jadwalTable.insertRow();
            row.insertCell(0).textContent = item.hari;
            row.insertCell(1).textContent = item.jam;
            row.insertCell(2).textContent = 'Guru';
        });
        
        // Populate tagihan table
        const tagihanTable = document.getElementById('siswa-tagihan-table').getElementsByTagName('tbody')[0];
        tagihanTable.innerHTML = '';
        siswaData.forEach(item => {
            const row = tagihanTable.insertRow();
            row.insertCell(0).textContent = item.bulan;
            row.insertCell(1).textContent = item.jumlah;
            row.insertCell(2).textContent = `Rp ${item.tagihan}`;
            row.insertCell(3).textContent = item.status;
        });
        
        // Populate invoice
        if (siswaData.length > 0) {
            const studentData = siswaData[0];
            document.getElementById('siswa-inv-nama').textContent = studentData.nama_siswa;
            document.getElementById('siswa-inv-bulan').textContent = studentData.bulan;
            
            const jadwalTbody = document.getElementById('siswa-inv-jadwal');
            jadwalTbody.innerHTML = '';
            
            const hariList = studentData.hari.split(', ');
            hariList.forEach(hari => {
                const row = jadwalTbody.insertRow();
                row.insertCell(0).textContent = hari;
                row.insertCell(1).textContent = studentData.jam;
            });
            
            document.getElementById('siswa-inv-jumlah').textContent = studentData.jumlah;
            document.getElementById('siswa-inv-tagihan').textContent = studentData.tagihan;
            document.getElementById('siswa-inv-total').textContent = parseInt(studentData.jumlah) * parseInt(studentData.tagihan);
        }
        
    } catch (error) {
        console.error('Error loading data:', error);
    }
}