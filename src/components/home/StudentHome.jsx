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
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const StudentHome = ({ user, activeInvoice }) => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <Container className="py-5" style={{ minHeight: "80vh" }}>
      <Row className="mb-5 align-items-center">
        <Col md={8}>
          <div className="mb-2 text-primary fw-bold text-uppercase small ls-1">
            Student Area
          </div>
          <h1 className="fw-bold text-dark display-6 mb-3">
            Halo,{" "}
            <span className="text-primary">
              {user.name?.split(" ")[0] || "Siswa"}
            </span>
            ! 👋
          </h1>
          <p className="text-muted lead mb-4" style={{ maxWidth: "600px" }}>
            Paket <strong>{activeInvoice?.package_name}</strong> kamu aktif.
            Silakan cek jadwal atau materi terbaru untuk memulai belajar.
          </p>
          <div className="d-flex gap-3">
            <Button
              variant="primary"
              size="lg"
              className="rounded-pill px-4 shadow-sm fw-bold"
              onClick={() => handleNavigation("/student/dashboard")}
            >
              <LayoutDashboard size={18} className="me-2" />
              Dashboard
            </Button>

            <Button
              variant="outline-primary"
              size="lg"
              className="rounded-pill px-4 fw-bold"
              onClick={() => handleNavigation("/jadwal")}
            >
              <Calendar size={18} className="me-2" />
              Jawdal
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
          <Card className="h-100 border-0 shadow-sm rounded-4 hover-top transition">
            <Card.Body className="p-4">
              <div className="d-flex align-items-start justify-content-between mb-3">
                <div>
                  <Badge bg="success" className="mb-2">
                    Status: Aktif
                  </Badge>
                  <h3 className="fw-bold text-primary mb-1">
                    {activeInvoice?.package_name}
                  </h3>
                  <p className="text-muted mb-0 small">
                    Invoice: #{activeInvoice?.invoice_no}
                  </p>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded-circle text-primary">
                  <Award size={28} />
                </div>
              </div>

              <hr className="my-4 opacity-10" />

              <div className="d-grid gap-2">
                <Button
                  variant="outline-primary"
                  className="rounded-pill fw-bold"
                  onClick={() => handleNavigation("/student/dashboard")}
                >
                  <BookOpen size={18} className="me-2" />
                  Akses Materi & Latihan
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={5}>
          <div className="d-grid gap-3">
            <Card
              className="border-0 shadow-sm rounded-4 cursor-pointer hover-card bg-white"
              onClick={() => handleNavigation("/student/dashboard")}
            >
              <Card.Body className="d-flex align-items-center p-3">
                <div className="bg-warning bg-opacity-10 p-3 rounded-circle text-warning me-3">
                  <Clock size={24} />
                </div>
                <div>
                  <h6 className="fw-bold mb-1">Riwayat & Nilai</h6>
                  <small className="text-muted">Cek perkembanganmu</small>
                </div>
                <ChevronRight className="ms-auto text-muted" size={20} />
              </Card.Body>
            </Card>

            <Card
              className="border-0 shadow-sm rounded-4 cursor-pointer hover-card bg-white"
              onClick={() =>
                window.open(`https://wa.me/6288211058777`, "_blank")
              }
            >
              <Card.Body className="d-flex align-items-center p-3">
                <div className="bg-success bg-opacity-10 p-3 rounded-circle text-success me-3">
                  <MessageCircle size={24} />
                </div>
                <div>
                  <h6 className="fw-bold mb-1">Hubungi Tutor</h6>
                  <small className="text-muted">Konsultasi via WhatsApp</small>
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
