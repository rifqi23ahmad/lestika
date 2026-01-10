import React from "react";
import { Container, Row, Col, Card, Badge, Button } from "react-bootstrap";
import {
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ADMIN_MENU = [
  {
    key: "paket",
    title: "Manajemen Paket",
    desc: "Atur paket belajar dan harga",
    icon: BookOpen,
    variant: "primary",
  },
  {
    key: "guru",
    title: "Manajemen Guru",
    desc: "Kelola akun dan data pengajar",
    icon: Users,
    variant: "success",
  },
  {
    key: "invoice",
    title: "Invoice & Pembayaran",
    desc: "Verifikasi dan monitoring transaksi",
    icon: DollarSign,
    variant: "warning",
  },
  {
    key: "laporan",
    title: "Laporan & Statistik",
    desc: "Pantau performa bisnis",
    icon: TrendingUp,
    variant: "info",
  },
];

export default function AdminHome({ user }) {
  const navigate = useNavigate();

  const goToDashboard = (tab) => {
    navigate(`/admin/dashboard?tab=${tab}`);
  };

  return (
    <div className="bg-light min-vh-100 py-5">
      <Container>

        {/* ================= HEADER ================= */}
        <Row className="mb-5 align-items-center">
          <Col md={8}>
            <Badge bg="dark" className="mb-2 px-3 py-2 rounded-pill">
              Admin Control Panel
            </Badge>
            <h1 className="fw-bold display-5 text-dark mb-2">
              Selamat Datang,{" "}
              <span className="text-primary">
                {user?.full_name || user?.name || "Admin"}
              </span>
            </h1>
            <p className="text-muted lead mb-0">
              Kelola sistem, pengguna, dan transaksi dari satu pusat kontrol.
            </p>
          </Col>

          <Col md={4} className="d-none d-md-flex justify-content-end">
            <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: 140, height: 140 }}
            >
              <ShieldCheck size={64} className="text-primary" />
            </div>
          </Col>
        </Row>

        {/* ================= QUICK ACTION ================= */}
        <Row className="g-4 mb-5">
          {ADMIN_MENU.map((item) => {
            const Icon = item.icon;
            return (
              <Col md={6} lg={3} key={item.key}>
                <Card
                  className="h-100 border-0 shadow-sm rounded-4 hover-top"
                  style={{ cursor: "pointer" }}
                  onClick={() => goToDashboard(item.key)}
                >
                  <Card.Body className="p-4 d-flex flex-column">
                    <div
                      className={`bg-${item.variant} bg-opacity-10 text-${item.variant} rounded-circle d-flex align-items-center justify-content-center mb-3`}
                      style={{ width: 56, height: 56 }}
                    >
                      <Icon size={26} />
                    </div>

                    <h5 className="fw-bold text-dark mb-1">
                      {item.title}
                    </h5>
                    <p className="text-muted small mb-4 flex-grow-1">
                      {item.desc}
                    </p>

                    <div className="d-flex align-items-center justify-content-between text-primary fw-bold small">
                      Buka Menu
                      <ArrowRight size={16} />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>

        {/* ================= ATTENTION SECTION ================= */}
        <Row>
          <Col md={12}>
            <Card className="border-0 shadow-sm rounded-4">
              <Card.Body className="p-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-warning bg-opacity-10 text-warning rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: 48, height: 48 }}
                  >
                    <AlertCircle size={24} />
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1 text-dark">
                      Perlu Tindakan
                    </h6>
                    <p className="text-muted small mb-0">
                      Cek invoice yang menunggu konfirmasi pembayaran.
                    </p>
                  </div>
                </div>

                <Button
                  variant="warning"
                  className="rounded-pill fw-bold px-4"
                  onClick={() => goToDashboard("invoice")}
                >
                  Review Invoice
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>

      </Container>
    </div>
  );
}