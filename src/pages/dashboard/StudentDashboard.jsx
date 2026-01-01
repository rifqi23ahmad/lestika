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
  CheckCircle,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  // State untuk Materi & Nilai
  const [materials, setMaterials] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

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

        // JIKA STATUS PAID, Fetch Data Materi & Nilai
        if (data && data.status === "paid") {
          fetchAcademicData();
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [user]);

  // Fungsi fetch gabungan (Materi & Nilai)
  const fetchAcademicData = async () => {
    setLoadingData(true);
    try {
      // 1. Ambil Materi
      const { data: matData } = await supabase
        .from("materials")
        .select("*")
        .order("created_at", { ascending: false });
      setMaterials(matData || []);

      // 2. Ambil Nilai (Hanya milik user yang login)
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

  // --- LOGIC TAMPILAN BERDASARKAN STATUS ---

  // 1. Belum Ada Paket
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

  // 2. Belum Bayar
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

  // 3. Menunggu Konfirmasi
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

  // 4. Status PAID (Aktif) -> Tampilkan Dashboard Lengkap
  return (
    <Row className="g-4">
      {/* Header Status */}
      <Col xs={12}>
        <Card className="bg-success text-white shadow border-0 overflow-hidden">
          <Card.Body className="p-4 d-flex justify-content-between align-items-center">
            <div>
              <Badge bg="light" text="success" className="mb-2">
                Paket Aktif
              </Badge>
              <h2 className="fw-bold">{activeInvoice.package_name}</h2>
              <p className="mb-0 opacity-75">Selamat belajar, {user.name}!</p>
            </div>
            <Award size={64} className="opacity-50 text-white" />
          </Card.Body>
        </Card>
      </Col>

      {/* Tab Navigasi: Materi & Nilai */}
      <Col md={12}>
        <Card className="shadow-sm border-0">
          <Card.Body>
            <Tabs
              defaultActiveKey="materi"
              id="student-tabs"
              className="mb-4"
              fill
            >
              {/* TAB 1: MATERI */}
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
                              Jenjang: {item.jenjang || "Umum"} •{" "}
                              {new Date(item.created_at).toLocaleDateString(
                                "id-ID"
                              )}
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

              {/* TAB 2: NILAI (Fitur Baru Opsi B) */}
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
                          <th>Feedback / Catatan</th>
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
                            <td className="text-muted small">
                              {new Date(g.created_at).toLocaleDateString(
                                "id-ID"
                              )}
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
