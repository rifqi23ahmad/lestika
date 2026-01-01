import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Form,
  Badge,
  Tab,
  Tabs,
  Modal,
  Spinner,
  Accordion,
  ToggleButton,
} from "react-bootstrap";
import {
  Upload,
  UserCheck,
  Calendar,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Clock,
  Repeat,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

export default function TeacherDashboard() {
  const { user } = useAuth();

  const [students, setStudents] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  const [scheduleForm, setScheduleForm] = useState({
    selectedDays: [], // Array index hari (1=Senin, 0=Minggu, dst)
    startTime: "",
    endTime: "",
    subject: "Matematika",
    duration: 60,
  });

  const [gradeForm, setGradeForm] = useState({
    studentId: "",
    subject: "",
    score: "",
    feedback: "",
  });
  const [materialForm, setMaterialForm] = useState({
    title: "",
    file: null,
    jenjang: "Umum",
  });

  const [uploading, setUploading] = useState(false);
  const [creatingSlots, setCreatingSlots] = useState(false);
  const [modalData, setModalData] = useState({
    show: false,
    title: "",
    msg: "",
    type: "info",
  });
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });

  const daysOrder = [
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
    "Minggu",
  ];
  const daysMap = [
    { name: "Minggu", value: 0 },
    { name: "Senin", value: 1 },
    { name: "Selasa", value: 2 },
    { name: "Rabu", value: 3 },
    { name: "Kamis", value: 4 },
    { name: "Jumat", value: 5 },
    { name: "Sabtu", value: 6 },
  ];

  useEffect(() => {
    fetchStudents();
    if (user) fetchMySlots();
  }, [user]);

  const showModal = (title, msg, type = "info") => {
    setModalData({ show: true, title, msg, type });
  };

  const fetchStudents = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("role", "siswa");
    setStudents(data || []);
  };

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
    if (currentDays.includes(dayValue)) {
      setScheduleForm({
        ...scheduleForm,
        selectedDays: currentDays.filter((d) => d !== dayValue),
      });
    } else {
      setScheduleForm({
        ...scheduleForm,
        selectedDays: [...currentDays, dayValue],
      });
    }
  };

  const getNextDayDate = (dayIndex) => {
    const d = new Date();
    d.setDate(d.getDate() + ((dayIndex + 7 - d.getDay()) % 7));
    return d;
  };

  const handleCreateRoutineSlots = async (e) => {
    e.preventDefault();
    if (
      scheduleForm.selectedDays.length === 0 ||
      !scheduleForm.startTime ||
      !scheduleForm.endTime
    ) {
      return showModal(
        "Validasi Gagal",
        "Pilih minimal satu hari, jam mulai, dan jam selesai.",
        "error"
      );
    }

    setCreatingSlots(true);
    try {
      const slotsToInsert = [];

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
          const slotEnd = new Date(
            timeCursor.getTime() + scheduleForm.duration * 60000
          );

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

      if (slotsToInsert.length === 0) {
        throw new Error("Gagal membuat slot. Periksa jam mulai dan selesai.");
      }

      const { error } = await supabase
        .from("teaching_slots")
        .insert(slotsToInsert);
      if (error) throw error;

      showModal(
        "Berhasil!",
        `Berhasil menambahkan ${slotsToInsert.length} slot rutinitas baru.`,
        "success"
      );

      setScheduleForm({
        ...scheduleForm,
        selectedDays: [],
      });
      fetchMySlots();
    } catch (err) {
      showModal("Error", err.message, "error");
    } finally {
      setCreatingSlots(false);
    }
  };

  const confirmDelete = (id) => setDeleteModal({ show: true, id });

  const handleDeleteSlot = async () => {
    if (!deleteModal.id) return;
    await supabase.from("teaching_slots").delete().eq("id", deleteModal.id);
    setDeleteModal({ show: false, id: null });
    fetchMySlots();
    showModal("Terhapus", "Slot jadwal berhasil dihapus.", "success");
  };

  const groupSlotsByDay = () => {
    const grouped = {};
    daysOrder.forEach((day) => (grouped[day] = []));

    slots.forEach((slot) => {
      const date = new Date(slot.start_time);
      const dayName = date.toLocaleDateString("id-ID", { weekday: "long" });
      if (grouped[dayName]) {
        grouped[dayName].push(slot);
      }
    });

    return grouped;
  };

  const groupedSlots = groupSlotsByDay();

  const handleSaveGrade = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("grades").insert({
        student_id: gradeForm.studentId,
        teacher_id: user.id,
        subject: gradeForm.subject,
        score: gradeForm.score,
        feedback: gradeForm.feedback,
      });
      if (error) throw error;
      showModal("Sukses", "Nilai berhasil disimpan!", "success");
      setGradeForm({ studentId: "", subject: "", score: "", feedback: "" });
    } catch (err) {
      showModal("Gagal", "Gagal simpan nilai: " + err.message, "error");
    }
  };

  const handleUploadMaterial = async (e) => {
    e.preventDefault();
    if (!materialForm.file || !materialForm.title)
      return showModal("Validasi", "Judul dan File wajib diisi!", "error");
    setUploading(true);
    try {
      const fileExt = materialForm.file.name.split(".").pop();
      const sanitizedTitle = materialForm.title.replace(/[^a-zA-Z0-9]/g, "_");
      const fileName = `${Date.now()}_${sanitizedTitle}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("materials")
        .upload(fileName, materialForm.file);
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("materials")
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase.from("materials").insert({
        title: materialForm.title,
        file_url: publicUrlData.publicUrl,
        teacher_id: user.id,
        jenjang: materialForm.jenjang,
      });
      if (dbError) throw dbError;

      showModal("Berhasil", "Materi berhasil diupload.", "success");
      setMaterialForm({ title: "", file: null, jenjang: "Umum" });
      document.getElementById("fileInput").value = null;
    } catch (err) {
      showModal("Gagal Upload", err.message, "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="pb-5">
      <Tabs defaultActiveKey="jadwal" className="mb-4 border-bottom-0">
        {/* TAB 1: KELOLA JADWAL (RUTINITAS) */}
        <Tab
          eventKey="jadwal"
          title={
            <>
              <Calendar size={18} className="me-2" />
              Kelola Jadwal Rutin
            </>
          }
        >
          <Row className="g-4">
            {/* INPUT FORM */}
            <Col md={5}>
              <Card className="shadow-sm border-0 h-100">
                <Card.Header className="bg-primary text-white fw-bold d-flex align-items-center">
                  <Repeat size={18} className="me-2" /> Buat Slot Rutin
                </Card.Header>
                <Card.Body>
                  <Form onSubmit={handleCreateRoutineSlots}>
                    <AlertTriangle
                      size={16}
                      className="text-warning mb-2 me-1"
                    />
                    <small className="text-muted d-block mb-3">
                      Slot ini akan berlaku mingguan. Pilih hari dan jam
                      ketersediaan Anda.
                    </small>

                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Pilih Hari</Form.Label>
                      <div className="d-flex flex-wrap gap-2">
                        {daysMap.map((day) => (
                          <ToggleButton
                            key={day.value}
                            id={`check-day-${day.value}`}
                            type="checkbox"
                            variant="outline-primary"
                            checked={scheduleForm.selectedDays.includes(
                              day.value
                            )}
                            value={day.value}
                            onChange={() => handleDayToggle(day.value)}
                            size="sm"
                            className="rounded-pill px-3"
                          >
                            {day.name}
                          </ToggleButton>
                        ))}
                      </div>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Mata Pelajaran</Form.Label>
                      <Form.Control
                        type="text"
                        value={scheduleForm.subject}
                        onChange={(e) =>
                          setScheduleForm({
                            ...scheduleForm,
                            subject: e.target.value,
                          })
                        }
                        required
                      />
                    </Form.Group>

                    <Row>
                      <Col xs={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Jam Mulai</Form.Label>
                          <Form.Control
                            type="time"
                            value={scheduleForm.startTime}
                            onChange={(e) =>
                              setScheduleForm({
                                ...scheduleForm,
                                startTime: e.target.value,
                              })
                            }
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Jam Selesai</Form.Label>
                          <Form.Control
                            type="time"
                            value={scheduleForm.endTime}
                            onChange={(e) =>
                              setScheduleForm({
                                ...scheduleForm,
                                endTime: e.target.value,
                              })
                            }
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-4">
                      <Form.Label>Durasi (Menit)</Form.Label>
                      <Form.Control
                        type="number"
                        value={scheduleForm.duration}
                        onChange={(e) =>
                          setScheduleForm({
                            ...scheduleForm,
                            duration: e.target.value,
                          })
                        }
                        required
                      />
                    </Form.Group>

                    <Button
                      type="submit"
                      className="w-100 fw-bold"
                      variant="primary"
                      disabled={creatingSlots}
                    >
                      {creatingSlots ? (
                        <Spinner size="sm" animation="border" />
                      ) : (
                        "Tambahkan ke Jadwal"
                      )}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>

            {/* LIST JADWAL (GROUPED BY DAY) */}
            <Col md={7}>
              <Card className="shadow-sm border-0 h-100 bg-light">
                <Card.Header className="bg-white fw-bold d-flex justify-content-between align-items-center">
                  <span>Daftar Slot Rutin</span>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={fetchMySlots}
                  >
                    Refresh
                  </Button>
                </Card.Header>
                <Card.Body
                  className="p-2 overflow-auto"
                  style={{ maxHeight: "600px" }}
                >
                  {loading ? (
                    <div className="text-center p-5">
                      <Spinner animation="border" />
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="text-center p-5 text-muted">
                      Belum ada jadwal rutin.
                    </div>
                  ) : (
                    <Accordion defaultActiveKey={["Senin"]}>
                      {daysOrder.map((dayName, idx) => {
                        const daySlots = groupedSlots[dayName];
                        if (!daySlots || daySlots.length === 0) return null;

                        return (
                          <Accordion.Item
                            eventKey={dayName}
                            key={idx}
                            className="mb-2 border-0 shadow-sm rounded"
                          >
                            <Accordion.Header>
                              <div className="d-flex justify-content-between w-100 me-3">
                                <span className="fw-bold text-primary">
                                  {dayName}
                                </span>
                                <Badge
                                  bg="light"
                                  text="dark"
                                  className="border"
                                >
                                  {daySlots.length} Sesi
                                </Badge>
                              </div>
                            </Accordion.Header>
                            <Accordion.Body className="bg-white p-0">
                              {daySlots.map((slot) => (
                                <div
                                  key={slot.id}
                                  className="d-flex justify-content-between align-items-center p-3 border-bottom"
                                >
                                  <div className="d-flex align-items-center gap-3">
                                    <div
                                      className="text-center bg-light rounded p-2"
                                      style={{ minWidth: "80px" }}
                                    >
                                      <div className="fw-bold text-dark">
                                        {new Date(
                                          slot.start_time
                                        ).toLocaleTimeString("id-ID", {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </div>
                                      <div className="small text-muted">
                                        -{" "}
                                        {new Date(
                                          slot.end_time
                                        ).toLocaleTimeString("id-ID", {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="fw-bold">
                                        {slot.subject}
                                      </div>
                                      {slot.student_id ? (
                                        <div className="text-success small fw-bold d-flex align-items-center">
                                          <UserCheck
                                            size={14}
                                            className="me-1"
                                          />{" "}
                                          {slot.student?.full_name}
                                        </div>
                                      ) : (
                                        <div className="text-muted small fst-italic">
                                          Masih Kosong
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    className="border-0"
                                    onClick={() => confirmDelete(slot.id)}
                                  >
                                    <Trash2 size={16} />
                                  </Button>
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
          </Row>
        </Tab>

        {/* TAB 2: INPUT NILAI */}
        <Tab
          eventKey="nilai"
          title={
            <>
              <UserCheck size={18} className="me-2" />
              Input Nilai
            </>
          }
        >
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Form onSubmit={handleSaveGrade}>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Label>Pilih Siswa</Form.Label>
                    <Form.Select
                      value={gradeForm.studentId}
                      onChange={(e) =>
                        setGradeForm({
                          ...gradeForm,
                          studentId: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">-- Pilih Siswa --</option>
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.full_name}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={6}>
                    <Form.Label>Mata Pelajaran</Form.Label>
                    <Form.Control
                      type="text"
                      value={gradeForm.subject}
                      onChange={(e) =>
                        setGradeForm({ ...gradeForm, subject: e.target.value })
                      }
                      required
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Label>Nilai (0-100)</Form.Label>
                    <Form.Control
                      type="number"
                      value={gradeForm.score}
                      onChange={(e) =>
                        setGradeForm({ ...gradeForm, score: e.target.value })
                      }
                      required
                    />
                  </Col>
                  <Col md={9}>
                    <Form.Label>Feedback / Catatan</Form.Label>
                    <Form.Control
                      type="text"
                      value={gradeForm.feedback}
                      onChange={(e) =>
                        setGradeForm({ ...gradeForm, feedback: e.target.value })
                      }
                    />
                  </Col>
                  <Col xs={12}>
                    <Button type="submit" variant="success">
                      Simpan Nilai
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
        </Tab>

        {/* TAB 3: UPLOAD MATERI */}
        <Tab
          eventKey="materi"
          title={
            <>
              <Upload size={18} className="me-2" />
              Upload Materi
            </>
          }
        >
          <Row className="justify-content-center">
            <Col md={8}>
              <Card className="shadow-sm border-0">
                <Card.Header className="bg-white fw-bold py-3">
                  Form Upload Materi Belajar
                </Card.Header>
                <Card.Body className="p-4">
                  <Form onSubmit={handleUploadMaterial}>
                    <Form.Group className="mb-3">
                      <Form.Label>Judul Materi</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Contoh: Modul Matematika Aljabar Dasar"
                        value={materialForm.title}
                        onChange={(e) =>
                          setMaterialForm({
                            ...materialForm,
                            title: e.target.value,
                          })
                        }
                        required
                      />
                    </Form.Group>
                    <Row className="mb-3">
                      <Col md={6}>
                        <Form.Label>Jenjang</Form.Label>
                        <Form.Select
                          value={materialForm.jenjang}
                          onChange={(e) =>
                            setMaterialForm({
                              ...materialForm,
                              jenjang: e.target.value,
                            })
                          }
                        >
                          <option value="Umum">Umum</option>
                          <option value="SD">SD</option>
                          <option value="SMP">SMP</option>
                          <option value="SMA">SMA</option>
                        </Form.Select>
                      </Col>
                      <Col md={6}>
                        <Form.Label>File (PDF/DOCX)</Form.Label>
                        <Form.Control
                          id="fileInput"
                          type="file"
                          onChange={(e) =>
                            setMaterialForm({
                              ...materialForm,
                              file: e.target.files[0],
                            })
                          }
                          required
                        />
                      </Col>
                    </Row>
                    <div className="d-grid mt-4">
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={uploading}
                      >
                        {uploading ? (
                          <Spinner size="sm" animation="border" />
                        ) : (
                          <>
                            <Upload size={18} className="me-2" /> Upload
                          </>
                        )}
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>
      </Tabs>

      {/* MODALS */}
      <Modal
        show={modalData.show}
        onHide={() => setModalData({ ...modalData, show: false })}
        centered
      >
        <Modal.Body className="text-center p-4">
          <div
            className={`mx-auto mb-3 p-3 rounded-full w-fit ${
              modalData.type === "error"
                ? "bg-red-100 text-red-600"
                : "bg-green-100 text-green-600"
            }`}
          >
            {modalData.type === "error" ? (
              <AlertTriangle size={32} />
            ) : (
              <CheckCircle size={32} />
            )}
          </div>
          <h5 className="fw-bold mb-2">{modalData.title}</h5>
          <p className="text-muted">{modalData.msg}</p>
          <Button
            variant={modalData.type === "error" ? "danger" : "success"}
            onClick={() => setModalData({ ...modalData, show: false })}
          >
            Tutup
          </Button>
        </Modal.Body>
      </Modal>

      <Modal
        show={deleteModal.show}
        onHide={() => setDeleteModal({ show: false, id: null })}
        centered
      >
        <Modal.Body className="text-center p-4">
          <div className="mx-auto mb-3 p-3 bg-red-100 rounded-full w-fit text-red-600">
            <Trash2 size={32} />
          </div>
          <h5 className="fw-bold mb-2">Hapus Slot Jadwal?</h5>
          <p className="text-muted">
            Apakah Anda yakin ingin menghapus slot ini?
          </p>
          <div className="d-flex justify-content-center gap-2">
            <Button
              variant="secondary"
              onClick={() => setDeleteModal({ show: false, id: null })}
            >
              Batal
            </Button>
            <Button variant="danger" onClick={handleDeleteSlot}>
              Ya, Hapus
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
