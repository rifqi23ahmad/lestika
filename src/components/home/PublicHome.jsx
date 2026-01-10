import React, { useState } from "react";
import { Container, Row, Col, Button, Card, Spinner } from "react-bootstrap";
import {
  Users,
  BookOpen,
  Award,
  CheckCircle,
  ArrowRight,
  Star,
  Quote,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatRupiah } from "../../utils/format";

const PublicHome = ({
  packages,
  loading,
  testimonials,
  loadingTesti,
  user,
  isMobile,
  handlePackageClick,
}) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = isMobile ? 1 : 3;

  const handleNext = () => {
    if (currentIndex + itemsPerPage < testimonials.length)
      setCurrentIndex(currentIndex + 1);
  };
  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };
  const renderStars = (count) =>
    [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={14}
        className={
          i < count ? "text-warning fill-warning" : "text-muted opacity-25"
        }
        fill={i < count ? "currentColor" : "none"}
      />
    ));

  return (
    <>
      <div
        className="bg-primary text-white position-relative overflow-hidden d-flex align-items-center"
        style={{
          minHeight: isMobile ? "auto" : "80vh",
          padding: isMobile ? "4rem 0" : "5rem 0",
        }}
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
          <h1 className="display-5 display-md-3 fw-bold mb-3 mb-md-4">
            Raih Prestasi Bersama <span className="text-warning">MAPA</span>
          </h1>
          <p
            className="lead mb-4 mb-md-5 mx-auto opacity-75 fs-6 fs-md-5"
            style={{ maxWidth: "700px" }}
          >
            Bimbingan Belajar Privat dan Group Matematika SD SMP SMA dan IPA
            untuk SMP SMA
          </p>
          <div className="d-flex flex-column flex-md-row justify-content-center gap-3">
            <Button
              variant="warning"
              size={isMobile ? "md" : "lg"}
              className="fw-bold px-5 rounded-pill shadow-lg"
              onClick={() =>
                document
                  .getElementById("paket")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Lihat Paket
            </Button>
            {!user ? (
              <Button
                variant="outline-light"
                size={isMobile ? "md" : "lg"}
                className="fw-bold px-5 rounded-pill"
                onClick={() => navigate("/login")}
              >
                Masuk
              </Button>
            ) : (
              <Button
                variant="outline-light"
                size={isMobile ? "md" : "lg"}
                className="fw-bold px-5 rounded-pill"
                onClick={() => navigate("/dashboard")}
              >
                Dashboard Saya
              </Button>
            )}
          </div>
        </Container>
      </div>

      <Container className="py-5">
        <Row className="text-center mb-4 mb-md-5">
          <Col>
            <h2 className="fw-bold fs-3 fs-md-2">Mengapa Memilih Kami?</h2>
          </Col>
        </Row>
        <Row className="g-3 g-md-4">
          {[
            {
              icon: Users,
              title: "Tutor Profesional",
              desc: "Lulusan Sarjana Pendidikan Matematika berpengalaman >10 tahun.",
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

      <div id="paket" className="bg-light py-5">
        <Container>
          <div className="text-center mb-4 mb-md-5">
            <h2 className="fw-bold fs-3 fs-md-2">Pilihan Paket Belajar</h2>
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
                          <h3 className="fw-bold mb-1 fs-4">{pkg.title}</h3>
                          <h2 className="text-primary fw-bold display-6">
                            {formatRupiah(pkg.price)}
                            <span className="fs-6 text-muted fw-normal ms-1">
                              /bln
                            </span>
                          </h2>
                        </div>
                        <ul className="list-unstyled mb-4 flex-grow-1 px-2 px-md-3">
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

      <div className="py-5 bg-white">
        <Container>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-end mb-4 mb-md-5">
            <div className="text-center text-md-start w-100 w-md-auto">
              <h6 className="text-primary fw-bold text-uppercase ls-1 mb-2">
                Testimoni
              </h6>
              <h2 className="fw-bold display-6 text-dark fs-3 fs-md-2">
                Apa Kata Mereka?
              </h2>
            </div>
            {!isMobile && testimonials.length > itemsPerPage && (
              <div className="d-none d-md-flex gap-2">
                <Button
                  variant="outline-secondary"
                  className="rounded-circle p-0 d-flex align-items-center justify-content-center border"
                  style={{ width: "40px", height: "40px" }}
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft size={20} />
                </Button>
                <Button
                  variant="outline-primary"
                  className="rounded-circle p-0 d-flex align-items-center justify-content-center border"
                  style={{ width: "40px", height: "40px" }}
                  onClick={handleNext}
                  disabled={currentIndex + itemsPerPage >= testimonials.length}
                >
                  <ChevronRight size={20} />
                </Button>
              </div>
            )}
          </div>

          {loadingTesti ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : testimonials.length === 0 ? (
            <div className="text-center py-5 bg-light rounded-4">
              <p className="text-muted fst-italic mb-0">
                Belum ada testimoni saat ini.
              </p>
            </div>
          ) : (
            <Row className="g-4 justify-content-center">
              {testimonials
                .slice(currentIndex, currentIndex + itemsPerPage)
                .map((t) => (
                  <Col xs={12} md={4} key={t.id}>
                    <Card className="border shadow-sm h-100 rounded-3 bg-white">
                      <Card.Body className="p-4 d-flex flex-column">
                        <div className="mb-3">
                          <div
                            className="bg-primary bg-opacity-10 text-primary rounded-circle d-inline-flex align-items-center justify-content-center"
                            style={{ width: 36, height: 36 }}
                          >
                            <Quote size={18} className="fill-current" />
                          </div>
                        </div>
                        <p
                          className="text-secondary flex-grow-1 mb-4"
                          style={{ fontSize: "0.95rem", lineHeight: "1.6" }}
                        >
                          {t.content}
                        </p>
                        <div className="d-flex align-items-center pt-3 border-top">
                          <div
                            className="bg-light text-primary border rounded-circle d-flex align-items-center justify-content-center fw-bold me-3"
                            style={{ width: 42, height: 42, fontSize: "1rem" }}
                          >
                            {t.student?.full_name?.charAt(0).toUpperCase() ||
                              "U"}
                          </div>
                          <div>
                            <h6
                              className="fw-bold mb-0 text-dark"
                              style={{ fontSize: "0.9rem" }}
                            >
                              {t.student?.full_name || "Siswa"}
                            </h6>
                            <div className="d-flex mt-1">
                              {renderStars(t.rating)}
                            </div>
                          </div>
                        </div>
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
};

export default PublicHome;
