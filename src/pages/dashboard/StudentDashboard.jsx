import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Tabs,
  Tab,
  Alert,
  Button,
  Modal,
  Form,
  Spinner,
} from "react-bootstrap";
import {
  Calendar,
  PenTool,
  BookOpen,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Star,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

import StudentInfoCard from "./student/StudentInfoCard";
import StudentScheduleTab from "./student/StudentScheduleTab/StudentScheduleTab";
import StudentMaterialsTab from "./student/StudentMaterialsTab";
import StudentGradesTab from "./student/StudentGradesTab";
import ExerciseTab from "./student/ExerciseTab";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExpired, setIsExpired] = useState(false);

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

        const { data } = await query.single();
        setActiveInvoice(data);

        if (
          data &&
          data.status === "paid" &&
          data.expiry_date &&
          new Date() > new Date(data.expiry_date)
        ) {
          setIsExpired(true);
        }
      } catch (err) {
        console.error("Invoice check error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [user]);

  const handleSubmitReview = async () => {
    if (!reviewForm.content) {
      return showModal("Gagal", "Isi ulasan Anda!", "error");
    }

    setSubmittingReview(true);
    try {
      await supabase.from("testimonials").insert({
        student_id: user.id,
        rating: reviewForm.rating,
        content: reviewForm.content,
      });

      setReviewModal(false);
      showModal("Terima Kasih!", "Ulasan terkirim.", "success");
      setReviewForm({ rating: 5, content: "" });
    } catch (err) {
      showModal("Gagal", err.message, "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Memuat dashboard...</div>;
  }

  if (!activeInvoice) {
    return (
      <Alert variant="warning" className="p-4">
        Paket Belum Aktif.{" "}
        <Button href="/#pricing" variant="warning" size="sm">
          Pilih Paket
        </Button>
      </Alert>
    );
  }

  if (isExpired) {
    return (
      <Alert variant="danger" className="text-center p-5">
        <h3>Masa Aktif Berakhir</h3>
        <Button href="/#pricing" variant="primary">
          Perpanjang
        </Button>
      </Alert>
    );
  }

  if (activeInvoice.status !== "paid") {
    return (
      <Alert variant="info" className="text-center p-5">
        Status: {activeInvoice.status}.{" "}
        <Button href="/invoice" variant="outline-info">
          Cek Invoice
        </Button>
      </Alert>
    );
  }

  return (
    <Row className="g-4">
      <Col xs={12}>
        <StudentInfoCard
          user={user}
          activeInvoice={activeInvoice}
          onReviewClick={() => setReviewModal(true)}
        />
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
                <StudentScheduleTab user={user} showModal={showModal} />
              </Tab>

              <Tab
                eventKey="latihan"
                title={
                  <>
                    <PenTool size={18} className="me-2" />
                    Latihan Soal
                  </>
                }
              >
                <ExerciseTab user={user} />
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
                <StudentMaterialsTab />
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
                <StudentGradesTab user={user} />
              </Tab>
            </Tabs>
          </Card.Body>
        </Card>
      </Col>

      <Modal show={reviewModal} onHide={() => setReviewModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Beri Ulasan</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <div className="mb-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={32}
                fill={s <= reviewForm.rating ? "orange" : "none"}
                color={s <= reviewForm.rating ? "orange" : "#ccc"}
                onClick={() => setReviewForm({ ...reviewForm, rating: s })}
                style={{ cursor: "pointer" }}
              />
            ))}
          </div>
          <Form.Control
            as="textarea"
            rows={3}
            value={reviewForm.content}
            onChange={(e) =>
              setReviewForm({ ...reviewForm, content: e.target.value })
            }
            placeholder="Tulis ulasan pengalaman belajar Anda..."
          />
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleSubmitReview} disabled={submittingReview}>
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
          <h5 className="fw-bold">{infoModal.title}</h5>
          <p className="text-muted">{infoModal.msg}</p>
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
