import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Badge,
  Button,
  Alert,
  ListGroup,
  Spinner,
  Tab,
  Tabs,
  Table,
} from "react-bootstrap";
import {
  Award,
  BookOpen,
  Clock,
  AlertTriangle,
  FileText,
  Download,
  TrendingUp,
  RefreshCcw,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExpired, setIsExpired] = useState(false);

  const [materials, setMaterials] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    const fetchStatus = async () => {
      if (!user) return;

      try {
        let query = supabase
          .from("invoices")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1);

        if (user.id) {
          query = query.eq("user_id", user.id);
        } else {
          query = query.eq("email", user.email);
        }

        const { data, error } = await query.single();

        if (error && error.code !== "PGRST116") {
          console.error("Error fetch invoice:", error);
        }

        setActiveInvoice(data);

        if (data && data.status === "paid") {
          if (data.expiry_date) {
            const now = new Date();
            const expiry = new Date(data.expiry_date);

            if (now > expiry) {
              setIsExpired(true);
            } else {
              setIsExpired(false);
              fetchAcademicData();
            }
          } else {
            fetchAcademicData();
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [user]);

  const fetchAcademicData = async () => {
    setLoadingData(true);
    try {
      const { data: matData } = await supabase
        .from("materials")
        .select("*")
        .order("created_at", { ascending: false });
      setMaterials(matData || []);

      const { data: gradeData } = await supabase
        .from("grades")
        .select("*")
        .eq("student_id", user.id)
        .order("created_at", { ascending: false });
      setGrades(gradeData || []);
    } catch (err) {
      console.error("Gagal ambil data akademik:", err);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading)
    return <div className="p-4 text-center">Memuat dashboard...</div>;

  if (!activeInvoice) {
    return (
      <Alert variant="warning" className="d-flex align-items-center p-4">
        <AlertTriangle size={32} className="me-3" />
        <div>
          <h4 className="alert-heading">Paket Belum Aktif</h4>
          <p>Anda belum terdaftar di paket belajar manapun.</p>
          <Button href="/#pricing" variant="warning" className="fw-bold">
            Pilih Paket Sekarang
          </Button>
        </div>
      </Alert>
    );
  }

  if (isExpired) {
    return (
      <Alert variant="danger" className="text-center p-5 shadow-sm">
        <div className="mx-auto mb-3 p-3 bg-red-100 rounded-circle d-inline-block text-danger">
          <RefreshCcw size={48} />
        </div>
        <h3 className="fw-bold text-danger">Masa Aktif Paket Berakhir</h3>
        <p className="text-muted mb-4 fs-5">
          Paket <strong>{activeInvoice.package_name}</strong> Anda telah
          berakhir pada tanggal <br />
          <strong>
            {new Date(activeInvoice.expiry_date).toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </strong>
          .
        </p>
        <div className="d-flex justify-content-center gap-3">
          <Button
            href="/#pricing"
            variant="primary"
            size="lg"
            className="px-5 rounded-pill fw-bold"
          >
            Perpanjang / Beli Paket Baru
          </Button>
        </div>
      </Alert>
    );
  }

  if (activeInvoice.status === "unpaid") {
    return (
      <Alert variant="danger" className="text-center p-5">
        <h4 className="fw-bold">Tagihan Belum Dibayar</h4>
        <p className="mb-4">
          Paket <strong>{activeInvoice.package_name}</strong> menunggu
          pembayaran.
        </p>
        <div className="h2 fw-bold mb-4">
          Rp {activeInvoice.total_amount?.toLocaleString("id-ID")}
        </div>
        <Button
          onClick={() => (window.location.href = "/invoice")}
          variant="danger"
          className="px-4"
        >
          Bayar & Konfirmasi Sekarang
        </Button>
      </Alert>
    );
  }

  if (activeInvoice.status === "waiting_confirmation") {
    return (
      <Alert variant="info" className="text-center p-5">
        <Clock size={48} className="mb-3 text-info" />
        <h4 className="fw-bold">Menunggu Konfirmasi Admin</h4>
        <p>
          Paket <strong>{activeInvoice.package_name}</strong> sedang
          diverifikasi.
        </p>
        <Button
          onClick={() => (window.location.href = "/invoice")}
          variant="outline-info"
        >
          Lihat Status Invoice
        </Button>
      </Alert>
    );
  }

  return (
    <Row className="g-4">
      <Col xs={12}>
        <Card className="bg-success text-white shadow border-0 overflow-hidden">
          <Card.Body className="p-4 d-flex justify-content-between align-items-center">
            <div>
              <Badge bg="light" text="success" className="mb-2">
                Paket Aktif
              </Badge>
              <h2 className="fw-bold">{activeInvoice.package_name}</h2>
              <div className="d-flex align-items-center gap-2 mt-2">
                <Clock size={16} />
                <span className="small">
                  Berlaku hingga:{" "}
                  <strong>
                    {/* [UBAH] Gunakan formatDate */}
                    {activeInvoice.expiry_date
                      ? formatDate(activeInvoice.expiry_date)
                      : "Selamanya"}
                  </strong>
                </span>
              </div>
            </div>
            <Award size={64} className="opacity-50 text-white" />
          </Card.Body>
        </Card>
      </Col>

      <Col md={12}>
        <Card className="shadow-sm border-0">
          <Card.Body>
            <Tabs
              defaultActiveKey="materi"
              id="student-tabs"
              className="mb-4"
              fill
            >
              <Tab
                eventKey="materi"
                title={
                  <>
                    <BookOpen size={18} className="me-2" />
                    Materi Belajar
                  </>
                }
              >
                {loadingData ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" size="sm" />
                  </div>
                ) : materials.length === 0 ? (
                  <Alert
                    variant="light"
                    className="text-center text-muted border border-dashed py-5"
                  >
                    Belum ada materi yang diupload oleh pengajar.
                  </Alert>
                ) : (
                  <ListGroup variant="flush">
                    {materials.map((item) => (
                      <ListGroup.Item
                        key={item.id}
                        className="d-flex justify-content-between align-items-center py-3"
                      >
                        <div className="d-flex align-items-center">
                          <div className="bg-light p-2 rounded me-3">
                            <FileText size={24} className="text-danger" />
                          </div>
                          <div>
                            <h6 className="fw-bold mb-1">{item.title}</h6>
                            <small className="text-muted">
                              {/* [UBAH] Gunakan formatDate */}
                              Jenjang: {item.jenjang || "Umum"} •{" "}
                              {formatDate(item.created_at)}
                            </small>
                          </div>
                        </div>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          href={item.file_url}
                          target="_blank"
                          className="d-flex align-items-center"
                        >
                          <Download size={16} className="me-2" /> Unduh
                        </Button>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </Tab>

              <Tab
                eventKey="nilai"
                title={
                  <>
                    <TrendingUp size={18} className="me-2" />
                    Riwayat Nilai
                  </>
                }
              >
                {loadingData ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" size="sm" />
                  </div>
                ) : grades.length === 0 ? (
                  <Alert
                    variant="light"
                    className="text-center text-muted border border-dashed py-5"
                  >
                    Belum ada nilai yang dimasukkan pengajar.
                  </Alert>
                ) : (
                  <div className="table-responsive">
                    <Table hover className="align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Mata Pelajaran</th>
                          <th className="text-center">Nilai</th>
                          <th>Feedback</th>
                          <th>Tanggal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {grades.map((g) => (
                          <tr key={g.id}>
                            <td className="fw-bold">{g.subject}</td>
                            <td className="text-center">
                              <Badge
                                bg={g.score >= 75 ? "success" : "warning"}
                                className="fs-6"
                              >
                                {g.score}
                              </Badge>
                            </td>
                            <td className="text-muted fst-italic">
                              "{g.feedback || "-"}"
                            </td>
                            {/* [UBAH] Gunakan formatDate */}
                            <td className="text-muted small">
                              {formatDate(g.created_at)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Tab>
            </Tabs>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}
