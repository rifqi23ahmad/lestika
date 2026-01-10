import React, { useRef } from "react";
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
  Star
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import StatusModal from "../common/StatusModal";

export default function StudentHome({ user, profile, status = 'none', invoice, packages = [], handlePackageClick }) {
  const navigate = useNavigate();
  const packageSectionRef = useRef(null);
  const [showStatusModal, setShowStatusModal] = React.useState(false);

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
          primaryBtn: { text: "Jadwal Saya", icon: Calendar, action: () => navigate("/student/dashboard?tab=jadwal") },
          secondaryBtn: { text: "Latihan Soal", action: () => navigate("/student/dashboard?tab=latihan") },
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
          theme: 'danger', // Warna Merah untuk menarik perhatian
          icon: Clock,
          badgeIcon: AlertCircle,
          badgeText: "Masa Aktif Berakhir",
          titleColor: 'text-danger',
          // WORDING KHUSUS EXPIRED
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
        navigate(`/student/dashboard?tab=${item.tab}`);
    } else {
        if (status === 'unpaid') {
            navigate("/invoice", { state: { invoice } });
        } else if (status === 'waiting') {
            setShowStatusModal(true);
        } else {
            // None or Expired -> Scroll to Packages
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
      
      {/* === HERO SECTION === */}
      <div className={`border-bottom shadow-sm mb-5 bg-white`}>
        <Container className="py-5">
          <Row className="align-items-center">
            <Col md={8}>
              
              {/* STATUS BADGE */}
              <Badge bg={ui.theme} className="mb-3 px-3 py-2 rounded-pill d-inline-flex align-items-center gap-2">
                 <ui.badgeIcon size={14} />
                 <span>{ui.badgeText}</span>
              </Badge>

              {/* WELCOME TEXT */}
              <h1 className="fw-bold display-5 text-dark mb-2">
                Halo, <span className={ui.titleColor}>
                    {profile?.full_name || user?.user_metadata?.full_name || user?.email || "Siswa"}
                </span>!
              </h1>
              
              <p className="text-muted lead mb-4">
                {ui.desc}
              </p>
              
              {/* ACTION BUTTONS */}
              <div className="d-flex gap-3">
                 <Button 
                    variant={status === 'expired' ? 'danger' : 'primary'} 
                    size="lg"
                    className="rounded-pill px-4 shadow-sm d-flex align-items-center gap-2" 
                    onClick={ui.primaryBtn.action}
                  >
                    {ui.primaryBtn.icon && <ui.primaryBtn.icon size={20} />}
                    {ui.primaryBtn.text}
                  </Button>

                  {ui.secondaryBtn && (
                    <Button 
                        variant="outline-secondary" 
                        size="lg"
                        className="rounded-pill px-4" 
                        onClick={ui.secondaryBtn.action}
                    >
                      {ui.secondaryBtn.text}
                    </Button>
                  )}
              </div>
            </Col>
            
            {/* ILLUSTRATION (Right Side) */}
            <Col md={4} className="d-none d-md-flex justify-content-end">
               <div className={`p-5 rounded-circle bg-${ui.theme} bg-opacity-10`}>
                  <ui.icon size={80} className={`text-${ui.theme}`} />
               </div>
            </Col>
          </Row>
        </Container>
      </div>

      <Container>
        {/* === STATS / INFO BAR (Only for Active/Expired/Waiting/Unpaid) === */}
        {invoice && (
             <Row className="mb-5 g-4">
                 <Col md={6} lg={4}>
                    <Card className="border-0 shadow-sm rounded-4 h-100">
                        <Card.Body className="d-flex align-items-center p-4">
                            <div className="bg-indigo-50 p-3 rounded-circle me-3">
                                <Clock size={24} className="text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-muted small mb-0 fw-bold">
                                    {status === 'active' ? "Berlaku Sampai" : "Tanggal Transaksi"}
                                </p>
                                <h5 className={`mb-0 fw-bold ${status === 'expired' ? "text-danger" : "text-dark"}`}>
                                    {status === 'active' || status === 'expired' 
                                        ? new Date(invoice.expiry_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
                                        : new Date(invoice.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
                                    }
                                </h5>
                            </div>
                        </Card.Body>
                    </Card>
                 </Col>
                 <Col md={6} lg={4}>
                    <Card className="border-0 shadow-sm rounded-4 h-100">
                        <Card.Body className="d-flex align-items-center p-4">
                            <div className="bg-green-50 p-3 rounded-circle me-3">
                                <BookOpen size={24} className="text-green-600" />
                            </div>
                            <div>
                                <p className="text-muted small mb-0 fw-bold">Paket Terpilih</p>
                                <h5 className="mb-0 fw-bold text-dark">
                                    {invoice.package_name}
                                </h5>
                            </div>
                        </Card.Body>
                    </Card>
                 </Col>
             </Row>
        )}

        {/* === MENU GRID === */}
        <div className="d-flex align-items-center justify-content-between mb-4">
           <h4 className="fw-bold text-dark mb-0">Menu Belajar</h4>
        </div>

        <Row className="g-4 mb-5">
          {menuItems.map((item, idx) => (
            <Col md={6} lg={3} key={idx}>
              <Card 
                className={`h-100 border-0 shadow-sm rounded-4 transition-all hover-top`}
                style={{ cursor: "pointer" }}
                onClick={() => handleMenuClick(item)}
              >
                <Card.Body className="p-4 d-flex flex-column position-relative">
                  {/* Lock Overlay / Icon jika Locked */}
                  {ui.isLocked && (
                      <div className="position-absolute top-0 end-0 m-3 text-muted" title="Fitur Terkunci">
                          <Lock size={20} />
                      </div>
                  )}

                  <div className={`bg-${item.color} bg-opacity-10 text-${item.color} rounded-3 d-flex align-items-center justify-content-center mb-3`} style={{ width: 50, height: 50 }}>
                    <item.icon size={24} />
                  </div>
                  <h5 className="fw-bold text-dark mb-2">{item.title}</h5>
                  <p className="text-muted small mb-4 flex-grow-1">{item.desc}</p>
                  
                  <div className={`d-flex align-items-center justify-content-between text-${ui.isLocked ? 'secondary' : item.color} fw-bold small mt-auto`}>
                    {ui.isLocked ? "Terkunci" : "Akses Sekarang"}
                    {!ui.isLocked && <ArrowRight size={16} />}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* === PACKAGE LIST (Hanya Tampil Jika Status NONE atau EXPIRED) === */}
        {(status === 'none' || status === 'expired') && packages.length > 0 && (
            <div ref={packageSectionRef} className="pt-4 border-top">
                <div className="text-center mb-5">
                    <h2 className="fw-bold mb-2">Pilih Paket Belajar</h2>
                    <p className="text-muted">Temukan paket yang sesuai dengan kebutuhanmu</p>
                </div>
                <Row className="g-4 justify-content-center">
                    {packages.map((pkg) => (
                        <Col key={pkg.id} md={6} lg={4}>
                            <Card className="h-100 border-0 shadow-sm rounded-4 overflow-hidden hover-top">
                                <div className="bg-primary p-2"></div>
                                <Card.Body className="p-4 d-flex flex-column">
                                    <h4 className="fw-bold mb-2">{pkg.title}</h4>
                                    <h2 className="text-primary fw-bold mb-3">{pkg.price_display}</h2>
                                    <div className="flex-grow-1 mb-4">
                                        {pkg.features?.map((feat, i) => (
                                            <div key={i} className="d-flex align-items-start mb-2 text-muted small">
                                                <CheckCircle size={16} className="text-success me-2 mt-1 flex-shrink-0" />
                                                <span>{feat}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <Button 
                                        variant="outline-primary" 
                                        className="rounded-pill w-100 fw-bold"
                                        onClick={() => handlePackageClick(pkg)}
                                    >
                                        Pilih Paket
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
        )}

      </Container>
      
      {/* Helper Modal untuk Status Waiting */}
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