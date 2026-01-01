import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  Badge,
  Button,
  Form,
  Alert,
  Row,
  Col,
  Modal,
  Table,
  Spinner,
} from "react-bootstrap";
import {
  Download,
  Upload,
  CheckCircle,
  Clock,
  AlertCircle,
  Check,
  X,
  ArrowLeft,
  FileText,
  Search,
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { APP_CONFIG } from "../config/constants";
import { invoiceService } from "../services/invoiceService";
import { useAuth } from "../context/AuthContext";

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
          <Badge bg="success" className="p-2">
            <CheckCircle size={14} className="me-1" /> LUNAS
          </Badge>
        );
      case APP_CONFIG.INVOICE.STATUS.WAITING:
        return (
          <Badge bg="warning" text="dark" className="p-2">
            <Clock size={14} className="me-1" /> VERIFIKASI
          </Badge>
        );
      default:
        return (
          <Badge bg="danger" className="p-2">
            <AlertCircle size={14} className="me-1" /> BELUM DIBAYAR
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
      fetchHistory(); // Refresh list di background
      showAlertModal(
        "Upload Berhasil!",
        "Bukti pembayaran telah dikirim dan sedang diverifikasi.",
        "success"
      );
      setFile(null); // Reset input file
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
      const canvas = await html2canvas(element, { scale: 2 });
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
    <Card className="shadow-sm border-0">
      <Card.Header className="bg-white py-3">
        <h5 className="mb-0 fw-bold d-flex align-items-center">
          <FileText className="me-2 text-primary" /> Riwayat Transaksi & Tagihan
        </h5>
      </Card.Header>
      <Card.Body className="p-0">
        {fetching ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <Search size={48} className="mb-3 opacity-50" />
            <p>Belum ada riwayat transaksi.</p>
            <Button
              variant="outline-primary"
              onClick={() => navigate("/#pricing")}
            >
              Beli Paket Belajar
            </Button>
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">No. Invoice</th>
                  <th>Paket</th>
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
                    <td>{item.package_name}</td>
                    <td className="small text-muted">
                      {new Date(item.created_at).toLocaleDateString("id-ID")}
                    </td>
                    <td className="fw-bold">
                      Rp {item.total_amount.toLocaleString("id-ID")}
                    </td>
                    <td>{getStatusBadge(item.status)}</td>
                    <td className="text-end pe-4">
                      <Button
                        size="sm"
                        variant={
                          item.status === "unpaid"
                            ? "primary"
                            : "outline-secondary"
                        }
                        className="rounded-pill px-3"
                      >
                        {item.status === "unpaid" ? "Bayar" : "Lihat"}
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
      <div className="mb-3">
        <Button
          variant="link"
          className="text-decoration-none p-0 d-flex align-items-center text-muted"
          onClick={() => {
            setViewMode("list");
            fetchHistory();
          }}
        >
          <ArrowLeft size={18} className="me-1" /> Kembali ke Riwayat
        </Button>
      </div>

      <Card
        className="shadow-sm border-0 mx-auto"
        style={{ maxWidth: "800px" }}
        ref={printRef}
      >
        <Card.Header className="bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
          <h5 className="fw-bold mb-0 text-primary">
            Invoice #{invoice.invoice_no}
          </h5>
          {getStatusBadge(invoice.status)}
        </Card.Header>
        <Card.Body className="p-4">
          {/* Detail Siswa & Harga */}
          <Row className="mb-4">
            <Col md={6}>
              <small className="text-muted d-block text-uppercase fw-bold ls-1">
                Ditagihkan Ke:
              </small>
              <h5 className="fw-bold mt-1">{invoice.student_name}</h5>
              <p className="mb-0 text-muted small">
                {invoice.student_kelas} - {invoice.student_jenjang}
                <br />
                WA: {invoice.student_whatsapp}
              </p>
            </Col>
            <Col md={6} className="text-md-end mt-3 mt-md-0">
              <small className="text-muted d-block text-uppercase fw-bold ls-1">
                Total Tagihan:
              </small>
              <h3 className="fw-bold text-dark mt-1">
                Rp {invoice.total_amount.toLocaleString("id-ID")}
              </h3>
              <p className="small text-muted">Paket: {invoice.package_name}</p>
            </Col>
          </Row>

          {/* Form Upload jika UNPAID */}
          {!downloading &&
            invoice.status === APP_CONFIG.INVOICE.STATUS.UNPAID && (
              <div
                className="bg-light p-3 rounded border border-dashed mb-3"
                data-html2canvas-ignore
              >
                <h6 className="fw-bold mb-2 d-flex align-items-center">
                  <Upload size={18} className="me-2 text-primary" /> Konfirmasi
                  Pembayaran
                </h6>
                <p className="small text-muted mb-2">
                  Silakan transfer ke rekening BCA 12345678 a.n Lestika, lalu
                  upload buktinya di sini.
                </p>
                <Form onSubmit={handleUpload} className="d-flex gap-2">
                  <Form.Control
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    required
                  />
                  <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? "Mengirim..." : "Kirim Bukti"}
                  </Button>
                </Form>
              </div>
            )}

          {/* Info jika WAITING */}
          {!downloading &&
            invoice.status === APP_CONFIG.INVOICE.STATUS.WAITING && (
              <Alert variant="info" className="d-flex align-items-center">
                <Clock className="me-2" />
                <div>
                  <strong>Bukti pembayaran diterima.</strong> <br />
                  Admin sedang memverifikasi. Mohon tunggu 1x24 jam.
                </div>
              </Alert>
            )}

          {/* Footer Card */}
          <div
            className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top"
            data-html2canvas-ignore
          >
            <Button
              variant="outline-primary"
              onClick={handleDownloadPDF}
              disabled={downloading}
            >
              <Download size={16} className="me-1" />
              {downloading ? "Sedang Download..." : "Download PDF"}
            </Button>
          </div>
        </Card.Body>
      </Card>
    </>
  );

  return (
    <Container className="py-5">
      {viewMode === "list" ? renderList() : renderDetail()}

      {/* Modal Notifikasi */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Body className="text-center p-4">
          <div
            className={`mx-auto mb-3 p-3 rounded-full w-fit ${
              modalState.type === "success"
                ? "bg-green-100 text-green-600"
                : "bg-red-100 text-red-600"
            }`}
          >
            {modalState.type === "success" ? (
              <Check size={32} />
            ) : (
              <X size={32} />
            )}
          </div>
          <h5 className="fw-bold mb-2">{modalState.title}</h5>
          <p className="text-muted">{modalState.message}</p>
          <Button
            variant={modalState.type === "success" ? "success" : "danger"}
            onClick={() => setShowModal(false)}
            className="mt-2 px-4"
          >
            Oke
          </Button>
        </Modal.Body>
      </Modal>
    </Container>
  );
}
