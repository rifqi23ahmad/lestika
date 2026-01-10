import React from "react";
import { Container, Row, Col, Button, Card, Badge } from "react-bootstrap";
import {
  BookOpen,
  Award,
  Calendar,
  MessageCircle,
  Clock,
  LayoutDashboard,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const StudentHome = ({ user, activeInvoice }) => {
  const navigate = useNavigate();

  // URL-based navigation (tahan refresh)
  const goToDashboard = (tab = "jadwal") => {
    navigate(`/student/dashboard?tab=${tab}`);
  };

  return (
    <Container className="py-5" style={{ minHeight: "80vh" }}>
      <Row className="mb-5 align-items-center">
        <Col md={8}>
          <div className="mb-2 text-primary fw-bold text-uppercase small">
            Student Area
          </div>
          <h1 className="fw-bold display-6 mb-3">
            Halo,{" "}
            <span className="text-primary">
              {user?.full_name?.split(" ")[0] || "Siswa"}
            </span>{" "}
            👋
          </h1>
          <p className="text-muted lead mb-4" style={{ maxWidth: 600 }}>
            Paket <strong>{activeInvoice?.package_name}</strong> kamu aktif.
            Silakan mulai belajar.
          </p>

          <div className="d-flex gap-3">
            <Button
              variant="primary"
              size="lg"
              className="rounded-pill fw-bold"
              onClick={() => goToDashboard("jadwal")}
            >
              <LayoutDashboard size={18} className="me-2" />
              Dashboard
            </Button>

            <Button
              variant="outline-primary"
              size="lg"
              className="rounded-pill fw-bold"
              onClick={() => goToDashboard("jadwal")}
            >
              <Calendar size={18} className="me-2" />
              Jadwal
            </Button>
          </div>
        </Col>

        <Col md={4} className="d-none d-md-block text-center">
          <div
            className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center"
            style={{ width: 200, height: 200 }}
          >
            <BookOpen size={80} className="text-primary opacity-25" />
          </div>
        </Col>
      </Row>

      <Row className="g-4">
        <Col lg={7}>
          <Card className="h-100 border-0 shadow-sm rounded-4">
            <Card.Body className="p-4">
              <Badge bg="success" className="mb-2">
                Status Aktif
              </Badge>
              <h3 className="fw-bold text-primary mb-1">
                {activeInvoice?.package_name}
              </h3>
              <p className="text-muted small">
                Invoice #{activeInvoice?.invoice_no}
              </p>

              <hr />

              <Button
                variant="outline-primary"
                className="rounded-pill fw-bold"
                onClick={() => goToDashboard("materi")}
              >
                <BookOpen size={18} className="me-2" />
                Akses Materi & Latihan
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={5}>
          <div className="d-grid gap-3">
            <Card
              className="border-0 shadow-sm rounded-4 cursor-pointer"
              onClick={() => goToDashboard("nilai")}
            >
              <Card.Body className="d-flex align-items-center p-3">
                <div className="bg-warning bg-opacity-10 p-3 rounded-circle text-warning me-3">
                  <Clock size={24} />
                </div>
                <div>
                  <h6 className="fw-bold mb-1">Nilai & Riwayat</h6>
                  <small className="text-muted">Pantau progresmu</small>
                </div>
                <ChevronRight className="ms-auto text-muted" size={20} />
              </Card.Body>
            </Card>

            <Card
              className="border-0 shadow-sm rounded-4 cursor-pointer"
              onClick={() =>
                window.open("https://wa.me/6288211058777", "_blank")
              }
            >
              <Card.Body className="d-flex align-items-center p-3">
                <div className="bg-success bg-opacity-10 p-3 rounded-circle text-success me-3">
                  <MessageCircle size={24} />
                </div>
                <div>
                  <h6 className="fw-bold mb-1">Hubungi Tutor</h6>
                  <small className="text-muted">WhatsApp</small>
                </div>
                <ChevronRight className="ms-auto text-muted" size={20} />
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default StudentHome;
