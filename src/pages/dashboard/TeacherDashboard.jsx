import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Form, Table, Badge, Tab, Tabs, Modal } from 'react-bootstrap';
import { Upload, UserCheck, Calendar, Trash2, UserPlus, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function TeacherDashboard() {
  const { user } = useAuth();
  
  const [students, setStudents] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [slotForm, setSlotForm] = useState({ 
    date: '', time: '', subject: 'Matematika', duration: 60, selectedStudent: ''
  });

  const [gradeForm, setGradeForm] = useState({ studentId: '', subject: '', score: '', feedback: '' });

  // [BARU] UI Modal States
  const [modalData, setModalData] = useState({ show: false, title: '', msg: '', type: 'info' }); // type: info|success|error
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });

  useEffect(() => {
    fetchStudents();
    if(user) fetchMySlots();
  }, [user]);

  const showModal = (title, msg, type = 'info') => {
      setModalData({ show: true, title, msg, type });
  };

  const formatDateGuru = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', { 
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
    });
  };

  const fetchStudents = async () => {
    const { data } = await supabase.from('profiles').select('id, full_name, email').eq('role', 'siswa');
    setStudents(data || []);
  };

  const fetchMySlots = async () => {
    setLoading(true);
    const { data, error } = await supabase
        .from('teaching_slots')
        .select(`*, student:profiles!student_id ( full_name ) `) 
        .eq('teacher_id', user.id)
        .order('start_time', { ascending: true });

    if (error) console.error("Error fetch slots:", error);
    setSlots(data || []);
    setLoading(false);
  };

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    // [UBAH] Validasi via Modal
    if (!slotForm.date || !slotForm.time) return showModal('Validasi Gagal', 'Tanggal dan jam wajib diisi!', 'error');

    try {
        const startDateTime = new Date(`${slotForm.date}T${slotForm.time}`);
        const endDateTime = new Date(startDateTime.getTime() + slotForm.duration * 60000);
        const isBooked = !!slotForm.selectedStudent;
        
        const payload = {
            teacher_id: user.id,
            subject: slotForm.subject,
            start_time: startDateTime.toISOString(),
            end_time: endDateTime.toISOString(),
            status: isBooked ? 'booked' : 'open',
            student_id: isBooked ? slotForm.selectedStudent : null 
        };

        const { error } = await supabase.from('teaching_slots').insert(payload);
        if (error) throw error;
        
        // [UBAH] Sukses
        showModal(
            'Berhasil!', 
            isBooked ? "Jadwal berhasil dibuat untuk siswa." : "Slot jadwal dibuka (Menunggu booking).", 
            'success'
        );

        setSlotForm({ ...slotForm, date: '', time: '', selectedStudent: '' });
        fetchMySlots();

    } catch (err) {
        showModal('Error', "Gagal buat jadwal: " + err.message, 'error');
    }
  };

  // [UBAH] Logic Hapus dengan Modal
  const confirmDelete = (id) => setDeleteModal({ show: true, id });

  const handleDeleteSlot = async () => {
      if(!deleteModal.id) return;
      
      await supabase.from('teaching_slots').delete().eq('id', deleteModal.id);
      
      setDeleteModal({ show: false, id: null });
      fetchMySlots();
      showModal('Terhapus', 'Slot jadwal berhasil dihapus.', 'success');
  };

  const handleSaveGrade = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('grades').insert({
        student_id: gradeForm.studentId,
        teacher_id: user.id,
        subject: gradeForm.subject,
        score: gradeForm.score,
        feedback: gradeForm.feedback
      });
      if (error) throw error;
      
      showModal('Sukses', 'Nilai berhasil disimpan!', 'success');
      setGradeForm({ studentId: '', subject: '', score: '', feedback: '' });
    } catch (err) {
      showModal('Gagal', "Gagal simpan nilai: " + err.message, 'error');
    }
  };

  return (
    <div className="pb-5">
      
      <Tabs defaultActiveKey="jadwal" className="mb-4 border-bottom-0">
        
        {/* TAB 1: KELOLA JADWAL */}
        <Tab eventKey="jadwal" title={<><Calendar size={18} className="me-2"/>Kelola Jadwal</>}>
            <Row className="g-4">
                <Col md={4}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-primary text-white fw-bold">
                            <UserPlus size={18} className="me-2"/> Buat Jadwal / Slot
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleCreateSlot}>
                                {/* ... (Form Controls sama seperti sebelumnya) ... */}
                                <Form.Group className="mb-3">
                                    <Form.Label>Mata Pelajaran</Form.Label>
                                    <Form.Control type="text" value={slotForm.subject} onChange={e=>setSlotForm({...slotForm, subject: e.target.value})} required />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Pilih Murid (Opsional)</Form.Label>
                                    <Form.Select value={slotForm.selectedStudent} onChange={e=>setSlotForm({...slotForm, selectedStudent: e.target.value})}>
                                        <option value="">-- Biarkan Kosong (Tunggu Booking) --</option>
                                        {students.map(s => (<option key={s.id} value={s.id}>{s.full_name} ({s.email})</option>))}
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Tanggal</Form.Label>
                                    <Form.Control type="date" value={slotForm.date} onChange={e=>setSlotForm({...slotForm, date: e.target.value})} required />
                                </Form.Group>
                                <Row>
                                    <Col>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Jam Mulai</Form.Label>
                                            <Form.Control type="time" value={slotForm.time} onChange={e=>setSlotForm({...slotForm, time: e.target.value})} required />
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Durasi (Menit)</Form.Label>
                                            <Form.Control type="number" value={slotForm.duration} onChange={e=>setSlotForm({...slotForm, duration: e.target.value})} />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Button type="submit" className="w-100 fw-bold">
                                    {slotForm.selectedStudent ? 'Buat Jadwal & Kunci' : 'Buka Slot Kosong'}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={8}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-white fw-bold d-flex justify-content-between align-items-center">
                            <span>Daftar Jadwal Mengajar</span>
                            <Button variant="outline-secondary" size="sm" onClick={fetchMySlots}>Refresh</Button>
                        </Card.Header>
                        <div className="table-responsive">
                            <Table hover className="mb-0 align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Waktu (Hari, Tanggal)</th>
                                        <th>Mapel</th>
                                        <th>Status / Siswa</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={4} className="text-center p-4">Memuat data...</td></tr>
                                    ) : slots.length === 0 ? (
                                        <tr><td colSpan={4} className="text-center p-4 text-muted">Belum ada jadwal.</td></tr>
                                    ) : (
                                        slots.map(slot => (
                                            <tr key={slot.id}>
                                                <td>
                                                    <div className="fw-bold">{formatDateGuru(slot.start_time)}</div>
                                                    <small className="text-muted">
                                                        {new Date(slot.start_time).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})} - {new Date(slot.end_time).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}
                                                    </small>
                                                </td>
                                                <td>{slot.subject}</td>
                                                <td>
                                                    {slot.student_id ? (
                                                        <div className="d-flex align-items-center text-success">
                                                            <UserCheck size={16} className="me-1"/>
                                                            <span className="fw-bold">{slot.student?.full_name || 'Murid'}</span>
                                                        </div>
                                                    ) : (
                                                        <Badge bg="secondary">Menunggu Booking</Badge>
                                                    )}
                                                </td>
                                                <td>
                                                    {/* [UBAH] Tombol hapus trigger modal */}
                                                    <Button variant="outline-danger" size="sm" onClick={() => confirmDelete(slot.id)}>
                                                        <Trash2 size={14}/> Hapus
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    </Card>
                </Col>
            </Row>
        </Tab>

        {/* TAB 2: INPUT NILAI (Konten sama, tombol submit sudah panggil modal) */}
        <Tab eventKey="nilai" title={<><UserCheck size={18} className="me-2"/>Input Nilai</>}>
             <Card className="shadow-sm border-0">
                <Card.Body>
                    <Form onSubmit={handleSaveGrade}>
                        <Row className="g-3">
                            {/* ... (Isi Form sama persis) ... */}
                            <Col md={6}>
                                <Form.Label>Pilih Siswa</Form.Label>
                                <Form.Select value={gradeForm.studentId} onChange={e=>setGradeForm({...gradeForm, studentId: e.target.value})} required>
                                    <option value="">-- Pilih Siswa --</option>
                                    {students.map(s => (<option key={s.id} value={s.id}>{s.full_name}</option>))}
                                </Form.Select>
                            </Col>
                            <Col md={6}>
                                <Form.Label>Mata Pelajaran</Form.Label>
                                <Form.Control type="text" value={gradeForm.subject} onChange={e=>setGradeForm({...gradeForm, subject: e.target.value})} required/>
                            </Col>
                            <Col md={3}>
                                <Form.Label>Nilai (0-100)</Form.Label>
                                <Form.Control type="number" value={gradeForm.score} onChange={e=>setGradeForm({...gradeForm, score: e.target.value})} required/>
                            </Col>
                            <Col md={9}>
                                <Form.Label>Feedback / Catatan</Form.Label>
                                <Form.Control type="text" value={gradeForm.feedback} onChange={e=>setGradeForm({...gradeForm, feedback: e.target.value})}/>
                            </Col>
                            <Col xs={12}>
                                <Button type="submit" variant="success">Simpan Nilai</Button>
                            </Col>
                        </Row>
                    </Form>
                </Card.Body>
             </Card>
        </Tab>

        <Tab eventKey="materi" title={<><Upload size={18} className="me-2"/>Upload Materi</>}>
            <Card className="border-0 shadow-sm p-4 text-center">
                <p className="text-muted">Gunakan fitur upload file di Supabase Storage secara manual.</p>
                <Button variant="outline-primary" href="https://supabase.com/dashboard/project/_/storage/buckets/materials" target="_blank">
                    Buka Storage Manager
                </Button>
            </Card>
        </Tab>
      </Tabs>

      {/* [BARU] MODAL INFO (Success/Error) */}
      <Modal show={modalData.show} onHide={() => setModalData({...modalData, show: false})} centered>
        <Modal.Body className="text-center p-4">
             <div className={`mx-auto mb-3 p-3 rounded-full w-fit ${modalData.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                {modalData.type === 'error' ? <AlertTriangle size={32} /> : <CheckCircle size={32} />}
             </div>
             <h5 className="fw-bold mb-2">{modalData.title}</h5>
             <p className="text-muted">{modalData.msg}</p>
             <Button variant={modalData.type === 'error' ? "danger" : "success"} onClick={() => setModalData({...modalData, show: false})}>
                Tutup
             </Button>
        </Modal.Body>
      </Modal>

      {/* [BARU] MODAL CONFIRM DELETE */}
      <Modal show={deleteModal.show} onHide={() => setDeleteModal({show: false, id: null})} centered>
        <Modal.Body className="text-center p-4">
            <div className="mx-auto mb-3 p-3 bg-red-100 rounded-full w-fit text-red-600">
                <Trash2 size={32} />
            </div>
            <h5 className="fw-bold mb-2">Hapus Slot Jadwal?</h5>
            <p className="text-muted">Apakah Anda yakin ingin menghapus slot ini? Data tidak bisa dikembalikan.</p>
            <div className="d-flex justify-content-center gap-2">
                <Button variant="secondary" onClick={() => setDeleteModal({show: false, id: null})}>Batal</Button>
                <Button variant="danger" onClick={handleDeleteSlot}>Ya, Hapus</Button>
            </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}