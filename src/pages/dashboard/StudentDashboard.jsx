import React, { useState, useEffect, useMemo } from "react";
import {
  Row,
  Col,
  Card,
  Tabs,
  Tab,
  Button,
  Spinner,
  Container,
  Modal,
} from "react-bootstrap";
import {
  Calendar,
  PenTool,
  BookOpen,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ShoppingBag,
  ArrowLeft,
  FileText,
} from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

// Import Components
import StudentHome from "../../components/home/StudentHome";
import StudentInfoCard from "./student/StudentInfoCard";
import StudentScheduleTab from "./student/StudentScheduleTab/StudentScheduleTab";
import StudentMaterialsTab from "./student/StudentMaterialsTab";
import StudentGradesTab from "./student/StudentGradesTab";
import ExerciseTab from "./student/ExerciseTab";

/* =========================
   TYPE-SAFE TAB REGISTRY
========================= */
const TAB_REGISTRY = {
  jadwal: {
    label: "Jadwal Belajar",
    icon: Calendar,
    component: StudentScheduleTab,
  },
  latihan: {
    label: "Latihan Soal",
    icon: PenTool,
    component: ExerciseTab,
  },
  materi: {
    label: "Materi & Modul",
    icon: BookOpen,
    component: StudentMaterialsTab,
  },
  nilai: {
    label: "Riwayat Nilai",
    icon: TrendingUp,
    component: StudentGradesTab,
  },
};

const DEFAULT_TAB = null;

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeInvoice, setActiveInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExpired, setIsExpired] = useState(false);

  /* =========================
     INFO MODAL STATE
  ========================= */
  const [infoModal, setInfoModal] = useState({
    show: false,
    title: "",
    msg: "",
    type: "success",
  });

  const showModal = (title, msg, type = "success") =>
    setInfoModal({ show: true, title, msg, type });

  /* =========================
     ACTIVE TAB FROM URL
  ========================= */
  const activeTab = useMemo(() => {
    const t = searchParams.get("tab");
    return TAB_REGISTRY[t] ? t : DEFAULT_TAB;
  }, [searchParams]);

  const handleTabChange = (key) => {
    setSearchParams({ tab: key });
  };

  const goToHome = () => {
    setSearchParams({});
  };

  /* =========================
     FETCH INVOICE STATUS
  ========================= */
  useEffect(() => {
    const fetchStatus = async () => {
      if (!user) return;
      try {
        const { data } = await supabase
          .from("invoices")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        setActiveInvoice(data);

        if (
          data?.status === "paid" &&
          data.expiry_date &&
          new Date() > new Date(data.expiry_date)
        ) {
          setIsExpired(true);
        }
      } catch (err) {
        console.log("No invoice found:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, [user]);

  /* =========================
     LOADING STATE
  ========================= */
  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center py-5"
        style={{ minHeight: "60vh" }}
      >
        <Spinner animation="border" variant="primary" />
        <span className="ms-3 text-muted">Memuat data siswa...</span>
      </Container>
    );
  }

  /* =========================
     BELUM PERNAH BELI PAKET
  ========================= */
  if (!activeInvoice) {
    return (
      <Container
        className="py-5 text-center d-flex flex-column align-items-center justify-content-center"
        style={{ minHeight: "70vh" }}
      >
        <div className="bg-primary bg-opacity-10 p-4 rounded-circle mb-4 text-primary">
          <ShoppingBag size={64} />
        </div>
        <h2 className="fw-bold text-dark mb-3">
          Selamat Datang di MAPA!
        </h2>
        <p className="text-muted lead mb-4" style={{ maxWidth: 600 }}>
          Halo <strong>{user?.full_name}</strong>. Akunmu sudah aktif,
          tapi kamu belum memiliki paket belajar.
        </p>
        <Button
          variant="primary"
          size="lg"
          className="rounded-pill px-5 fw-bold shadow-sm"
          onClick={() => navigate("/")}
        >
          Lihat Pilihan Paket
        </Button>
      </Container>
    );
  }

  /* =========================
     MENUNGGU PEMBAYARAN
  ========================= */
  if (activeInvoice.status !== "paid") {
    return (
      <Container
        className="py-5 text-center d-flex flex-column align-items-center justify-content-center"
        style={{ minHeight: "70vh" }}
      >
        <div className="bg-warning bg-opacity-10 p-4 rounded-circle mb-4 text-warning">
          <FileText size={64} />
        </div>
        <h2 className="fw-bold text-dark mb-2">
          Menunggu Pembayaran
        </h2>
        <p className="text-muted lead mb-4">
          Invoice <strong>#{activeInvoice.invoice_no}</strong> sedang diproses.
        </p>
        <Button
          variant="warning"
          size="lg"
          className="rounded-pill px-5 fw-bold text-white shadow-sm"
          onClick={() => navigate("/invoice")}
        >
          Cek Status Pembayaran
        </Button>
      </Container>
    );
  }

  /* =========================
     HOME VIEW (DEFAULT)
  ========================= */
  if (!activeTab) {
    return (
      <StudentHome
        user={user}
        activeInvoice={activeInvoice}
        isExpired={isExpired}
      />
    );
  }

  /* =========================
     TAB VIEW
  ========================= */
  return (
    <Container className="py-4">
      <div className="mb-4 d-flex align-items-center justify-content-between">
        <Button
          variant="link"
          className="text-decoration-none text-muted p-0 d-flex align-items-center fw-bold"
          onClick={goToHome}
        >
          <ArrowLeft size={18} className="me-2" />
          Kembali ke Menu Utama
        </Button>

        {isExpired ? (
          <span className="badge bg-danger bg-opacity-10 text-danger px-3 py-2 rounded-pill">
            Paket Berakhir
          </span>
        ) : (
          <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill">
            Paket: {activeInvoice.package_name}
          </span>
        )}
      </div>

      <Row className="g-4">
        <Col xs={12}>
          <StudentInfoCard user={user} activeInvoice={activeInvoice} />
        </Col>

        <Col xs={12}>
          <Card className="shadow-sm border-0 rounded-4">
            <Card.Body className="p-0">
              <Tabs
                activeKey={activeTab}
                onSelect={handleTabChange}
                className="border-bottom px-3 pt-3"
                fill
              >
                {Object.entries(TAB_REGISTRY).map(([key, cfg]) => {
                  const Icon = cfg.icon;
                  const Component = cfg.component;
                  return (
                    <Tab
                      key={key}
                      eventKey={key}
                      title={
                        <div className="d-flex align-items-center justify-content-center py-2 gap-2">
                          <Icon size={18} />
                          <span className="fw-semibold">
                            {cfg.label}
                          </span>
                        </div>
                      }
                    >
                      <div className="p-4 bg-light bg-opacity-25">
                        <Component
                          user={user}
                          showModal={showModal}
                          isExpired={isExpired}
                        />
                      </div>
                    </Tab>
                  );
                })}
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* =========================
         INFO MODAL (LENGKAP)
      ========================= */}
      <Modal
        show={infoModal.show}
        onHide={() =>
          setInfoModal({ ...infoModal, show: false })
        }
        centered
      >
        <Modal.Body className="text-center p-4">
          <div
            className={`mx-auto mb-3 p-3 rounded-circle ${
              infoModal.type === "error"
                ? "bg-danger bg-opacity-10 text-danger"
                : "bg-success bg-opacity-10 text-success"
            }`}
            style={{ width: "fit-content" }}
          >
            {infoModal.type === "error" ? (
              <AlertTriangle size={32} />
            ) : (
              <CheckCircle size={32} />
            )}
          </div>
          <h5 className="fw-bold mb-2">
            {infoModal.title}
          </h5>
          <p className="text-muted">{infoModal.msg}</p>
          <Button
            variant={
              infoModal.type === "error"
                ? "danger"
                : "success"
            }
            className="rounded-pill px-4 mt-3"
            onClick={() =>
              setInfoModal({ ...infoModal, show: false })
            }
          >
            Tutup
          </Button>
        </Modal.Body>
      </Modal>
    </Container>
  );
}
