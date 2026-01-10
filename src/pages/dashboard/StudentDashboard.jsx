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
  ArrowLeft,
  Lock,
  FileText,
  Clock,
  ShoppingBag
} from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

// Import Components
import StudentInfoCard from "./student/StudentInfoCard";
import StudentScheduleTab from "./student/StudentScheduleTab/StudentScheduleTab";
import StudentMaterialsTab from "./student/StudentMaterialsTab";
import StudentGradesTab from "./student/StudentGradesTab";
import ExerciseTab from "./student/ExerciseTab";

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

const DEFAULT_TAB = "jadwal";

/* =========================================
   INTERNAL COMPONENT: RESTRICTED VIEW
   Tampilan jika user tidak memiliki akses
========================================= */
const RestrictedView = ({ status, navigate, activeInvoice }) => {
  const getConfig = () => {
    switch (status) {
      case 'unpaid':
        return {
          icon: FileText,
          color: 'warning',
          title: 'Selesaikan Pembayaran',
          msg: 'Fitur ini terkunci karena kamu belum menyelesaikan pembayaran paket.',
          btnText: 'Bayar Sekarang',
          action: () => navigate('/invoice', { state: { invoice: activeInvoice } })
        };
      case 'waiting':
        return {
          icon: Clock,
          color: 'info',
          title: 'Menunggu Verifikasi',
          msg: 'Sabar ya, admin sedang memverifikasi pembayaranmu. Fitur akan terbuka otomatis setelah lunas.',
          btnText: 'Cek Status',
          action: () => navigate('/invoice')
        };
      case 'expired':
        return {
          icon: AlertTriangle,
          color: 'danger',
          title: 'Masa Aktif Berakhir',
          msg: 'Masa aktif paket belajarmu sudah habis. Silakan perpanjang untuk mengakses kembali materi dan jadwal.',
          btnText: 'Perpanjang Paket',
          action: () => navigate('/') // Kembali ke home untuk pilih paket
        };
      default: // 'none'
        return {
          icon: Lock,
          color: 'secondary',
          title: 'Akses Terkunci',
          msg: 'Kamu belum berlangganan paket belajar apapun. Yuk pilih paket dulu!',
          btnText: 'Pilih Paket',
          action: () => navigate('/')
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <div className="text-center py-5">
      <div className={`bg-${config.color} bg-opacity-10 p-4 rounded-circle d-inline-block mb-3`}>
        <Icon size={48} className={`text-${config.color}`} />
      </div>
      <h4 className="fw-bold mb-2">{config.title}</h4>
      <p className="text-muted mb-4" style={{ maxWidth: '400px', margin: '0 auto' }}>
        {config.msg}
      </p>
      <Button 
        variant={config.color === 'secondary' ? 'primary' : config.color} 
        className="rounded-pill px-4 fw-bold shadow-sm"
        onClick={config.action}
      >
        {config.btnText}
      </Button>
    </div>
  );
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeInvoice, setActiveInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // State Status: 'none', 'active', 'expired', 'unpaid', 'waiting'
  const [status, setStatus] = useState('none'); 

  const [infoModal, setInfoModal] = useState({
    show: false, title: "", msg: "", type: "success"
  });

  const showModal = (title, msg, type = "success") =>
    setInfoModal({ show: true, title, msg, type });

  const activeTab = useMemo(() => {
    const t = searchParams.get("tab");
    return TAB_REGISTRY[t] ? t : DEFAULT_TAB;
  }, [searchParams]);

  const handleTabChange = (key) => {
    setSearchParams({ tab: key });
  };

  const goToHome = () => {
    navigate("/");
  };

  /* =========================
     FETCH STATUS LOGIC
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

        // Logic Penentuan Status (Sama seperti HomeView)
        if (!data) {
            setStatus('none');
        } else if (data.status === 'unpaid') {
            setStatus('unpaid');
        } else if (data.status === 'waiting_confirmation' || data.status === 'waiting') {
            setStatus('waiting');
        } else if (data.status === 'paid') {
            const isExp = data.expiry_date && new Date() > new Date(data.expiry_date);
            setStatus(isExp ? 'expired' : 'active');
        } else {
            setStatus('none');
        }

      } catch (err) {
        console.log("No invoice found:", err);
        setStatus('none');
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, [user]);

  /* =========================
     BADGE CONFIG
  ========================= */
  const getStatusBadge = () => {
    switch (status) {
        case 'active': return { color: 'primary', label: `Paket: ${activeInvoice?.package_name}` };
        case 'expired': return { color: 'danger', label: 'Paket Berakhir' };
        case 'unpaid': return { color: 'warning', label: 'Menunggu Pembayaran' };
        case 'waiting': return { color: 'info', label: 'Verifikasi Admin' };
        default: return { color: 'secondary', label: 'Belum Berlangganan' };
    }
  };

  const badgeConfig = getStatusBadge();

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: "60vh" }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-3 text-muted">Memuat data siswa...</span>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* HEADER */}
      <div className="mb-4 d-flex align-items-center justify-content-between">
        <Button
          variant="link"
          className="text-decoration-none text-muted p-0 d-flex align-items-center fw-bold"
          onClick={goToHome}
        >
          <ArrowLeft size={18} className="me-2" />
          Kembali ke Menu Utama
        </Button>

        <span className={`badge bg-${badgeConfig.color} bg-opacity-10 text-${badgeConfig.color} px-3 py-2 rounded-pill border border-${badgeConfig.color} border-opacity-25`}>
            {badgeConfig.label}
        </span>
      </div>

      <Row className="g-4">
        {/* INFO CARD */}
        <Col xs={12}>
          <StudentInfoCard 
            user={user} 
            activeInvoice={activeInvoice} 
            status={status} 
          />
        </Col>

        {/* TABS CONTENT WITH PROTECTION GUARD */}
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
                        {/* GUARD CLAUSE: Hanya render Component jika status ACTIVE */}
                        {status === 'active' ? (
                          <Component
                            user={user}
                            showModal={showModal}
                            status={status}
                            isExpired={false} // Karena sudah di-guard active
                          />
                        ) : (
                          // Tampilkan Restricted View untuk status selain Active
                          <RestrictedView 
                            status={status} 
                            navigate={navigate} 
                            activeInvoice={activeInvoice} 
                          />
                        )}
                      </div>
                    </Tab>
                  );
                })}
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* MODAL NOTIFIKASI */}
      <Modal
        show={infoModal.show}
        onHide={() => setInfoModal({ ...infoModal, show: false })}
        centered
      >
        <Modal.Body className="text-center p-4">
          <div className={`mx-auto mb-3 p-3 rounded-circle ${
              infoModal.type === "error" ? "bg-danger bg-opacity-10 text-danger" : "bg-success bg-opacity-10 text-success"
            }`} style={{ width: "fit-content" }}>
            {infoModal.type === "error" ? <AlertTriangle size={32} /> : <CheckCircle size={32} />}
          </div>
          <h5 className="fw-bold mb-2">{infoModal.title}</h5>
          <p className="text-muted">{infoModal.msg}</p>
          <Button
            variant={infoModal.type === "error" ? "danger" : "success"}
            className="rounded-pill px-4 mt-3"
            onClick={() => setInfoModal({ ...infoModal, show: false })}
          >
            Tutup
          </Button>
        </Modal.Body>
      </Modal>
    </Container>
  );
}