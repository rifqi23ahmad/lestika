import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card, Spinner } from 'react-bootstrap';
import { Users, BookOpen, Award, CheckCircle, ArrowRight, LogIn } from 'lucide-react';
import { packageService } from '../services/packageService';
import { useAuth } from '../context/AuthContext'; // <--- 1. Import useAuth

export default function HomeView({ onRegister, onNavigate }) {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); // <--- 2. Ambil data user dari context

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const data = await packageService.getAll();
        setPackages(data);
      } catch (error) {
        console.error("Gagal mengambil paket:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  // 3. Fungsi untuk menangani klik tombol
  const handlePackageClick = (pkg) => {
    if (user) {
      // Jika sudah login -> Lanjut ke proses pendaftaran paket
      onRegister(pkg);
    } else {
      // Jika belum login -> Arahkan ke halaman login
      // Opsional: Bisa simpan paket yang dipilih ke localStorage jika ingin redirect balik nanti
      alert("Silakan buat akun atau login terlebih dahulu untuk mendaftar.");
      onNavigate('login');
    }
  };

  return (
    <>
      {/* Hero Section */}
      <div className="bg-primary text-white py-5 position-relative overflow-hidden" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
        <div 
          className="position-absolute w-100 h-100 top-0 start-0" 
          style={{ background: 'linear-gradient(135deg, #0d6efd 0%, #000046 100%)', opacity: 0.9, zIndex: 0 }} 
        ></div>
        <Container className="position-relative text-center" style={{ zIndex: 1 }}>
          <h1 className="display-3 fw-bold mb-4">Raih Prestasi Bersama <span className="text-warning">MAPA</span></h1>
          <p className="lead mb-5 mx-auto opacity-75" style={{ maxWidth: '700px' }}>
            Bimbel terpercaya dengan tutor berpengalaman dan metode belajar modern untuk masa depan yang cemerlang.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Button 
              variant="warning" 
              size="lg" 
              className="fw-bold px-5 rounded-pill shadow-lg"
              onClick={() => document.getElementById('paket')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Lihat Paket
            </Button>
            
            {/* Tombol Hero juga bisa disesuaikan jika mau */}
            {!user && (
              <Button 
                variant="outline-light" 
                size="lg" 
                className="fw-bold px-5 rounded-pill"
                onClick={() => onNavigate('login')}
              >
                Masuk Siswa
              </Button>
            )}
          </div>
        </Container>
      </div>

      {/* Features Section */}
      <Container className="py-5">
        <Row className="text-center mb-5">
          <Col>
            <h2 className="fw-bold">Mengapa Memilih Kami?</h2>
            <p className="text-muted">Keunggulan kualitas pendidikan terbaik untuk putra-putri Anda.</p>
          </Col>
        </Row>
        <Row className="g-4">
          {[
            { icon: Users, title: "Tutor Profesional", desc: "Lulusan PTN ternama berpengalaman > 3 tahun." },
            { icon: BookOpen, title: "Modul Lengkap", desc: "Materi update kurikulum Merdeka & HOTS." },
            { icon: Award, title: "Jaminan Kualitas", desc: "Laporan perkembangan siswa transparan." }
          ].map((feature, idx) => (
            <Col md={4} key={idx}>
              <Card className="h-100 border-0 shadow-sm text-center p-4 hover-shadow transition">
                <Card.Body>
                  <div className="d-inline-flex align-items-center justify-content-center p-3 bg-light rounded-circle mb-3 text-primary">
                    <feature.icon size={32} />
                  </div>
                  <Card.Title className="fw-bold mb-3">{feature.title}</Card.Title>
                  <Card.Text className="text-muted">{feature.desc}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Packages Section */}
      <div id="paket" className="bg-light py-5">
        <Container>
          <div className="text-center mb-5">
            <h2 className="fw-bold">Pilihan Paket Belajar</h2>
            <p className="text-muted">Investasi cerdas untuk hasil maksimal.</p>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <Row className="g-4 justify-content-center">
              {packages.map((pkg) => (
                <Col md={6} lg={4} key={pkg.id}>
                  <Card className="h-100 border-0 shadow-sm hover-top transition overflow-hidden">
                    <div className={`h-1 w-100 ${pkg.color || 'bg-primary'}`} style={{ height: '6px' }}></div>
                    
                    <Card.Body className="d-flex flex-column p-4">
                      <div className="text-center mb-4">
                         <h3 className="fw-bold mb-1">{pkg.title}</h3>
                         <h2 className="text-primary fw-bold display-6">
                           {pkg.price_display || `Rp ${pkg.price.toLocaleString('id-ID')}`}
                           <span className="fs-6 text-muted fw-normal ms-1">/bulan</span>
                         </h2>
                      </div>
                      
                      <ul className="list-unstyled mb-4 flex-grow-1 px-3">
                        {(pkg.features || []).map((feature, idx) => (
                          <li key={idx} className="mb-3 d-flex align-items-start">
                            <CheckCircle size={20} className="text-success me-3 mt-1 flex-shrink-0" />
                            <span className="text-secondary fw-medium">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {/* 4. TOMBOL DINAMIS */}
                      <Button 
                        variant={user ? "success" : "primary"} // Ubah warna jika sudah login
                        className="w-100 py-3 fw-bold rounded-pill shadow d-flex align-items-center justify-content-center mt-auto"
                        onClick={() => handlePackageClick(pkg)} // Gunakan handler baru
                        style={{ transition: 'all 0.3s ease' }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        {user ? (
                          <>Pilih Paket <CheckCircle size={18} className="ms-2" /></>
                        ) : (
                          <>Daftar Sekarang <ArrowRight size={18} className="ms-2" /></>
                        )}
                      </Button>

                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </div>
    </>
  );
}