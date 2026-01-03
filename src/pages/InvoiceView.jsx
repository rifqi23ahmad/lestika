import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  Badge,
  Button,
  Form,
  Alert,
  Table,
  Spinner,
  Row,
  Col,
  Modal,
} from "react-bootstrap";
import {
  Download,
  Upload,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowLeft,
  FileText,
  Search,
  Check,
  X,
  MapPin,
  Globe,
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { APP_CONFIG } from "../config/constants";
import { invoiceService } from "../services/invoiceService";
import { useAuth } from "../context/AuthContext";
import { formatRupiah } from "../utils/format";

export default function InvoiceView() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const printRef = useRef();

  const [viewMode, setViewMode] = useState(
    location.state?.invoice ? "detail" : "list"
  );

  const [invoice, setInvoice] = useState(location.state?.invoice || null);
  const [history, setHistory] = useState([]);
  const [fetching, setFetching] = useState(false);

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalState, setModalState] = useState({
    title: "",
    message: "",
    type: "success",
  });

  useEffect(() => {
    if (user) fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    setFetching(true);
    try {
      const data = await invoiceService.getHistory(user.id);
      setHistory(data || []);

      if (invoice) {
        const updated = data.find((i) => i.id === invoice.id);
        if (updated) setInvoice(updated);
      }
    } catch (err) {
      console.error("Gagal load history:", err);
    } finally {
      setFetching(false);
    }
  };

  const showAlertModal = (title, message, type = "success") => {
    setModalState({ title, message, type });
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case APP_CONFIG.INVOICE.STATUS.PAID:
        return (
          <Badge bg="success" className="px-3 py-2 fw-normal">
            LUNAS
          </Badge>
        );
      case APP_CONFIG.INVOICE.STATUS.WAITING:
        return (
          <Badge bg="warning" text="dark" className="px-3 py-2 fw-normal">
            MENUNGGU VERIFIKASI
          </Badge>
        );
      default:
        return (
          <Badge bg="danger" className="px-3 py-2 fw-normal">
            BELUM DIBAYAR
          </Badge>
        );
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);

    try {
      const updatedInvoice = await invoiceService.processPaymentConfirmation(
        invoice.id,
        user.id,
        file
      );
      setInvoice(updatedInvoice);
      fetchHistory();
      showAlertModal(
        "Upload Berhasil!",
        "Bukti pembayaran telah dikirim dan sedang diverifikasi.",
        "success"
      );
      setFile(null);
    } catch (error) {
      showAlertModal("Upload Gagal", error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    const element = printRef.current;
    if (!element) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice-${invoice.invoice_no}.pdf`);
    } catch (error) {
      console.error("Gagal download PDF:", error);
      showAlertModal("Error", "Terjadi kesalahan saat mengunduh PDF.", "error");
    } finally {
      setDownloading(false);
    }
  };

  const renderList = () => (
    <Card className="shadow-sm border-0 rounded-3">
      <Card.Header className="bg-white py-3 border-bottom">
        <h5 className="mb-0 fw-bold d-flex align-items-center text-dark">
          <FileText className="me-2 text-primary" size={20} />
          Riwayat Tagihan
        </h5>
      </Card.Header>
      <Card.Body className="p-0">
        {fetching ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <Search size={48} className="mb-3 opacity-25" />
            <p>Belum ada riwayat transaksi.</p>
            <Button variant="primary" onClick={() => navigate("/#pricing")}>
              Lihat Paket Belajar
            </Button>
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead className="bg-light text-secondary small text-uppercase">
                <tr>
                  <th className="ps-4 py-3">No. Invoice</th>
                  <th>Layanan</th>
                  <th>Tanggal</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th className="text-end pe-4">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr
                    key={item.id}
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setInvoice(item);
                      setViewMode("detail");
                    }}
                  >
                    <td className="ps-4 fw-bold text-primary">
                      #{item.invoice_no}
                    </td>
                    <td>
                      <span className="d-block text-dark fw-medium">
                        {item.package_name}
                      </span>
                    </td>
                    <td className="small text-muted">
                      {new Date(item.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="fw-bold text-dark">
                      {formatRupiah(item.total_amount)}
                    </td>
                    <td>{getStatusBadge(item.status)}</td>
                    <td className="text-end pe-4">
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        className="rounded-pill px-3"
                      >
                        Detail
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>
    </Card>
  );

  const renderDetail = () => (
    <>
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <Button
          variant="link"
          className="text-decoration-none p-0 d-flex align-items-center text-muted fw-medium"
          onClick={() => {
            setViewMode("list");
            fetchHistory();
          }}
        >
          <ArrowLeft size={18} className="me-2" /> Kembali ke Riwayat
        </Button>
        <Button
          variant="primary"
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="d-flex align-items-center shadow-sm"
        >
          <Download size={16} className="me-2" />
          {downloading ? "Memproses..." : "Download PDF"}
        </Button>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-9">
          <div
            ref={printRef}
            className="bg-white p-5 shadow-sm border position-relative"
            style={{ minHeight: "297mm", position: "relative" }} // A4 feel
          >
            <div className="d-flex justify-content-between align-items-start border-bottom pb-4 mb-4">
              <div>
                <div className="d-flex align-items-center mb-3">
                  <img
                    src="/logo.png"
                    alt="Logo"
                    style={{ height: "40px", width: "auto" }}
                    className="me-3"
                  />
                  <div>
                    <h4
                      className="fw-bold mb-0 text-primary"
                      style={{ letterSpacing: "-0.5px" }}
                    >
                      MAPA
                    </h4>
                    <small className="text-muted">
                      Bimbingan Belajar Online
                    </small>
                  </div>
                </div>
                <div className="text-muted small">
                  <div className="d-flex align-items-center mb-1">
                    <Globe size={14} className="me-2" /> www.bimbelmapa.com
                  </div>
                  <div className="d-flex align-items-center">
                    <MapPin size={14} className="me-2" /> Tangerang, Banten
                  </div>
                </div>
              </div>
              <div className="text-end">
                <h2 className="fw-bold text-secondary mb-1">INVOICE</h2>
                <h5 className="text-dark mb-1">#{invoice.invoice_no}</h5>
                <p className="text-muted small mb-0">
                  Tanggal:{" "}
                  {new Date(invoice.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <div className="mt-2">{getStatusBadge(invoice.status)}</div>
              </div>
            </div>

            <Row className="mb-5">
              <Col md={6}>
                <h6 className="text-uppercase text-muted small fw-bold mb-3">
                  Ditagihkan Kepada:
                </h6>
                <h5 className="fw-bold mb-1">{invoice.student_name}</h5>
                <p className="text-muted mb-0">
                  {invoice.student_kelas} - {invoice.student_jenjang}
                  <br />
                  No. WA: {invoice.student_whatsapp || "-"}
                </p>
              </Col>
            </Row>

            <Table className="mb-4 align-middle" bordered={false}>
              <thead className="bg-light text-secondary">
                <tr>
                  <th className="py-3 ps-3" style={{ width: "50%" }}>
                    Deskripsi Layanan
                  </th>
                  <th className="py-3 text-center">Periode</th>
                  <th className="py-3 text-center">Qty</th>
                  <th className="py-3 text-end pe-3">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="ps-3 py-3">
                    <div className="fw-bold text-dark">
                      {invoice.package_name}
                    </div>
                    <div className="text-muted small">
                      Paket belajar reguler
                    </div>
                  </td>
                  <td className="text-center py-3">1 Bulan</td>
                  <td className="text-center py-3">1</td>
                  <td className="text-end pe-3 py-3 fw-bold">
                    {formatRupiah(invoice.total_amount)}
                  </td>
                </tr>
              </tbody>
            </Table>

            <Row className="justify-content-end mb-5">
              <Col md={5}>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Subtotal</span>
                  <span className="fw-bold">
                    {formatRupiah(invoice.total_amount)}
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-2 pb-2 border-bottom">
                  <span className="text-muted">Pajak (0%)</span>
                  <span>Rp 0</span>
                </div>
                <div className="d-flex justify-content-between align-items-center pt-2">
                  <span className="fw-bold fs-5 text-dark">Total Tagihan</span>
                  <span className="fw-bold fs-4 text-primary">
                    {formatRupiah(invoice.total_amount)}
                  </span>
                </div>
              </Col>
            </Row>

            <div className="bg-light p-4 rounded mb-5 border border-light">
              <h6 className="fw-bold mb-3 d-flex align-items-center">
                Metode Pembayaran
              </h6>
              <Row>
                <Col md={6}>
                  <p className="small text-muted mb-1">Bank Transfer:</p>
                  <div className="fw-bold text-dark mb-1">BANK BTN</div>
                  <div className="fs-5 fw-bold text-primary mb-1">
                    016301500279103
                  </div>
                  <div className="small">Rahmatika Rizqiantari</div>
                </Col>
                <Col md={6} className="mt-3 mt-md-0 border-start ps-md-4">
                  <p className="small text-muted mb-1">Instruksi:</p>
                  <ul className="small text-muted ps-3 mb-0">
                    <li>Pastikan nominal transfer sesuai total tagihan.</li>
                    <li>Simpan bukti transfer Anda.</li>
                    <li>
                      Upload bukti pembayaran melalui halaman ini atau
                      konfirmasi via WhatsApp admin.
                    </li>
                  </ul>
                </Col>
              </Row>
            </div>

            <div className="mt-auto pt-5">
              <div className="text-center">
                <p className="text-muted fst-italic small mb-1">
                  "Terima kasih telah mempercayakan pendidikan Anda bersama
                  MAPA."
                </p>
                <div className="border-top w-50 mx-auto my-3"></div>
                <p className="text-muted opacity-50 small mb-0">
                  Dokumen ini diterbitkan secara otomatis oleh sistem komputer.
                  <br />
                  Sah dan berlaku tanpa tanda tangan basah.
                </p>
              </div>
            </div>

            {invoice.status === APP_CONFIG.INVOICE.STATUS.UNPAID && (
              <div
                data-html2canvas-ignore
                className="mt-5 p-4 border border-dashed rounded bg-blue-50"
                style={{ backgroundColor: "#f8f9fa" }}
              >
                <h6 className="fw-bold mb-3 d-flex align-items-center text-primary">
                  <Upload size={18} className="me-2" /> Upload Bukti Pembayaran
                </h6>
                <Form onSubmit={handleUpload}>
                  <Row className="g-2 align-items-center">
                    <Col>
                      <Form.Control
                        type="file"
                        onChange={(e) => setFile(e.target.files[0])}
                        required
                        className="shadow-none"
                      />
                    </Col>
                    <Col xs="auto">
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={loading}
                      >
                        {loading ? (
                          <Spinner size="sm" animation="border" />
                        ) : (
                          "Kirim Konfirmasi"
                        )}
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </div>
            )}

            {invoice.status === APP_CONFIG.INVOICE.STATUS.WAITING && (
              <div data-html2canvas-ignore className="mt-5">
                <Alert
                  variant="info"
                  className="d-flex align-items-center border-0 shadow-sm"
                >
                  <Clock className="me-3" size={24} />
                  <div>
                    <h6 className="alert-heading fw-bold mb-1">
                      Pembayaran Sedang Diverifikasi
                    </h6>
                    <p className="mb-0 small">
                      Terima kasih! Bukti pembayaran Anda sudah kami terima.
                      Admin akan memverifikasi dalam waktu 1x24 jam.
                    </p>
                  </div>
                </Alert>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <Container className="py-5 bg-light" fluid style={{ minHeight: "100vh" }}>
      <Container style={{ maxWidth: "1000px" }}>
        {viewMode === "list" ? renderList() : renderDetail()}
      </Container>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Body className="text-center p-4">
          <div
            className={`mx-auto mb-3 p-3 rounded-circle d-inline-flex align-items-center justify-content-center ${
              modalState.type === "success"
                ? "bg-success bg-opacity-10 text-success"
                : "bg-danger bg-opacity-10 text-danger"
            }`}
            style={{ width: "64px", height: "64px" }}
          >
            {modalState.type === "success" ? (
              <Check size={32} />
            ) : (
              <X size={32} />
            )}
          </div>
          <h5 className="fw-bold mb-2">{modalState.title}</h5>
          <p className="text-muted mb-4">{modalState.message}</p>
          <Button
            variant={modalState.type === "success" ? "success" : "danger"}
            onClick={() => setShowModal(false)}
            className="px-4 py-2 rounded-pill"
          >
            Tutup
          </Button>
        </Modal.Body>
      </Modal>
    </Container>
  );
}
