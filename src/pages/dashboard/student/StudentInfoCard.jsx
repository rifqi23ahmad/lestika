import React from "react";
import { Card, Badge, Button, Row, Col } from "react-bootstrap";
import { Clock, MessageSquare, Award, User, Star } from "lucide-react";

export default function StudentInfoCard({
  user,
  activeInvoice,
  onReviewClick,
}) {
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const displayName =
    user?.user_metadata?.full_name ||
    user?.full_name ||
    user?.email?.split("@")[0] ||
    "Siswa";
  const displayEmail = user?.email || "-";

  return (
    <Card
      className="border-0 shadow-sm overflow-hidden mb-4"
      style={{ borderRadius: "15px" }}
    >
      <div className="bg-primary bg-gradient p-4 text-white">
        <Row className="align-items-center gy-4">
          <Col
            md={7}
            className="d-flex align-items-center gap-3 border-end border-light border-opacity-25"
          >
            <div
              className="bg-white rounded-circle d-flex align-items-center justify-content-center shadow-sm"
              style={{ width: "80px", height: "80px", flexShrink: 0 }}
            >
              <User size={40} className="text-primary" />
            </div>
            <div>
              <p className="mb-0 opacity-75 small text-uppercase fw-semibold tracking-wide">
                Selamat Datang,
              </p>
              <h3 className="fw-bold mb-1 text-truncate">{displayName}</h3>
              <div className="d-flex align-items-center gap-2 opacity-75 small">
                <span className="bg-white bg-opacity-25 px-2 py-1 rounded">
                  Siswa
                </span>
                <span>{displayEmail}</span>
              </div>
            </div>
          </Col>

          <Col md={5}>
            <div className="bg-white bg-opacity-10 rounded-3 p-3 position-relative overflow-hidden">
              <Award
                size={80}
                className="position-absolute text-white opacity-10"
                style={{ right: -10, top: -10, transform: "rotate(15deg)" }}
              />

              <div className="position-relative z-1">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="small opacity-75">
                    Paket Belajar Saat Ini:
                  </span>
                  <Badge bg="light" text="primary" className="shadow-sm">
                    Aktif
                  </Badge>
                </div>

                <h4 className="fw-bold mb-2">
                  {activeInvoice?.package_name || "Belum Berlangganan"}
                </h4>

                <div className="d-flex align-items-center gap-2 mb-3 small opacity-75">
                  <Clock size={16} />
                  <span>
                    Berlaku s.d:{" "}
                    <strong>
                      {activeInvoice?.expiry_date
                        ? formatDate(activeInvoice.expiry_date)
                        : "-"}
                    </strong>
                  </span>
                </div>

                {activeInvoice && (
                  <Button
                    variant="light"
                    size="sm"
                    className="w-100 text-primary fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                    onClick={onReviewClick}
                  >
                    <Star size={16} fill="currentColor" /> Beri Ulasan Paket
                  </Button>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </Card>
  );
}
