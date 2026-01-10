import React, { forwardRef } from "react";
import { Row, Col, Table, Badge, Alert } from "react-bootstrap";
import { MapPin, Globe, Clock } from "lucide-react";
import { formatRupiah } from "../../utils/format";
import { APP_CONFIG } from "../../config/constants";

const InvoicePaper = forwardRef(({ invoice, children }, ref) => {
  if (!invoice) return null;

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

  const packagePrice = invoice.package_price || 0;
  const adminFee = invoice.admin_fee || 0;
  const totalAmount = invoice.total_amount || 0;

  return (
    <div
      ref={ref}
      className="bg-white shadow-sm border position-relative"
      style={{
        width: "800px",
        minWidth: "800px",
        minHeight: "1123px", // Ukuran proporsional A4
        padding: "48px",
        backgroundColor: "#ffffff",
      }}
    >
      {/* HEADER SECTION */}
      <div className="d-flex flex-row justify-content-between align-items-start border-bottom pb-4 mb-4 gap-4">
        <div className="d-flex flex-column">
          <div className="d-flex align-items-center mb-3">
            {/* CRITICAL FIX: crossOrigin="anonymous" 
                Diperlukan agar html2canvas bisa merender gambar lokal/eksternal tanpa error CORS 
            */}
            <img
              src="/logo.png"
              alt="Logo"
              style={{ height: "40px", width: "auto" }}
              className="me-3"
              crossOrigin="anonymous" 
            />
            <div>
              <h4
                className="fw-bold mb-0 text-primary"
                style={{ letterSpacing: "-0.5px" }}
              >
                MAPA
              </h4>
            </div>
          </div>
          <div className="text-muted small">
            <div className="d-flex align-items-center mb-1">
              <Globe size={14} className="me-2" /> www.bimbelmapa.my.id
            </div>
            <div className="d-flex align-items-center">
              <MapPin size={14} className="me-2" /> Jl. Karya Damai, Buaran Indah, Kota Tangerang 15119
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

      {/* CUSTOMER INFO */}
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

      {/* ITEMS TABLE */}
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
              <div className="fw-bold text-dark">{invoice.package_name}</div>
              <div className="text-muted small">Paket belajar reguler</div>
            </td>
            <td className="text-center py-3">1 Bulan</td>
            <td className="text-center py-3">1</td>
            <td className="text-end pe-3 py-3 fw-bold">
              {formatRupiah(packagePrice)}
            </td>
          </tr>
        </tbody>
      </Table>

      {/* TOTAL SUMMARY */}
      <Row className="justify-content-end mb-5">
        <Col md={5}>
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Harga Paket</span>
            <span className="fw-bold">{formatRupiah(packagePrice)}</span>
          </div>

          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Biaya Admin</span>
            <span className="fw-bold">{formatRupiah(adminFee)}</span>
          </div>

          <div className="d-flex justify-content-between align-items-center pt-3 border-top mt-2">
            <span className="fw-bold fs-5 text-dark">Total Tagihan</span>
            <span className="fw-bold fs-4 text-primary">
              {formatRupiah(totalAmount)}
            </span>
          </div>
        </Col>
      </Row>

      {/* PAYMENT METHODS */}
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
          <Col md={6} className="border-start ps-4">
            <p className="small text-muted mb-1">Instruksi:</p>
            <ul className="small text-muted ps-3 mb-0">
              <li>Pastikan nominal transfer sesuai total tagihan.</li>
              <li>Simpan bukti transfer Anda.</li>
              <li>Upload bukti pembayaran di bawah ini.</li>
            </ul>
          </Col>
        </Row>
      </div>

      {/* FOOTER & DISCLAIMER */}
      <div className="mt-auto pt-5 text-center">
        <p className="text-muted fst-italic small mb-1">
          "Terima kasih telah mempercayakan pendidikan Anda bersama MAPA."
        </p>
        <div className="border-top w-50 mx-auto my-3"></div>
        <p className="text-muted opacity-50 small mb-0">
          Dokumen ini diterbitkan secara otomatis oleh sistem komputer.
          <br />
          Sah dan berlaku tanpa tanda tangan basah.
        </p>
      </div>

      {/* ALERT & UPLOAD AREA (Will be hidden/ignored by html2canvas if configured) */}
      <div className="mt-4 upload-section" data-html2canvas-ignore>
        {invoice.status === APP_CONFIG.INVOICE.STATUS.WAITING && (
          <Alert
            variant="info"
            className="d-flex align-items-center border-0 shadow-sm mt-5"
          >
            <Clock className="me-3 flex-shrink-0" size={24} />
            <div>
              <h6 className="alert-heading fw-bold mb-1">
                Pembayaran Sedang Diverifikasi
              </h6>
              <p className="mb-0 small">
                Admin akan memverifikasi dalam waktu Max 1x24 jam.
              </p>
            </div>
          </Alert>
        )}

        {children}
      </div>
    </div>
  );
});

InvoicePaper.displayName = "InvoicePaper";
export default InvoicePaper;