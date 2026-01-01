import React, { useState } from "react";
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
} from "react-bootstrap";
import {
  Download,
  Upload,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { APP_CONFIG } from "../config/constants";
import { invoiceService } from "../services/invoiceService";
import { useAuth } from "../context/AuthContext";

export default function InvoiceView() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(location.state?.invoice);

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!invoice) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="warning">
          Data Invoice tidak ditemukan. Silakan kembali ke dashboard.
        </Alert>
        <Button onClick={() => navigate("/")}>Ke Dashboard</Button>
      </Container>
    );
  }

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
            <Clock size={14} className="me-1" /> MENUNGGU KONFIRMASI
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

      setInvoice(updatedInvoice); // Update UI
      alert("Bukti pembayaran berhasil diupload!");
    } catch (error) {
      alert("Gagal upload: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Card
        className="shadow-sm border-0 mx-auto"
        style={{ maxWidth: "800px" }}
      >
        <Card.Header className="bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
          <h5 className="fw-bold mb-0 text-primary">
            Invoice #{invoice.invoice_no}
          </h5>
          {getStatusBadge(invoice.status)}
        </Card.Header>

        <Card.Body className="p-4">
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

          {/* Area Upload Bukti (Hanya muncul jika BELUM LUNAS / BELUM UPLOAD) */}
          {invoice.status === APP_CONFIG.INVOICE.STATUS.UNPAID && (
            <div className="bg-light p-3 rounded border border-dashed mb-3">
              <h6 className="fw-bold mb-2 d-flex align-items-center">
                <Upload size={18} className="me-2 text-primary" /> Upload Bukti
                Pembayaran
              </h6>
              <Form onSubmit={handleUpload} className="d-flex gap-2">
                <Form.Control
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  required
                />
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? "Mengirim..." : "Kirim"}
                </Button>
              </Form>
            </div>
          )}

          {/* Tampilan jika sudah upload tapi belum dikonfirmasi admin */}
          {invoice.status === APP_CONFIG.INVOICE.STATUS.WAITING && (
            <Alert variant="info" className="d-flex align-items-center">
              <Clock className="me-2" />
              <div>
                <strong>Bukti pembayaran telah diterima.</strong> <br />
                Admin kami sedang memverifikasi pembayaran Anda. Mohon tunggu
                1x24 jam.
              </div>
            </Alert>
          )}

          {/* Tombol Aksi */}
          <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
            <Button variant="outline-secondary" onClick={() => navigate("/")}>
              Kembali ke Home
            </Button>
            <Button variant="outline-primary">
              <Download size={16} className="me-1" /> Download PDF
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}
