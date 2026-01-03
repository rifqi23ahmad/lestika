import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Badge,
  Button,
  Alert,
  ListGroup,
  Spinner,
  Tab,
  Tabs,
  Table,
  Modal,
  Form,
  Accordion,
} from "react-bootstrap";
import {
  Award,
  BookOpen,
  Clock,
  AlertTriangle,
  Download,
  TrendingUp,
  MessageSquare,
  Star,
  CheckCircle,
  Calendar,
  User,
  Check,
  HelpCircle, // [BARU] Icon untuk modal konfirmasi
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExpired, setIsExpired] = useState(false);

  const [materials, setMaterials] = useState([]);
  const [grades, setGrades] = useState([]);

  const [slots, setSlots] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false); // [UBAH] Jadi boolean global untuk modal
  const [loadingData, setLoadingData] = useState(false);

  const [confirmModal, setConfirmModal] = useState({ show: false, slot: null });

  const [reviewModal, setReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, content: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [infoModal, setInfoModal] = useState({
    show: false,
    title: "",
    msg: "",
    type: "success",
  });

  const showModal = (title, msg, type = "success") =>
    setInfoModal({ show: true, title, msg, type });

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStartOfWeek = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday.toISOString();
  };

  const groupSlotsByDayName = (slotList) => {
    const dayNames = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];
    const renderOrder = [
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
      "Minggu",
    ];
    const groups = {};
    renderOrder.forEach((d) => (groups[d] = []));
    slotList.forEach((slot) => {
      const d = new Date(slot.start_time);
      const dayName = dayNames[d.getDay()];
      if (groups[dayName]) groups[dayName].push(slot);
    });
    return groups;
  };

  useEffect(() => {
    const fetchStatus = async () => {
      if (!user) return;
      try {
        let query = supabase
          .from("invoices")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1);
        if (user.id) query = query.eq("user_id", user.id);
        else query = query.eq("email", user.email);

        const { data, error } = await query.single();
        if (error && error.code !== "PGRST116")
          console.error("Error fetch invoice:", error);

        setActiveInvoice(data);
        if (data && data.status === "paid") {
          if (data.expiry_date && new Date() > new Date(data.expiry_date)) {
            setIsExpired(true);
          } else {
            setIsExpired(false);
            fetchAcademicData();
            fetchAvailableSlots();
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, [user]);

  const fetchAcademicData = async () => {
    setLoadingData(true);
    try {
      const { data: matData } = await supabase
        .from("materials")
        .select("*")
        .order("created_at", { ascending: false });
      setMaterials(matData || []);
      const { data: gradeData } = await supabase
        .from("grades")
        .select("*")
        .eq("student_id", user.id)
        .order("created_at", { ascending: false });
      setGrades(gradeData || []);
    } catch (err) {
      console.error("Gagal ambil data:", err);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const startOfWeek = getStartOfWeek();
      const { data, error } = await supabase
        .from("teaching_slots")
        .select(`*, teacher:profiles!teacher_id ( full_name )`)
        .gte("start_time", startOfWeek)
        .order("start_time", { ascending: true });

      if (error) throw error;
      setSlots(data || []);
    } catch (err) {
      console.error("Gagal ambil jadwal:", err);
    }
  };

  const handleBookClick = (slot) => {
    setConfirmModal({ show: true, slot });
  };

  const processBooking = async () => {
    const slot = confirmModal.slot;
    if (!slot) return;

    setBookingLoading(true);
    try {
      const { error } = await supabase
        .from("teaching_slots")
        .update({ status: "booked", student_id: user.id })
        .eq("id", slot.id)
        .eq("status", "open");

      if (error) throw error;

      setConfirmModal({ show: false, slot: null });
      showModal(
        "Berhasil",
        "Jadwal berhasil dipilih! Mohon hadir tepat waktu.",
        "success"
      );
      fetchAvailableSlots();
    } catch (err) {
      setConfirmModal({ show: false, slot: null });
      showModal(
        "Gagal",
        "Jadwal gagal diambil (mungkin baru saja terisi).",
        "error"
      );
      fetchAvailableSlots();
    } finally {
      setBookingLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewForm.content)
      return showModal("Gagal", "Isi ulasan Anda!", "error");
    setSubmittingReview(true);
    try {
      const { error } = await supabase.from("testimonials").insert({
        student_id: user.id,
        rating: reviewForm.rating,
        content: reviewForm.content,
      });
      if (error) throw error;
      setReviewModal(false);
      showModal("Terima Kasih!", "Ulasan terkirim.", "success");
      setReviewForm({ rating: 5, content: "" });
    } catch (err) {
      showModal("Gagal", err.message, "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading)
    return <div className="p-4 text-center">Memuat dashboard...</div>;
  if (!activeInvoice)
    return (
      <Alert variant="warning" className="p-4">
        Paket Belum Aktif.{" "}
        <Button href="/#pricing" variant="warning" size="sm">
          Pilih Paket
        </Button>
      </Alert>
    );
  if (isExpired)
    return (
      <Alert variant="danger" className="text-center p-5">
        <h3>Masa Aktif Berakhir</h3>
        <Button href="/#pricing" variant="primary">
          Perpanjang
        </Button>
      </Alert>
    );
  if (activeInvoice.status !== "paid")
    return (
      <Alert variant="info" className="text-center p-5">
        Status: {activeInvoice.status}.{" "}
        <Button href="/invoice" variant="outline-info">
          Cek Invoice
        </Button>
      </Alert>
    );

  const groupedSlots = groupSlotsByDayName(slots);
  const daysOrder = [
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
    "Minggu",
  ];

  return (
    <Row className="g-4">
      <Col xs={12}>
        <Card className="bg-success text-white shadow border-0 overflow-hidden">
          <Card.Body className="p-4 d-flex justify-content-between align-items-center">
            <div>
              <Badge bg="light" text="success" className="mb-2">
                Paket Aktif
              </Badge>
              <h2 className="fw-bold">{activeInvoice.package_name}</h2>
              <div className="d-flex align-items-center gap-2 mt-2">
                <Clock size={16} />
                <span className="small">
                  Berlaku hingga:{" "}
                  <strong>
                    {activeInvoice.expiry_date
                      ? formatDate(activeInvoice.expiry_date)
                      : "Selamanya"}
                  </strong>
                </span>
              </div>
              <Button
                variant="outline-light"
                size="sm"
                className="mt-3 rounded-pill px-3"
                onClick={() => setReviewModal(true)}
              >
                <MessageSquare size={16} className="me-2" /> Beri Ulasan
              </Button>
            </div>
            <Award size={64} className="opacity-50 text-white" />
          </Card.Body>
        </Card>
      </Col>

      <Col md={12}>
        <Card className="shadow-sm border-0">
          <Card.Body>
            <Tabs
              defaultActiveKey="jadwal"
              id="student-tabs"
              className="mb-4"
              fill
            >
              <Tab
                eventKey="jadwal"
                title={
                  <>
                    <Calendar size={18} className="me-2" />
                    Pilih Jadwal
                  </>
                }
              >
                {loadingData ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" />
                  </div>
                ) : slots.length === 0 ? (
                  <Alert
                    variant="light"
                    className="text-center text-muted border border-dashed py-5"
                  >
                    <Calendar size={48} className="mb-3 opacity-25" />
                    <p>Belum ada jadwal guru yang tersedia minggu ini.</p>
                  </Alert>
                ) : (
                  <Accordion defaultActiveKey={["0"]} alwaysOpen>
                    {daysOrder.map((day, index) => {
                      const daySlots = groupedSlots[day];
                      if (!daySlots || daySlots.length === 0) return null;

                      return (
                        <Accordion.Item
                          eventKey={index.toString()}
                          key={day}
                          className="mb-3 border rounded shadow-sm overflow-hidden"
                        >
                          <Accordion.Header>
                            <span className="fw-bold text-primary me-2">
                              {day}
                            </span>
                            <Badge bg="secondary" pill>
                              {daySlots.length} Sesi
                            </Badge>
                          </Accordion.Header>
                          <Accordion.Body className="bg-light p-0">
                            {daySlots.map((slot) => {
                              const isMySlot = slot.student_id === user.id;
                              const isBooked =
                                slot.status === "booked" && !isMySlot;

                              return (
                                <div
                                  key={slot.id}
                                  className={`p-3 border-bottom bg-white d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 ${
                                    isMySlot ? "bg-success bg-opacity-10" : ""
                                  }`}
                                >
                                  <div className="d-flex align-items-center gap-3">
                                    <div
                                      className="text-center border rounded p-2 bg-white"
                                      style={{ minWidth: "80px" }}
                                    >
                                      <div className="fw-bold fs-5 text-dark">
                                        {formatTime(slot.start_time)}
                                      </div>
                                      <small
                                        className="text-muted"
                                        style={{ fontSize: "0.75rem" }}
                                      >
                                        {formatTime(slot.end_time)}
                                      </small>
                                    </div>
                                    <div>
                                      <div className="fw-bold text-dark fs-6">
                                        {slot.subject}
                                      </div>
                                      <div className="text-primary small fw-medium mt-1 d-flex align-items-center">
                                        <User size={14} className="me-1" />{" "}
                                        {slot.teacher?.full_name}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="d-flex justify-content-end">
                                    {isMySlot ? (
                                      <Badge
                                        bg="success"
                                        className="px-3 py-2 d-flex align-items-center"
                                      >
                                        <Check size={14} className="me-1" />{" "}
                                        Milik Anda
                                      </Badge>
                                    ) : isBooked ? (
                                      <Badge
                                        bg="secondary"
                                        className="px-3 py-2 opacity-50"
                                      >
                                        Terisi
                                      </Badge>
                                    ) : (
                                      <Button
                                        variant="primary"
                                        size="sm"
                                        className="px-4 fw-bold rounded-pill shadow-sm"
                                        onClick={() => handleBookClick(slot)}
                                      >
                                        Pilih
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </Accordion.Body>
                        </Accordion.Item>
                      );
                    })}
                  </Accordion>
                )}
              </Tab>

              <Tab
                eventKey="materi"
                title={
                  <>
                    <BookOpen size={18} className="me-2" />
                    Materi
                  </>
                }
              >
                {materials.length === 0 ? (
                  <Alert variant="light" className="text-center py-5">
                    Belum ada materi.
                  </Alert>
                ) : (
                  <ListGroup variant="flush">
                    {materials.map((item) => (
                      <ListGroup.Item
                        key={item.id}
                        className="d-flex justify-content-between align-items-center py-3"
                      >
                        <div>
                          <h6 className="fw-bold mb-1">{item.title}</h6>
                          <small className="text-muted">
                            Jenjang: {item.jenjang} •{" "}
                            {formatDate(item.created_at)}
                          </small>
                        </div>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          href={item.file_url}
                          target="_blank"
                        >
                          <Download size={16} className="me-2" /> Unduh
                        </Button>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </Tab>

              <Tab
                eventKey="nilai"
                title={
                  <>
                    <TrendingUp size={18} className="me-2" />
                    Nilai
                  </>
                }
              >
                {grades.length === 0 ? (
                  <Alert variant="light" className="text-center py-5">
                    Belum ada nilai.
                  </Alert>
                ) : (
                  <Table hover className="align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Mapel</th>
                        <th className="text-center">Nilai</th>
                        <th>Feedback</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grades.map((g) => (
                        <tr key={g.id}>
                          <td className="fw-bold">{g.subject}</td>
                          <td className="text-center">
                            <Badge bg={g.score >= 75 ? "success" : "warning"}>
                              {g.score}
                            </Badge>
                          </td>
                          <td className="text-muted small">
                            "{g.feedback || "-"}"
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Tab>
            </Tabs>
          </Card.Body>
        </Card>
      </Col>

      <Modal
        show={confirmModal.show}
        onHide={() => setConfirmModal({ show: false, slot: null })}
        centered
      >
        <Modal.Body className="text-center p-4">
          <div className="mx-auto mb-3 p-3 bg-primary bg-opacity-10 rounded-circle d-inline-flex text-primary">
            <HelpCircle size={32} />
          </div>
          <h5 className="fw-bold mb-3">Konfirmasi Pemilihan Jadwal</h5>
          <p className="text-muted mb-4">
            Apakah Anda yakin ingin mengambil slot jadwal ini?
          </p>

          {confirmModal.slot && (
            <Card className="bg-light border-0 mb-4 text-start">
              <Card.Body className="p-3">
                <div className="d-flex align-items-center mb-2">
                  <Calendar size={18} className="text-primary me-2" />
                  <span className="fw-bold text-dark">
                    {new Date(confirmModal.slot.start_time).toLocaleDateString(
                      "id-ID",
                      { weekday: "long" }
                    )}
                    ,{" " + formatTime(confirmModal.slot.start_time)}
                  </span>
                </div>
                <div className="d-flex align-items-center mb-2">
                  <BookOpen size={18} className="text-primary me-2" />
                  <span className="text-dark">{confirmModal.slot.subject}</span>
                </div>
                <div className="d-flex align-items-center">
                  <User size={18} className="text-primary me-2" />
                  <span className="text-dark">
                    {confirmModal.slot.teacher?.full_name}
                  </span>
                </div>
              </Card.Body>
            </Card>
          )}

          <div className="d-flex gap-2 justify-content-center">
            <Button
              variant="outline-secondary"
              className="px-4"
              onClick={() => setConfirmModal({ show: false, slot: null })}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              className="px-4 fw-bold"
              onClick={processBooking}
              disabled={bookingLoading}
            >
              {bookingLoading ? (
                <Spinner size="sm" animation="border" />
              ) : (
                "Ya, Ambil Jadwal"
              )}
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      <Modal show={reviewModal} onHide={() => setReviewModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Beri Ulasan</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <div className="mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={32}
                className={`mx-1 cursor-pointer ${
                  star <= reviewForm.rating
                    ? "text-warning fill-warning"
                    : "text-light-gray"
                }`}
                onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                fill={star <= reviewForm.rating ? "#ffc107" : "none"}
              />
            ))}
          </div>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Ceritakan pengalamanmu..."
            value={reviewForm.content}
            onChange={(e) =>
              setReviewForm({ ...reviewForm, content: e.target.value })
            }
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={handleSubmitReview}
            disabled={submittingReview}
          >
            {submittingReview ? <Spinner size="sm" /> : "Kirim"}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={infoModal.show}
        onHide={() => setInfoModal({ ...infoModal, show: false })}
        centered
        size="sm"
      >
        <Modal.Body className="text-center p-4">
          <div
            className={`mx-auto mb-3 p-3 rounded-circle d-inline-flex ${
              infoModal.type === "error"
                ? "bg-danger bg-opacity-10 text-danger"
                : "bg-success bg-opacity-10 text-success"
            }`}
          >
            {infoModal.type === "error" ? (
              <AlertTriangle size={32} />
            ) : (
              <CheckCircle size={32} />
            )}
          </div>
          <h5 className="fw-bold mb-2">{infoModal.title}</h5>
          <p className="text-muted mb-4">{infoModal.msg}</p>
          <Button
            variant={infoModal.type === "error" ? "danger" : "success"}
            className="w-100 rounded-pill"
            onClick={() => setInfoModal({ ...infoModal, show: false })}
          >
            Tutup
          </Button>
        </Modal.Body>
      </Modal>
    </Row>
  );
}
