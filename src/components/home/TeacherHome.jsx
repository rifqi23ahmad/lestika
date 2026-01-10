import React from "react";
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import {
  Calendar,
  BookOpen,
  FileQuestion,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TeacherHome({ user }) {
  const navigate = useNavigate();

  const goToDashboard = (tab) => {
    navigate(`/teacher/dashboard?tab=${tab}`);
  };

  const menuItems = [
    {
      title: "Jadwal Mengajar",
      desc: "Kelola slot waktu dan sesi kelas Anda.",
      icon: Calendar,
      color: "primary",
      tab: "jadwal",
      stats: "Cek Jadwal",
    },
    {
      title: "Materi & Modul",
      desc: "Upload dan kelola bahan ajar siswa.",
      icon: BookOpen,
      color: "success",
      tab: "materi",
      stats: "Kelola File",
    },
    {
      title: "Bank Soal",
      desc: "Buat kuis dan latihan soal otomatis.",
      icon: FileQuestion,
      color: "warning",
      tab: "bank_soal",
      stats: "Buat Soal",
    },
    {
      title: "Penilaian Siswa",
      desc: "Input dan pantau perkembangan nilai.",
      icon: TrendingUp,
      color: "info",
      tab: "nilai",
      stats: "Input Nilai",
    },
  ];

  return (
    <div className="bg-light min-vh-100 pb-5">
      <div className="bg-white border-bottom shadow-sm mb-4">
        <Container className="py-5">
          <Row className="align-items-center">
            <Col md={8}>
              <Badge bg="primary" className="mb-2 px-3 py-2 rounded-pill">
                Teacher Dashboard
              </Badge>
              <h1 className="fw-bold display-5">
                Selamat Datang,{" "}
                <span className="text-primary">
                  {user?.full_name || "Guru"}
                </span>
              </h1>
              <p className="text-muted lead mb-4">
                Kelola jadwal, materi, soal, dan penilaian siswa dari satu
                tempat.
              </p>
              <div className="d-flex gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => goToDashboard("jadwal")}
                >
                  <Calendar size={20} className="me-2" /> Atur Jadwal
                </Button>
                <Button
                  variant="outline-secondary"
                  size="lg"
                  onClick={() => goToDashboard("materi")}
                >
                  Lihat Materi
                </Button>
              </div>
            </Col>
            <Col md={4} className="d-none d-md-block text-center">
              <div className="bg-primary bg-opacity-10 rounded-circle p-5 d-inline-flex">
                <Users size={80} className="text-primary" />
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <Container>
        <h5 className="fw-bold mb-4 d-flex align-items-center">
          <CheckCircle size={20} className="text-success me-2" />
          Akses Cepat Menu
        </h5>
        <Row className="g-4">
          {menuItems.map((item, idx) => (
            <Col md={6} lg={3} key={idx}>
              <Card
                className="h-100 border-0 shadow-sm"
                style={{ cursor: "pointer" }}
                onClick={() => goToDashboard(item.tab)}
              >
                <Card.Body className="d-flex flex-column">
                  <div
                    className={`bg-${item.color} bg-opacity-10 p-3 rounded-circle mb-3 text-${item.color}`}
                    style={{ width: "fit-content" }}
                  >
                    <item.icon size={28} />
                  </div>
                  <h5 className="fw-bold mb-2">{item.title}</h5>
                  <p className="text-muted small flex-grow-1">{item.desc}</p>
                  <div className="d-flex justify-content-between align-items-center fw-bold small text-primary">
                    {item.stats}
                    <ArrowRight size={16} />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
}
