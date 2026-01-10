import React from "react";
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function StudentHome({ user, activeInvoice, isExpired }) {
  const navigate = useNavigate();

  const goToDashboard = (tab) => {
    navigate(`/student/dashboard?tab=${tab}`);
  };

  // Menu Akses Cepat
  const menuItems = [
    {
      title: "Jadwal Belajar",
      desc: "Cek jadwal kelas mendatang.",
      icon: Calendar,
      color: "primary",
      tab: "jadwal",
      action: "Lihat Jadwal",
    },
    {
      title: "Latihan Soal",
      desc: "Kerjakan kuis dan tryout.",
      icon: PenTool,
      color: "warning",
      tab: "latihan",
      action: "Mulai Latihan",
    },
    {
      title: "Materi & Modul",
      desc: "Download bahan belajar.",
      icon: BookOpen,
      color: "success",
      tab: "materi",
      action: "Buka Materi",
    },
    {
      title: "Riwayat Nilai",
      desc: "Pantau progres akademikmu.",
      icon: TrendingUp,
      color: "info",
      tab: "nilai",
      action: "Cek Nilai",
    },
  ];

  return (
    <div className="bg-light min-vh-100 pb-5">
      
      {/* === HERO SECTION (DYNAMIC) === */}
      <div className={`border-bottom shadow-sm mb-5 ${isExpired ? "bg-red-50" : "bg-white"}`}>
        <Container className="py-5">
          <Row className="align-items-center">
            <Col md={8}>
              
              {/* STATUS BADGE */}
              {isExpired ? (
                <Badge bg="danger" className="mb-3 px-3 py-2 rounded-pill d-inline-flex align-items-center gap-2">
                   <AlertCircle size={14} />
                   <span>Masa Aktif Berakhir</span>
                </Badge>
              ) : (
                <Badge bg="primary" className="mb-3 px-3 py-2 rounded-pill d-inline-flex align-items-center gap-2">
                   <CheckCircle size={14} />
                   <span>Paket Aktif: {activeInvoice?.package_name}</span>
                </Badge>
              )}

              {/* WELCOME TEXT */}
              <h1 className="fw-bold display-5 text-dark mb-2">
                Halo, <span className={isExpired ? "text-danger" : "text-primary"}>
                    {user?.full_name || "Siswa Juara"}
                </span>!
              </h1>
              
              <p className="text-muted lead mb-4">
                {isExpired 
                  ? "Sepertinya masa aktif paket belajarmu sudah habis. Perpanjang sekarang untuk terus mengakses materi dan jadwal kelas."
                  : "Siap mengejar mimpi hari ini? Yuk cek jadwal dan materi terbarumu."
                }
              </p>
              
              {/* ACTION BUTTONS */}
              <div className="d-flex gap-3">
                {isExpired ? (
                  <>
                    <Button 
                        variant="danger" 
                        size="lg" 
                        className="rounded-pill px-5 fw-bold shadow-sm d-flex align-items-center gap-2"
                        onClick={() => navigate("/")}
                    >
                        <ShoppingBag size={20} />
                        Beli Paket Lagi
                    </Button>
                    <Button 
                        variant="outline-secondary" 
                        size="lg"
                        className="rounded-pill px-4 fw-bold"
                        onClick={() => navigate("/invoice")}
                    >
                        Riwayat Tagihan
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                        variant="primary" 
                        size="lg"
                        className="rounded-pill px-4 shadow-sm" 
                        onClick={() => goToDashboard("jadwal")}
                    >
                      <Calendar size={20} className="me-2" />
                      Jadwal Saya
                    </Button>
                    <Button 
                        variant="outline-primary" 
                        size="lg"
                        className="rounded-pill px-4" 
                        onClick={() => goToDashboard("latihan")}
                    >
                      Latihan Soal
                    </Button>
                  </>
                )}
              </div>
            </Col>
            
            {/* ILLUSTRATION (Right Side) */}
            <Col md={4} className="d-none d-md-flex justify-content-end">
               <div className={`p-5 rounded-circle ${isExpired ? "bg-danger" : "bg-primary"} bg-opacity-10`}>
                  {isExpired ? (
                      <Clock size={80} className="text-danger" />
                  ) : (
                      <BookOpen size={80} className="text-primary" />
                  )}
               </div>
            </Col>
          </Row>
        </Container>
      </div>

      <Container>
        {/* === STATS / INFO BAR === */}
        {activeInvoice && (
             <Row className="mb-5 g-4">
                 <Col md={4}>
                    <Card className="border-0 shadow-sm rounded-4 h-100">
                        <Card.Body className="d-flex align-items-center p-4">
                            <div className="bg-indigo-50 p-3 rounded-circle me-3">
                                <Clock size={24} className="text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-muted small mb-0 fw-bold">Berlaku Sampai</p>
                                <h5 className={`mb-0 fw-bold ${isExpired ? "text-danger" : "text-dark"}`}>
                                    {new Date(activeInvoice.expiry_date).toLocaleDateString("id-ID", {
                                        day: "numeric", month: "long", year: "numeric"
                                    })}
                                </h5>
                            </div>
                        </Card.Body>
                    </Card>
                 </Col>
                 <Col md={4}>
                    <Card className="border-0 shadow-sm rounded-4 h-100">
                        <Card.Body className="d-flex align-items-center p-4">
                            <div className="bg-green-50 p-3 rounded-circle me-3">
                                <BookOpen size={24} className="text-green-600" />
                            </div>
                            <div>
                                <p className="text-muted small mb-0 fw-bold">Paket Saat Ini</p>
                                <h5 className="mb-0 fw-bold text-dark">
                                    {activeInvoice.package_name}
                                </h5>
                            </div>
                        </Card.Body>
                    </Card>
                 </Col>
                 {/* Tambahkan stat lain jika perlu */}
             </Row>
        )}

        {/* === MENU GRID === */}
        <div className="d-flex align-items-center justify-content-between mb-4">
           <h4 className="fw-bold text-dark mb-0">Menu Belajar</h4>
        </div>

        <Row className="g-4">
          {menuItems.map((item, idx) => (
            <Col md={6} lg={3} key={idx}>
              <Card 
                className={`h-100 border-0 shadow-sm rounded-4 transition-all ${isExpired ? "opacity-75" : "hover-top"}`}
                style={{ cursor: isExpired ? "not-allowed" : "pointer" }}
                onClick={() => !isExpired && goToDashboard(item.tab)}
              >
                <Card.Body className="p-4 d-flex flex-column position-relative">
                  {/* Lock Icon jika Expired */}
                  {isExpired && (
                      <div className="position-absolute top-0 end-0 m-3 text-muted">
                          <AlertCircle size={20} />
                      </div>
                  )}

                  <div className={`bg-${item.color} bg-opacity-10 text-${item.color} rounded-3 d-flex align-items-center justify-content-center mb-3`} style={{ width: 50, height: 50 }}>
                    <item.icon size={24} />
                  </div>
                  <h5 className="fw-bold text-dark mb-2">{item.title}</h5>
                  <p className="text-muted small mb-4 flex-grow-1">{item.desc}</p>
                  
                  <div className={`d-flex align-items-center justify-content-between text-${item.color} fw-bold small mt-auto`}>
                    {isExpired ? "Terkunci" : item.action}
                    {!isExpired && <ArrowRight size={16} />}
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