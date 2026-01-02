import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Card, Spinner } from "react-bootstrap";
import { Users, BookOpen, Award, CheckCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { packageService } from "../services/packageService";
import { useAuth } from "../context/AuthContext";
import { formatRupiah } from "../utils/format";
import { InfoModal } from "../components/admin/modals/DashboardModals";

export default function HomeView() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAuthModal, setShowAuthModal] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

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

  const handlePackageClick = (pkg) => {
    if (user) {
      navigate("/register", { state: { pkg: pkg } });
    } else {
      setShowAuthModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowAuthModal(false);
    navigate("/login");
  };

  return (
    <>
      {/* Hero Section */}
      <div
        className="bg-primary text-white py-5 position-relative overflow-hidden"
        style={{ minHeight: "80vh", display: "flex", alignItems: "center" }}
      >
        <div
          className="position-absolute w-100 h-100 top-0 start-0"
          style={{
            background: "linear-gradient(135deg, #0d6efd 0%, #000046 100%)",
            opacity: 0.9,
            zIndex: 0,
          }}
        ></div>
        <Container
          className="position-relative text-center"
          style={{ zIndex: 1 }}
        >
          <h1 className="display-3 fw-bold mb-4">
            Raih Prestasi Bersama <span className="text-warning">MAPA</span>
          </h1>
          <p
            className="lead mb-5 mx-auto opacity-75"
            style={{ maxWidth: "700px" }}
          >
            Bimbingan Belajar Privat dan Group Matematika SD, SMP, SMA dan IPA
            untuk SMP, SMA
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Button
              variant="warning"
              size="lg"
              className="fw-bold px-5 rounded-pill shadow-lg"
              onClick={() =>
                document
                  .getElementById("paket")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Lihat Paket
            </Button>
            {!user && (
              <Button
                variant="outline-light"
                size="lg"
                className="fw-bold px-5 rounded-pill"
                onClick={() => navigate("/login")}
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
          </Col>
        </Row>
        <Row className="g-4">
          {[
            {
              icon: Users,
              title: "Tutor Profesional",
              desc: "Lulusan PTN ternama berpengalaman.",
            },
            {
              icon: BookOpen,
              title: "Modul Lengkap",
              desc: "Materi update kurikulum Merdeka.",
            },
            {
              icon: Award,
              title: "Jaminan Kualitas",
              desc: "Laporan perkembangan siswa transparan.",
            },
          ].map((feature, idx) => (
            <Col md={4} key={idx}>
              <Card className="h-100 border-0 shadow-sm text-center p-4">
                <Card.Body>
                  <div className="d-inline-flex align-items-center justify-content-center p-3 bg-light rounded-circle mb-3 text-primary">
                    <feature.icon size={32} />
                  </div>
                  <Card.Title className="fw-bold mb-3">
                    {feature.title}
                  </Card.Title>
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
          </div>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <Row className="g-4 justify-content-center">
              {packages.map((pkg) => {
                const featuresList = Array.isArray(pkg.features)
                  ? pkg.features
                  : (pkg.features || "")
                      .split(",")
                      .map((f) => f.trim())
                      .filter((f) => f);

                return (
                  <Col md={6} lg={4} key={pkg.id}>
                    <Card className="h-100 border-0 shadow-sm hover-top transition overflow-hidden">
                      <div
                        className={`h-1 w-100 ${pkg.color || "bg-primary"}`}
                        style={{ height: "6px" }}
                      ></div>
                      <Card.Body className="d-flex flex-column p-4">
                        <div className="text-center mb-4">
                          <h3 className="fw-bold mb-1">{pkg.title}</h3>

                          <h2 className="text-primary fw-bold display-6">
                            {formatRupiah(pkg.price)}
                            <span className="fs-6 text-muted fw-normal ms-1">
                              /bln
                            </span>
                          </h2>
                        </div>
                        <ul className="list-unstyled mb-4 flex-grow-1 px-3">
                          {featuresList.map((feature, idx) => (
                            <li
                              key={idx}
                              className="mb-3 d-flex align-items-start"
                            >
                              <CheckCircle
                                size={20}
                                className="text-success me-3 mt-1 flex-shrink-0"
                              />
                              <span className="text-secondary fw-medium">
                                {feature}
                              </span>
                            </li>
                          ))}
                        </ul>
                        <Button
                          variant={user ? "success" : "primary"}
                          className="w-100 py-3 fw-bold rounded-pill shadow mt-auto"
                          onClick={() => handlePackageClick(pkg)}
                        >
                          {user ? "Pilih Paket" : "Daftar Sekarang"}{" "}
                          <ArrowRight size={18} className="ms-2" />
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}
        </Container>
      </div>

      {/* MODAL GLOBAL */}
      <InfoModal
        show={showAuthModal}
        onClose={handleCloseModal}
        title="Akses Dibatasi"
        msg="Silakan buat akun atau login terlebih dahulu untuk mendaftar paket ini."
        type="warning"
      />
    </>
  );
}
