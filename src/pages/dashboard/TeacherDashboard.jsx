import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Form,
  Table,
  Badge,
  Tab,
  Tabs,
  Modal,
  Spinner,
} from "react-bootstrap";
import {
  Upload,
  UserCheck,
  Calendar,
  Trash2,
  UserPlus,
  CheckCircle,
  AlertTriangle,
  FileText,
  Layers,
  Clock,
  MonitorPlay,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

export default function TeacherDashboard() {
  const { user } = useAuth();

  const [students, setStudents] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  const [slotForm, setSlotForm] = useState({
    startDate: "",
    endDate: "",
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

  useEffect(() => {
    fetchStudents();
    if (user) fetchMySlots();
  }, [user]);

  const isToday = (dateString) => {
    const d = new Date(dateString);
    const today = new Date();
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  };

  const showModal = (title, msg, type = "info") => {
    setModalData({ show: true, title, msg, type });
  };

  const formatDateGuru = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
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

  const handleCreateBulkSlots = async (e) => {
    e.preventDefault();
    if (
      !slotForm.startDate ||
      !slotForm.endDate ||
      !slotForm.startTime ||
      !slotForm.endTime
    ) {
      return showModal(
        "Validasi Gagal",
        "Mohon lengkapi rentang tanggal dan jam!",
        "error"
      );
    }

    setCreatingSlots(true);
    try {
      const slotsToInsert = [];
      let currentDate = new Date(slotForm.startDate);
      const lastDate = new Date(slotForm.endDate);

      while (currentDate <= lastDate) {
        let timeCursor = new Date(currentDate);
        const [startH, startM] = slotForm.startTime.split(":").map(Number);
        timeCursor.setHours(startH, startM, 0, 0);

        let dayEndTime = new Date(currentDate);
        const [endH, endM] = slotForm.endTime.split(":").map(Number);
        dayEndTime.setHours(endH, endM, 0, 0);

        while (timeCursor < dayEndTime) {
          const slotStart = new Date(timeCursor);
          const slotEnd = new Date(
            timeCursor.getTime() + slotForm.duration * 60000
          );

          if (slotEnd > dayEndTime) break;

          slotsToInsert.push({
            teacher_id: user.id,
            subject: slotForm.subject,
            start_time: slotStart.toISOString(),
            end_time: slotEnd.toISOString(),
            status: "open",
            student_id: null,
          });
          timeCursor = slotEnd;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      if (slotsToInsert.length === 0)
        throw new Error(
          "Tidak ada slot yang bisa dibuat dalam rentang waktu tersebut."
        );

      const { error } = await supabase
        .from("teaching_slots")
        .insert(slotsToInsert);
      if (error) throw error;

      showModal(
        "Berhasil!",
        `Berhasil membuat ${slotsToInsert.length} slot jadwal baru.`,
        "success"
      );
      setSlotForm({
        ...slotForm,
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: "",
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

  const todayClasses = slots.filter(
    (slot) => isToday(slot.start_time) && slot.student_id
  );

  return (
    <div className="pb-5">
      <Tabs defaultActiveKey="today" className="mb-4 border-bottom-0">
        {/* [BARU] TAB 1: JADWAL SAYA HARI INI */}
        <Tab
          eventKey="today"
          title={
            <>
              <MonitorPlay size={18} className="me-2" />
              Jadwal Saya
            </>
          }
        >
          <Row>
            <Col md={12}>
              <div className="d-flex align-items-center mb-3">
                <h4 className="fw-bold mb-0 me-2 text-primary">
                  Kelas Hari Ini
                </h4>
                <Badge bg="info" pill>
                  {new Date().toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </Badge>
              </div>
            </Col>

            {todayClasses.length === 0 ? (
              <Col md={12}>
                <Card className="shadow-sm border-0 py-5 text-center bg-light">
                  <div className="mx-auto text-muted mb-3 opacity-50">
                    <CheckCircle size={48} />
                  </div>
                  <h5>Tidak ada kelas hari ini.</h5>
                  <p className="text-muted">
                    Nikmati waktu istirahat Anda, atau cek tab "Kelola Jadwal"
                    untuk hari lain.
                  </p>
                </Card>
              </Col>
            ) : (
              todayClasses.map((slot) => (
                <Col md={4} key={slot.id} className="mb-4">
                  <Card className="shadow-sm border-0 h-100 border-start border-4 border-primary">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <Badge bg="primary" className="py-2 px-3 fs-6">
                          {new Date(slot.start_time).toLocaleTimeString(
                            "id-ID",
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                          {" - "}
                          {new Date(slot.end_time).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Badge>
                        <Badge bg="light" text="dark" className="border">
                          {slot.subject}
                        </Badge>
                      </div>
                      <h5 className="fw-bold mb-1">
                        {slot.student?.full_name}
                      </h5>
                      <p className="text-muted small mb-3">Siswa</p>

                      <div className="d-grid">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => {
                            showModal(
                              "Info Kelas",
                              `Kelas ${slot.subject} dengan ${
                                slot.student?.full_name
                              } dimulai jam ${new Date(
                                slot.start_time
                              ).toLocaleTimeString("id-ID")}`,
                              "info"
                            );
                          }}
                        >
                          Detail Kelas
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            )}
          </Row>
        </Tab>

        {/* TAB 2: KELOLA JADWAL MASSAL */}
        <Tab
          eventKey="jadwal"
          title={
            <>
              <Calendar size={18} className="me-2" />
              Kelola Jadwal
            </>
          }
        >
          <Row className="g-4">
            <Col md={5}>
              <Card className="shadow-sm border-0 h-100">
                <Card.Header className="bg-primary text-white fw-bold d-flex align-items-center">
                  <Layers size={18} className="me-2" /> Generator Jadwal (Bulk)
                </Card.Header>
                <Card.Body>
                  <Form onSubmit={handleCreateBulkSlots}>
                    <AlertTriangle
                      size={16}
                      className="text-warning mb-2 me-1"
                    />
                    <small className="text-muted d-block mb-3">
                      Fitur ini akan membuat banyak slot sekaligus berdasarkan
                      rentang tanggal dan jam kerja yang Anda atur.
                    </small>
                    <Form.Group className="mb-3">
                      <Form.Label>Mata Pelajaran</Form.Label>
                      <Form.Control
                        type="text"
                        value={slotForm.subject}
                        onChange={(e) =>
                          setSlotForm({ ...slotForm, subject: e.target.value })
                        }
                        required
                      />
                    </Form.Group>
                    <Row>
                      <Col xs={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Dari Tanggal</Form.Label>
                          <Form.Control
                            type="date"
                            value={slotForm.startDate}
                            onChange={(e) =>
                              setSlotForm({
                                ...slotForm,
                                startDate: e.target.value,
                              })
                            }
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Sampai Tanggal</Form.Label>
                          <Form.Control
                            type="date"
                            value={slotForm.endDate}
                            onChange={(e) =>
                              setSlotForm({
                                ...slotForm,
                                endDate: e.target.value,
                              })
                            }
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <hr className="my-2" />
                    <Row>
                      <Col xs={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Jam Mulai (Harian)</Form.Label>
                          <Form.Control
                            type="time"
                            value={slotForm.startTime}
                            onChange={(e) =>
                              setSlotForm({
                                ...slotForm,
                                startTime: e.target.value,
                              })
                            }
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Jam Selesai (Harian)</Form.Label>
                          <Form.Control
                            type="time"
                            value={slotForm.endTime}
                            onChange={(e) =>
                              setSlotForm({
                                ...slotForm,
                                endTime: e.target.value,
                              })
                            }
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Form.Group className="mb-4">
                      <Form.Label>Durasi Per Sesi (Menit)</Form.Label>
                      <Form.Control
                        type="number"
                        value={slotForm.duration}
                        onChange={(e) =>
                          setSlotForm({ ...slotForm, duration: e.target.value })
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
                        "Buat Semua Slot Kosong"
                      )}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>

            <Col md={7}>
              <Card className="shadow-sm border-0 h-100">
                <Card.Header className="bg-white fw-bold d-flex justify-content-between align-items-center">
                  <span>Daftar Slot Anda</span>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={fetchMySlots}
                  >
                    Refresh
                  </Button>
                </Card.Header>
                <div className="table-responsive">
                  <Table hover className="mb-0 align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Waktu</th>
                        <th>Mapel</th>
                        <th>Status</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={4} className="text-center p-4">
                            Memuat data...
                          </td>
                        </tr>
                      ) : slots.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="text-center p-4 text-muted"
                          >
                            Belum ada jadwal.
                          </td>
                        </tr>
                      ) : (
                        slots.map((slot) => (
                          <tr key={slot.id}>
                            <td>
                              <div className="fw-bold">
                                {formatDateGuru(slot.start_time)}
                              </div>
                              <small className="text-muted">
                                {new Date(slot.start_time).toLocaleTimeString(
                                  "id-ID",
                                  { hour: "2-digit", minute: "2-digit" }
                                )}{" "}
                                -{" "}
                                {new Date(slot.end_time).toLocaleTimeString(
                                  "id-ID",
                                  { hour: "2-digit", minute: "2-digit" }
                                )}
                              </small>
                            </td>
                            <td>{slot.subject}</td>
                            <td>
                              {slot.student_id ? (
                                <Badge
                                  bg="success"
                                  className="d-flex align-items-center w-fit"
                                >
                                  <UserCheck size={12} className="me-1" />{" "}
                                  {slot.student?.full_name}
                                </Badge>
                              ) : (
                                <Badge bg="secondary">Kosong</Badge>
                              )}
                            </td>
                            <td>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => confirmDelete(slot.id)}
                              >
                                <Trash2 size={14} />
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

        {/* TAB 3: INPUT NILAI */}
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

        {/* TAB 4: UPLOAD MATERI */}
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
