import React, { useRef, useState } from "react";
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import {
  Calendar,
  BookOpen,
  PenTool,
  TrendingUp,
  ArrowRight,
  Clock,
  AlertCircle,
  ShoppingBag,
  CheckCircle,
  FileText,
  Lock,
  Hourglass,
  Star,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import StatusModal from "../common/StatusModal";
import LeaderboardSection from "./LeaderboardSection";

// Custom Styles untuk efek modern di Home
const homeStyles = {
    heroSection: {
        background: "linear-gradient(120deg, #f0f9ff 0%, #e0f2fe 100%)",
        position: 'relative',
        overflow: 'hidden'
    },
    heroDecorator: {
        position: 'absolute',
        top: '-10%',
        right: '-5%',
        width: '40%',
        height: '80%',
        background: 'radial-gradient(circle, rgba(37,99,235,0.1) 0%, rgba(255,255,255,0) 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        zIndex: 0
    },
    glassCard: {
        background: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.5)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
    },
    menuCard: (color) => ({
        transition: "all 0.3s ease",
        border: "none",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
        ':hover': {
            transform: 'translateY(-5px)',
            boxShadow: `0 20px 25px -5px rgba(var(--bs-${color}-rgb), 0.15), 0 10px 10px -5px rgba(var(--bs-${color}-rgb), 0.1)`
        }
    })
};

export default function StudentHome({ user, profile, status = 'none', invoice, packages = [], handlePackageClick }) {
  const navigate = useNavigate();
  const packageSectionRef = useRef(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // --- KONFIGURASI TAMPILAN BERDASARKAN STATUS ---
  const getUIConfig = () => {
    switch (status) {
      case 'active':
        return {
          theme: 'primary',
          icon: BookOpen,
          badgeIcon: CheckCircle,
          badgeText: `Paket Aktif: ${invoice?.package_name}`,
          titleColor: 'text-primary',
          desc: "Siap mengejar mimpi hari ini? Yuk cek jadwal dan materi terbarumu.",
          primaryBtn: { text: "Jadwal Saya", icon: Calendar, action: () => navigate("/dashboard?tab=jadwal") },
          secondaryBtn: { text: "Latihan Soal", action: () => navigate("/dashboard?tab=latihan") },
          isLocked: false
        };
      case 'unpaid':
        return {
          theme: 'warning',
          icon: FileText,
          badgeIcon: AlertCircle,
          badgeText: "Menunggu Pembayaran",
          titleColor: 'text-warning',
          desc: `Tagihan untuk paket "${invoice?.package_name}" belum dibayar. Selesaikan pembayaran untuk mulai belajar.`,
          primaryBtn: { text: "Bayar Sekarang", icon: ArrowRight, action: () => navigate("/invoice", { state: { invoice } }) },
          secondaryBtn: { text: "Cek Tagihan", action: () => navigate("/invoice") },
          isLocked: true
        };
      case 'waiting':
        return {
          theme: 'info',
          icon: Hourglass,
          badgeIcon: Clock,
          badgeText: "Menunggu Verifikasi Admin",
          titleColor: 'text-info',
          desc: `Pembayaran paket "${invoice?.package_name}" sedang diverifikasi admin. Mohon tunggu sebentar ya.`,
          primaryBtn: { text: "Cek Status", icon: Clock, action: () => navigate("/invoice") },
          secondaryBtn: null,
          isLocked: true
        };
      case 'expired':
        return {
          theme: 'danger',
          icon: Clock,
          badgeIcon: AlertCircle,
          badgeText: "Masa Aktif Berakhir",
          titleColor: 'text-danger',
          desc: "Paket belajar kamu sudah berakhir. Yuk pilih paket baru untuk melanjutkan semangat belajarmu!",
          primaryBtn: { text: "Perpanjang Paket", icon: ShoppingBag, action: () => scrollToPackages() },
          secondaryBtn: { text: "Riwayat", action: () => navigate("/invoice") },
          isLocked: true
        };
      default: // 'none'
        return {
          theme: 'primary',
          icon: Star,
          badgeIcon: Star,
          badgeText: "Selamat Datang!",
          titleColor: 'text-primary',
          desc: "Kamu belum memiliki paket belajar. Pilih paket terbaikmu dan mulai perjalanan juara sekarang!",
          primaryBtn: { text: "Pilih Paket", icon: ArrowRight, action: () => scrollToPackages() },
          secondaryBtn: null,
          isLocked: true
        };
    }
  };

  const ui = getUIConfig();

  const scrollToPackages = () => {
    if (packageSectionRef.current) {
      packageSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleMenuClick = (item) => {
    if (!ui.isLocked) {
        navigate(`/dashboard?tab=${item.tab}`);
    } else {
        if (status === 'unpaid') {
            navigate("/invoice", { state: { invoice } });
        } else if (status === 'waiting') {
            setShowStatusModal(true);
        } else {
            scrollToPackages();
        }
    }
  };

  const menuItems = [
    { title: "Jadwal Belajar", desc: "Cek jadwal kelas mendatang.", icon: Calendar, color: "primary", tab: "jadwal" },
    { title: "Latihan Soal", desc: "Kerjakan kuis dan tryout.", icon: PenTool, color: "warning", tab: "latihan" },
    { title: "Materi & Modul", desc: "Download bahan belajar.", icon: BookOpen, color: "success", tab: "materi" },
    { title: "Riwayat Nilai", desc: "Pantau progres akademikmu.", icon: TrendingUp, color: "info", tab: "nilai" },
  ];

  return (
    <div className="bg-light min-vh-100 pb-5">
      
      {/* === REDESIGNED HERO SECTION === */}
      <div style={homeStyles.heroSection} className="mb-5 border-bottom">
        <div style={homeStyles.heroDecorator}></div>
        <Container className="py-5 position-relative" style={{zIndex: 1}}>
          <Row className="align-items-center">
            <Col md={8} className="py-md-4">
              
              <Badge bg="white" text={ui.theme} className={`mb-3 px-3 py-2 rounded-pill d-inline-flex align-items-center gap-2 shadow-sm fw-bold border border-${ui.theme} border-opacity-25`}>
                 <ui.badgeIcon size={14} />
                 <span>{ui.badgeText}</span>
              </Badge>

              <h1 className="fw-black display-4 text-dark mb-3 ls-tight">
                Halo, <span className={`${ui.titleColor} text-gradient`}>
                    {profile?.full_name || user?.user_metadata?.full_name || user?.email || "Siswa"}
                </span>! <span className="fs-4"></span>
              </h1>
              
              <p className="text-muted lead mb-4 pe-md-5" style={{maxWidth: '600px'}}>
                {ui.desc}
              </p>
              
              <div className="d-flex gap-3">
                 <Button 
                    variant={status === 'expired' ? 'danger' : 'primary'} 
                    size="lg"
                    className="rounded-pill px-5 py-3 shadow-lg d-flex align-items-center gap-2 fw-bold hover-lift" 
                    onClick={ui.primaryBtn.action}
                  >
                    {ui.primaryBtn.icon && <ui.primaryBtn.icon size={20} />}
                    {ui.primaryBtn.text}
                  </Button>

                  {ui.secondaryBtn && (
                    <Button 
                        variant="white" 
                        size="lg"
                        className="rounded-pill px-5 py-3 shadow-sm text-dark border fw-bold hover-lift"
                        onClick={ui.secondaryBtn.action}
                    >
                      {ui.secondaryBtn.text}
                    </Button>
                  )}
              </div>
            </Col>
            
            {/* Illustration / Icon */}
            <Col md={4} className="d-none d-md-flex justify-content-end align-items-center">
               <div className={`p-5 rounded-circle bg-${ui.theme} bg-opacity-10 shadow-lg position-relative`}>
                  <ui.icon size={100} className={`text-${ui.theme}`} />
                  <Zap className="position-absolute top-0 end-0 text-warning mt-4 me-4 drop-shadow" size={32} fill="currentColor"/>
               </div>
            </Col>
          </Row>

          {/* === REDESIGNED STATS BAR (Glassmorphism) === */}
          {invoice && (status !== 'none') && (
             <Row className="mt-5 g-4 position-relative" style={{marginBottom: '-4rem', zIndex: 10}}>
                 <Col md={6}>
                    <Card className="h-100 rounded-4 overflow-hidden" style={homeStyles.glassCard}>
                        <Card.Body className="d-flex align-items-center p-4">
                            <div className={`bg-${status === 'expired' ? 'danger' : 'primary'} bg-opacity-10 p-3 rounded-3 me-3`}>
                                <Clock size={28} className={`text-${status === 'expired' ? 'danger' : 'primary'}`} />
                            </div>
                            <div>
                                <p className="text-muted small mb-1 fw-bold text-uppercase ls-1">
                                    {status === 'active' ? "Berlaku Sampai" : "Tanggal Transaksi"}
                                </p>
                                <h4 className={`mb-0 fw-bolder ${status === 'expired' ? "text-danger" : "text-dark"}`}>
                                    {status === 'active' || status === 'expired' 
                                        ? new Date(invoice.expiry_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
                                        : new Date(invoice.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
                                    }
                                </h4>
                            </div>
                        </Card.Body>
                    </Card>
                 </Col>
                 <Col md={6}>
                    <Card className="h-100 rounded-4 overflow-hidden" style={homeStyles.glassCard}>
                        <Card.Body className="d-flex align-items-center p-4">
                            <div className="bg-success bg-opacity-10 p-3 rounded-3 me-3">
                                <BookOpen size={28} className="text-success" />
                            </div>
                            <div>
                                <p className="text-muted small mb-1 fw-bold text-uppercase ls-1">Paket Terpilih</p>
                                <h4 className="mb-0 fw-bolder text-dark">
                                    {invoice.package_name}
                                </h4>
                            </div>
                        </Card.Body>
                    </Card>
                 </Col>
             </Row>
          )}
        </Container>
      </div>

      <Container style={{marginTop: invoice && status !== 'none' ? '5rem' : '2rem'}}>
        {/* === REDESIGNED MENU GRID === */}
        <div className="d-flex align-items-center justify-content-between mb-4">
           <h4 className="fw-bold text-dark mb-0">Menu Belajar</h4>
        </div>

        <Row className="g-4 mb-5">
          {menuItems.map((item, idx) => (
            <Col md={6} lg={3} key={idx}> 
              <Card 
                className={`h-100 rounded-4 position-relative overflow-hidden hover-card-${item.color}`}
                style={homeStyles.menuCard(item.color)}
              >
                {/* Subtle background tint on hover needs CSS, let's stick to inline styles for now */}
                <div className={`position-absolute top-0 start-0 w-100 h-100 bg-${item.color} opacity-0 hover-opacity-5 transition-all`}></div>

                <Card.Body 
                    className="p-4 d-flex flex-column position-relative"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleMenuClick(item)}
                >
                  {ui.isLocked && (
                      <div className="position-absolute top-0 end-0 m-3 text-muted bg-light rounded-circle p-2 shadow-sm" title="Fitur Terkunci">
                          <Lock size={18} />
                      </div>
                  )}

                  <div className={`bg-${item.color} bg-opacity-10 text-${item.color} rounded-4 d-flex align-items-center justify-content-center mb-4 shadow-sm`} style={{ width: 60, height: 60 }}>
                    <item.icon size={28} />
                  </div>
                  <h5 className="fw-bold text-dark mb-2">{item.title}</h5>
                  <p className="text-muted mb-4 flex-grow-1">{item.desc}</p>
                  
                  <div className={`d-flex align-items-center justify-content-between text-${ui.isLocked ? 'secondary' : item.color} fw-bold small mt-auto py-2 px-3 rounded-pill bg-${ui.isLocked ? 'secondary' : item.color} bg-opacity-10 transition-all`}>
                    <span>{ui.isLocked ? "Terkunci" : "Akses Sekarang"}</span>
                    {!ui.isLocked && <ArrowRight size={16} className="ms-2" />}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* === LEADERBOARD SECTION (Tetap Ada) === */}
        <div className="mb-5 pt-4 border-top border-light">
            <LeaderboardSection />
        </div>

        {/* === PACKAGE LIST (Standard Redesign) === */}
        {(status === 'none' || status === 'expired') && packages.length > 0 && (
            <div ref={packageSectionRef} className="pt-5 border-top border-light bg-white rounded-5 p-4 p-md-5 shadow-sm mb-5">
                <div className="text-center mb-5">
                    <Badge bg="primary" className="bg-opacity-10 text-primary px-3 py-2 rounded-pill mb-3 fw-bold">
                        Langganan
                    </Badge>
                    <h2 className="fw-black display-6 mb-3">Pilih Paket Belajar</h2>
                    <p className="text-muted lead">Investasi terbaik untuk masa depanmu dimulai di sini.</p>
                </div>
                <Row className="g-4 justify-content-center">
                    {packages.map((pkg, idx) => (
                        <Col key={pkg.id} md={6} lg={4}>
                            <Card className={`h-100 border-0 shadow-sm rounded-5 overflow-hidden hover-lift ${idx === 1 ? 'border-2 border-primary shadow-lg scale-105' : ''} position-relative`}>
                                {idx === 1 && <div className="bg-primary text-white text-center py-1 small fw-bold text-uppercase ls-1">Paling Populer</div>}
                                <Card.Body className="p-4 p-lg-5 d-flex flex-column">
                                    <h4 className="fw-bold mb-2">{pkg.title}</h4>
                                    <h2 className="text-primary fw-black mb-4 display-6">{pkg.price_display} <small className="fs-6 text-muted fw-normal">/paket</small></h2>
                                    <hr className="border-light my-4"/>
                                    <div className="flex-grow-1 mb-5 d-flex flex-column gap-3">
                                        {pkg.features?.map((feat, i) => (
                                            <div key={i} className="d-flex align-items-center text-dark">
                                                <CheckCircle size={20} className="text-success me-3 flex-shrink-0 drop-shadow-sm" fill="#dcfce7" />
                                                <span className="fw-medium">{feat}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <Button 
                                        variant={idx === 1 ? "primary" : "outline-primary"} 
                                        className={`rounded-pill w-100 py-3 fw-bold shadow-sm hover-lift ${idx !== 1 ? 'bg-white' : ''}`}
                                        onClick={() => handlePackageClick(pkg)}
                                    >
                                        Pilih Paket Ini
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
        )}

      </Container>
      
      <StatusModal 
        show={showStatusModal} 
        onHide={() => setShowStatusModal(false)}
        title="Sedang Diverifikasi"
        message="Mohon tunggu, admin sedang memverifikasi pembayaran Anda. Fitur akan terbuka otomatis setelah status Aktif."
        type="info"
      />
    </div>
  );
}