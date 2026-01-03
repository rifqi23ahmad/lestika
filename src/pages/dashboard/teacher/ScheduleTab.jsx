import React, { useState, useEffect } from "react";
import { Row, Col, Card, Button, Form, Badge, Accordion, ToggleButton, Spinner, Modal } from "react-bootstrap";
import { Repeat, Trash2, Edit, UserCheck, User, AlertTriangle } from "lucide-react";
import { supabase } from "../../../lib/supabase"; // Pastikan path import ini sesuai (naik 3 level ke src)

export default function ScheduleTab({ user, students, showModal }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creatingSlots, setCreatingSlots] = useState(false);

  // Forms
  const [scheduleForm, setScheduleForm] = useState({
    selectedDays: [],
    startTime: "",
    endTime: "",
    subject: "Matematika",
    duration: 60,
  });

  // Edit & Delete State
  const [editModal, setEditModal] = useState({ show: false, slotId: null });
  const [editForm, setEditForm] = useState({ subject: "", assignType: "registered", studentId: "", studentNameManual: "" });
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });

  const daysOrder = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
  const daysMap = [
    { name: "Minggu", value: 0 }, { name: "Senin", value: 1 }, { name: "Selasa", value: 2 },
    { name: "Rabu", value: 3 }, { name: "Kamis", value: 4 }, { name: "Jumat", value: 5 }, { name: "Sabtu", value: 6 },
  ];

  useEffect(() => {
    if (user) fetchMySlots();
  }, [user]);

  const fetchMySlots = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("teaching_slots")
      .select(`*, student:profiles!student_id ( full_name ) `)
      .eq("teacher_id", user.id)
      .order("start_time", { ascending: true });

    if (error) console.error("Error fetch slots:", error);
    setSlots(data || []);
    setLoading(false);
  };

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
      return showModal("Validasi Gagal", "Pilih minimal satu hari, jam mulai, dan jam selesai.", "error");
    }

    setCreatingSlots(true);
    try {
        const slotsToInsert = [];
        const getNextDayDate = (dayIndex) => {
            const d = new Date();
            d.setDate(d.getDate() + ((dayIndex + 7 - d.getDay()) % 7));
            return d;
        };

        for (const dayIndex of scheduleForm.selectedDays) {
            const anchorDate = getNextDayDate(dayIndex);
            let timeCursor = new Date(anchorDate);
            const [startH, startM] = scheduleForm.startTime.split(":").map(Number);
            timeCursor.setHours(startH, startM, 0, 0);

            let dayEndTime = new Date(anchorDate);
            const [endH, endM] = scheduleForm.endTime.split(":").map(Number);
            dayEndTime.setHours(endH, endM, 0, 0);

            while (timeCursor < dayEndTime) {
                const slotStart = new Date(timeCursor);
                const slotEnd = new Date(timeCursor.getTime() + scheduleForm.duration * 60000);
                if (slotEnd > dayEndTime) break;

                slotsToInsert.push({
                    teacher_id: user.id,
                    subject: scheduleForm.subject,
                    start_time: slotStart.toISOString(),
                    end_time: slotEnd.toISOString(),
                    status: "open",
                    student_id: null,
                });
                timeCursor = slotEnd;
            }
        }
        
      if (slotsToInsert.length === 0) throw new Error("Gagal membuat slot.");
      const { error } = await supabase.from("teaching_slots").insert(slotsToInsert);
      if (error) throw error;

      showModal("Berhasil!", `Menambahkan ${slotsToInsert.length} slot baru.`, "success");
      setScheduleForm({ ...scheduleForm, selectedDays: [] });
      fetchMySlots();
    } catch (err) {
      showModal("Error", err.message, "error");
    } finally {
      setCreatingSlots(false);
    }
  };

  const handleEditClick = (slot) => {
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
      const updatePayload = {
        subject: editForm.subject,
        student_id: isRegistered && editForm.studentId ? editForm.studentId : null,
        student_name_manual: !isRegistered ? editForm.studentNameManual : null,
        status: (isRegistered && editForm.studentId) || (!isRegistered && editForm.studentNameManual) ? "booked" : "open"
      };

      const { error } = await supabase.from("teaching_slots").update(updatePayload).eq("id", editModal.slotId);
      if (error) throw error;

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
    await supabase.from("teaching_slots").delete().eq("id", deleteModal.id);
    setDeleteModal({ show: false, id: null });
    fetchMySlots();
    showModal("Terhapus", "Slot dihapus.", "success");
  };

  const groupedSlots = (() => {
    const grouped = {};
    daysOrder.forEach((day) => (grouped[day] = []));
    slots.forEach((slot) => {
      const dayName = new Date(slot.start_time).toLocaleDateString("id-ID", { weekday: "long" });
      if (grouped[dayName]) grouped[dayName].push(slot);
    });
    return grouped;
  })();

  return (
    <Row className="g-4">
      <Col md={5}>
        <Card className="shadow-sm border-0 h-100">
          <Card.Header className="bg-primary text-white fw-bold d-flex align-items-center">
            <Repeat size={18} className="me-2" /> Buat Slot Rutin
          </Card.Header>
          <Card.Body>
            <Form onSubmit={handleCreateRoutineSlots}>
              <AlertTriangle size={16} className="text-warning mb-2 me-1" />
              <small className="text-muted d-block mb-3">Slot ini akan berlaku mingguan.</small>
              
              <Form.Group className="mb-3">
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

              <Form.Group className="mb-3">
                <Form.Label>Mata Pelajaran</Form.Label>
                <Form.Control type="text" value={scheduleForm.subject} onChange={(e) => setScheduleForm({...scheduleForm, subject: e.target.value})} required />
              </Form.Group>

              <Row>
                <Col xs={6}>
                  <Form.Group className="mb-3"><Form.Label>Mulai</Form.Label><Form.Control type="time" value={scheduleForm.startTime} onChange={(e) => setScheduleForm({...scheduleForm, startTime: e.target.value})} required /></Form.Group>
                </Col>
                <Col xs={6}>
                  <Form.Group className="mb-3"><Form.Label>Selesai</Form.Label><Form.Control type="time" value={scheduleForm.endTime} onChange={(e) => setScheduleForm({...scheduleForm, endTime: e.target.value})} required /></Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-4"><Form.Label>Durasi (Menit)</Form.Label><Form.Control type="number" value={scheduleForm.duration} onChange={(e) => setScheduleForm({...scheduleForm, duration: e.target.value})} required /></Form.Group>
              
              <Button type="submit" className="w-100 fw-bold" variant="primary" disabled={creatingSlots}>
                {creatingSlots ? <Spinner size="sm" animation="border" /> : "Tambahkan"}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Col>

      <Col md={7}>
        <Card className="shadow-sm border-0 h-100 bg-light">
          <Card.Header className="bg-white fw-bold d-flex justify-content-between align-items-center">
            <span>Daftar Slot Rutin</span>
            <Button variant="outline-secondary" size="sm" onClick={fetchMySlots}>Refresh</Button>
          </Card.Header>
          <Card.Body className="p-2 overflow-auto" style={{ maxHeight: "600px" }}>
            {loading ? <div className="text-center p-5"><Spinner animation="border" /></div> : slots.length === 0 ? <div className="text-center p-5 text-muted">Belum ada jadwal.</div> : (
              <Accordion defaultActiveKey={["Senin"]}>
                {daysOrder.map((dayName, idx) => {
                  const daySlots = groupedSlots[dayName];
                  if (!daySlots || daySlots.length === 0) return null;
                  return (
                    <Accordion.Item eventKey={dayName} key={idx} className="mb-2 border-0 shadow-sm rounded">
                      <Accordion.Header>
                         <span className="fw-bold text-primary me-2">{dayName}</span>
                         <Badge bg="light" text="dark" className="border">{daySlots.length} Sesi</Badge>
                      </Accordion.Header>
                      <Accordion.Body className="bg-white p-0">
                        {daySlots.map((slot) => (
                          <div key={slot.id} className="d-flex justify-content-between align-items-center p-3 border-bottom">
                            <div className="d-flex align-items-center gap-3">
                              <div className="text-center bg-light rounded p-2" style={{ minWidth: "80px" }}>
                                <div className="fw-bold text-dark">{new Date(slot.start_time).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</div>
                                <div className="small text-muted">- {new Date(slot.end_time).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</div>
                              </div>
                              <div>
                                <div className="fw-bold">{slot.subject}</div>
                                {slot.student_id ? (
                                  <div className="text-success small fw-bold"><UserCheck size={14} className="me-1" /> {slot.student?.full_name}</div>
                                ) : slot.student_name_manual ? (
                                  <div className="text-info small fw-bold"><User size={14} className="me-1" /> {slot.student_name_manual} (Manual)</div>
                                ) : <div className="text-muted small fst-italic">Masih Kosong</div>}
                              </div>
                            </div>
                            <div className="d-flex gap-2">
                                <Button variant="outline-primary" size="sm" className="border-0" onClick={() => handleEditClick(slot)}><Edit size={16} /></Button>
                                <Button variant="outline-danger" size="sm" className="border-0" onClick={() => setDeleteModal({ show: true, id: slot.id })}><Trash2 size={16} /></Button>
                            </div>
                          </div>
                        ))}
                      </Accordion.Body>
                    </Accordion.Item>
                  );
                })}
              </Accordion>
            )}
          </Card.Body>
        </Card>
      </Col>
      
      {/* --- MODALS (EDIT & DELETE) --- */}
      <Modal show={deleteModal.show} onHide={() => setDeleteModal({ show: false, id: null })} centered>
        <Modal.Body className="text-center p-4">
          <div className="mx-auto mb-3 p-3 bg-red-100 rounded-full w-fit text-red-600"><Trash2 size={32} /></div>
          <h5 className="fw-bold">Hapus Slot?</h5>
          <div className="d-flex justify-content-center gap-2 mt-3">
            <Button variant="secondary" onClick={() => setDeleteModal({ show: false, id: null })}>Batal</Button>
            <Button variant="danger" onClick={handleDeleteSlot}>Ya, Hapus</Button>
          </div>
        </Modal.Body>
      </Modal>

      <Modal show={editModal.show} onHide={() => setEditModal({ show: false, slotId: null })} centered>
        <Modal.Header closeButton><Modal.Title>Edit Slot</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
                <Form.Label>Mata Pelajaran</Form.Label>
                <Form.Control type="text" value={editForm.subject} onChange={(e) => setEditForm({...editForm, subject: e.target.value})} />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label className="d-block fw-bold">Penugasan Siswa</Form.Label>
                <div className="mb-2">
                    <Form.Check inline type="radio" label="Siswa Terdaftar" name="assignType" checked={editForm.assignType === 'registered'} onChange={() => setEditForm({...editForm, assignType: 'registered'})} />
                    <Form.Check inline type="radio" label="Manual" name="assignType" checked={editForm.assignType === 'manual'} onChange={() => setEditForm({...editForm, assignType: 'manual'})} />
                </div>
                {editForm.assignType === 'registered' ? (
                    <Form.Select value={editForm.studentId} onChange={(e) => setEditForm({...editForm, studentId: e.target.value})}>
                        <option value="">-- Kosongkan --</option>
                        {students.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                    </Form.Select>
                ) : (
                    <Form.Control type="text" placeholder="Nama siswa..." value={editForm.studentNameManual} onChange={(e) => setEditForm({...editForm, studentNameManual: e.target.value})} />
                )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setEditModal({ show: false, slotId: null })}>Batal</Button>
          <Button variant="primary" onClick={handleSaveEdit} disabled={savingEdit}>{savingEdit ? <Spinner size="sm" /> : "Simpan"}</Button>
        </Modal.Footer>
      </Modal>
    </Row>
  );
}