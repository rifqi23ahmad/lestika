import React, { useState, useEffect } from "react";
import { Card, Button, Modal, Form, Spinner, Row, Col, ToggleButton, Alert } from "react-bootstrap";
import { Plus, Trash2, Edit, User, UserCheck, Calendar } from "lucide-react";
import { scheduleService } from "../../../services/scheduleService"; // Import Service
import WeeklyScheduleBoard from "../../../components/schedule/WeeklyScheduleBoard"; // Import Shared Desktop View
import MobileScheduleList from "../../../components/schedule/MobileScheduleList"; // Import Shared Mobile View

export default function ScheduleTab({ user, students, showModal }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modals State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editModal, setEditModal] = useState({ show: false, slotId: null });
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });

  // Form States
  const [creatingSlots, setCreatingSlots] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  
  const [scheduleForm, setScheduleForm] = useState({
    selectedDays: [],
    startTime: "",
    endTime: "",
    subject: "Matematika",
    duration: 60,
  });

  const [editForm, setEditForm] = useState({ 
    subject: "", 
    assignType: "registered", 
    studentId: "", 
    studentNameManual: "" 
  });

  const daysMap = [
    { name: "Senin", value: 1 }, { name: "Selasa", value: 2 }, { name: "Rabu", value: 3 },
    { name: "Kamis", value: 4 }, { name: "Jumat", value: 5 }, { name: "Sabtu", value: 6 },
    { name: "Minggu", value: 0 },
  ];

  useEffect(() => {
    if (user) fetchMySlots();
  }, [user]);

  const fetchMySlots = async () => {
    setLoading(true);
    try {
      const data = await scheduleService.getTeacherSlots(user.id);
      setSlots(data);
    } catch (error) {
      console.error("Error fetch slots:", error);
      showModal("Error", "Gagal memuat jadwal.", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC: CREATE ---
  const handleDayToggle = (dayValue) => {
    const currentDays = scheduleForm.selectedDays;
    setScheduleForm({
      ...scheduleForm,
      selectedDays: currentDays.includes(dayValue)
        ? currentDays.filter((d) => d !== dayValue)
        : [...currentDays, dayValue],
    });
  };

  const handleCreateRoutineSlots = async (e) => {
    e.preventDefault();
    if (scheduleForm.selectedDays.length === 0 || !scheduleForm.startTime || !scheduleForm.endTime) {
      return showModal("Validasi Gagal", "Lengkapi form hari dan jam.", "error");
    }

    setCreatingSlots(true);
    try {
      const count = await scheduleService.createWeeklySlots(user.id, scheduleForm);
      if (count === 0) throw new Error("Gagal membuat slot (cek rentang waktu).");

      showModal("Berhasil!", `Menambahkan ${count} slot baru.`, "success");
      setScheduleForm({ ...scheduleForm, selectedDays: [] });
      setShowCreateModal(false); // Tutup modal setelah sukses
      fetchMySlots();
    } catch (err) {
      showModal("Error", err.message, "error");
    } finally {
      setCreatingSlots(false);
    }
  };

  // --- LOGIC: EDIT & DELETE ---
  const handleSlotClick = (slot) => {
    // Saat slot diklik, buka modal edit
    setEditForm({
      subject: slot.subject || "",
      assignType: slot.student_id ? "registered" : (slot.student_name_manual ? "manual" : "registered"),
      studentId: slot.student_id || "",
      studentNameManual: slot.student_name_manual || ""
    });
    setEditModal({ show: true, slotId: slot.id });
  };

  const handleSaveEdit = async () => {
    setSavingEdit(true);
    try {
      const isRegistered = editForm.assignType === "registered";
      const hasStudent = (isRegistered && editForm.studentId) || (!isRegistered && editForm.studentNameManual);
      
      const payload = {
        subject: editForm.subject,
        student_id: isRegistered && editForm.studentId ? editForm.studentId : null,
        student_name_manual: !isRegistered ? editForm.studentNameManual : null,
        status: hasStudent ? "booked" : "open"
      };

      await scheduleService.updateSlot(editModal.slotId, payload);
      showModal("Berhasil", "Slot diperbarui.", "success");
      setEditModal({ show: false, slotId: null });
      fetchMySlots();
    } catch (err) {
      showModal("Gagal Update", err.message, "error");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteSlot = async () => {
    if (!deleteModal.id) return;
    try {
      await scheduleService.deleteSlot(deleteModal.id);
      setDeleteModal({ show: false, id: null });
      setEditModal({ show: false, slotId: null }); // Tutup edit modal juga jika terbuka
      fetchMySlots();
      showModal("Terhapus", "Slot dihapus.", "success");
    } catch (error) {
       showModal("Gagal", "Gagal menghapus slot.", "error");
    }
  };

  // --- HELPER UNTUK TAMPILAN ---
  const getSlotVariant = (slot) => {
    // Logic warna: Hijau kalau kosong, Biru kalau ada murid
    return slot.status === "booked" || slot.student_id || slot.student_name_manual ? "primary" : "success";
  };

  const renderSlotContent = (slot) => {
    // Custom content untuk Guru (Menampilkan Nama Murid)
    return (
      <div className="small">
        <div className="fw-bold text-dark">{slot.subject}</div>
        {slot.student_id ? (
          <div className="text-primary mt-1 d-flex align-items-center gap-1" style={{fontSize: '0.75rem'}}>
            <UserCheck size={12} /> {slot.student?.full_name?.split(" ")[0]}
          </div>
        ) : slot.student_name_manual ? (
          <div className="text-info mt-1 d-flex align-items-center gap-1" style={{fontSize: '0.75rem'}}>
            <User size={12} /> {slot.student_name_manual}
          </div>
        ) : (
           <div className="text-muted mt-1 fst-italic" style={{fontSize: '0.75rem'}}>Kosong</div>
        )}
      </div>
    );
  };

  return (
    <>
      <Card className="shadow-sm border-0 h-100">
        <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                <Calendar className="text-primary" size={20} /> Jadwal Mengajar
            </h5>
            <div className="d-flex gap-2">
                <Button variant="outline-secondary" size="sm" onClick={fetchMySlots}>Refresh</Button>
                <Button variant="primary" size="sm" onClick={() => setShowCreateModal(true)}>
                    <Plus size={16} className="me-1" /> Atur Jadwal
                </Button>
            </div>
        </Card.Header>
        <Card.Body className="p-3 bg-light">
            {loading ? (
                <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
            ) : slots.length === 0 ? (
                <div className="text-center py-5">
                    <p className="text-muted">Belum ada jadwal yang dibuat.</p>
                    <Button variant="link" onClick={() => setShowCreateModal(true)}>Buat Jadwal Sekarang</Button>
                </div>
            ) : (
                <>
                    {/* Tampilan Desktop (Board) */}
                    <WeeklyScheduleBoard 
                        slots={slots} 
                        onSlotClick={handleSlotClick}
                        getSlotVariant={getSlotVariant}
                        renderSlotContent={renderSlotContent}
                    />
                    
                    {/* Tampilan Mobile (List) */}
                    <MobileScheduleList 
                        slots={slots} 
                        onSlotClick={handleSlotClick}
                        getSlotVariant={getSlotVariant}
                        renderSlotContent={renderSlotContent}
                    />
                </>
            )}
        </Card.Body>
      </Card>

      {/* --- MODAL 1: CREATE ROUTINE SLOTS --- */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg" centered>
        <Modal.Header closeButton><Modal.Title>Buat Slot Rutin Mingguan</Modal.Title></Modal.Header>
        <Modal.Body>
            <Form onSubmit={handleCreateRoutineSlots}>
              <Alert variant="info" className="small py-2 px-3">
                 Slot ini akan dibuat berulang untuk minggu-minggu berikutnya.
              </Alert>
              
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold">Pilih Hari</Form.Label>
                <div className="d-flex flex-wrap gap-2">
                  {daysMap.map((day) => (
                    <ToggleButton
                      key={day.value} id={`check-day-${day.value}`} type="checkbox" variant="outline-primary"
                      checked={scheduleForm.selectedDays.includes(day.value)} value={day.value}
                      onChange={() => handleDayToggle(day.value)} size="sm" className="rounded-pill px-3"
                    >
                      {day.name}
                    </ToggleButton>
                  ))}
                </div>
              </Form.Group>

              <Row className="g-3 mb-3">
                 <Col md={6}>
                    <Form.Group>
                        <Form.Label>Mata Pelajaran</Form.Label>
                        <Form.Control type="text" value={scheduleForm.subject} onChange={(e) => setScheduleForm({...scheduleForm, subject: e.target.value})} />
                    </Form.Group>
                 </Col>
                 <Col md={6}>
                    <Form.Group>
                        <Form.Label>Durasi (Menit)</Form.Label>
                        <Form.Control type="number" value={scheduleForm.duration} onChange={(e) => setScheduleForm({...scheduleForm, duration: e.target.value})} />
                    </Form.Group>
                 </Col>
                 <Col xs={6}>
                    <Form.Group><Form.Label>Jam Mulai</Form.Label><Form.Control type="time" value={scheduleForm.startTime} onChange={(e) => setScheduleForm({...scheduleForm, startTime: e.target.value})} /></Form.Group>
                 </Col>
                 <Col xs={6}>
                    <Form.Group><Form.Label>Jam Selesai</Form.Label><Form.Control type="time" value={scheduleForm.endTime} onChange={(e) => setScheduleForm({...scheduleForm, endTime: e.target.value})} /></Form.Group>
                 </Col>
              </Row>

              <div className="d-flex justify-content-end gap-2 mt-4">
                 <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Batal</Button>
                 <Button type="submit" variant="primary" disabled={creatingSlots}>
                    {creatingSlots ? <Spinner size="sm" animation="border" /> : "Buat Slot"}
                 </Button>
              </div>
            </Form>
        </Modal.Body>
      </Modal>

      {/* --- MODAL 2: EDIT / DELETE SLOT --- */}
      <Modal show={editModal.show} onHide={() => setEditModal({ show: false, slotId: null })} centered>
        <Modal.Header closeButton><Modal.Title>Edit Slot</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
                <Form.Label>Mata Pelajaran</Form.Label>
                <Form.Control type="text" value={editForm.subject} onChange={(e) => setEditForm({...editForm, subject: e.target.value})} />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label className="d-block fw-bold">Status Penugasan</Form.Label>
                <div className="mb-2">
                    <Form.Check inline type="radio" label="Siswa Terdaftar" name="assignType" checked={editForm.assignType === 'registered'} onChange={() => setEditForm({...editForm, assignType: 'registered'})} />
                    <Form.Check inline type="radio" label="Manual" name="assignType" checked={editForm.assignType === 'manual'} onChange={() => setEditForm({...editForm, assignType: 'manual'})} />
                </div>
                {editForm.assignType === 'registered' ? (
                    <Form.Select value={editForm.studentId} onChange={(e) => setEditForm({...editForm, studentId: e.target.value})}>
                        <option value="">-- Kosong (Available) --</option>
                        {students.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                    </Form.Select>
                ) : (
                    <Form.Control type="text" placeholder="Nama siswa manual..." value={editForm.studentNameManual} onChange={(e) => setEditForm({...editForm, studentNameManual: e.target.value})} />
                )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-between">
          <Button variant="danger" onClick={() => setDeleteModal({ show: true, id: editModal.slotId })}>
             <Trash2 size={16} /> Hapus
          </Button>
          <div className="d-flex gap-2">
              <Button variant="secondary" onClick={() => setEditModal({ show: false, slotId: null })}>Batal</Button>
              <Button variant="primary" onClick={handleSaveEdit} disabled={savingEdit}>
                 {savingEdit ? <Spinner size="sm" /> : "Simpan Perubahan"}
              </Button>
          </div>
        </Modal.Footer>
      </Modal>

      {/* --- MODAL 3: CONFIRM DELETE --- */}
      <Modal show={deleteModal.show} onHide={() => setDeleteModal({ show: false, id: null })} centered size="sm">
        <Modal.Body className="text-center p-4">
          <div className="mx-auto mb-3 p-3 bg-light rounded-circle text-danger" style={{width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Trash2 size={28} />
          </div>
          <h6 className="fw-bold">Hapus jadwal ini permanen?</h6>
          <div className="d-flex justify-content-center gap-2 mt-4">
            <Button variant="outline-secondary" size="sm" onClick={() => setDeleteModal({ show: false, id: null })}>Batal</Button>
            <Button variant="danger" size="sm" onClick={handleDeleteSlot}>Ya, Hapus</Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}