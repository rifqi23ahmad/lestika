import React, { useEffect } from 'react';
import { Container, Card, Table, Button, Badge, Row, Col } from 'react-bootstrap';
import { Printer, ArrowLeft, BookOpen } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function InvoiceView() {
  const location = useLocation();
  const navigate = useNavigate();
  const invoiceData = location.state?.invoice;

  useEffect(() => {
    if (!invoiceData) navigate('/');
  }, [invoiceData, navigate]);

  if (!invoiceData) return null;

  // --- HELPER FUNCTIONS ---
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  const formatRupiah = (num) => "Rp " + Number(num).toLocaleString('id-ID');

  const getStatusBadge = (status) => {
    switch(status) {
        case 'paid': return <Badge bg="success" className="px-3 py-2 rounded-0">LUNAS</Badge>;
        case 'waiting_confirmation': return <Badge bg="warning" text="dark" className="px-3 py-2 rounded-0">MENUNGGU</Badge>;
        default: return <Badge bg="danger" className="px-3 py-2 rounded-0">BELUM BAYAR</Badge>;
    }
  };

  return (
    <div className="bg-light min-vh-100 py-4">
      {/* CSS KHUSUS PRINT (FIX 1 HALAMAN) 
         - Menggunakan height: 296mm (bukan 297mm) untuk menghindari rounding error browser yang bikin halaman ke-2 muncul.
         - Flexbox Column: Memaksa Footer selalu di bawah tapi tetap dalam container.
      */}
      <style>{`
        @media print {
            @page { 
                size: A4; 
                margin: 0; 
            }
            body, html { 
                margin: 0; 
                padding: 0;
                height: 100%;
                background-color: white !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                overflow: hidden; /* Hapus scrollbar saat print */
            }
            /* Sembunyikan elemen UI website */
            .no-print, nav, footer, .btn { 
                display: none !important; 
            }
            /* Area Cetak Utama */
            .printable-area {
                position: relative;
                width: 210mm;
                height: 296mm; /* Kurangi 1mm dari A4 (297mm) sebagai toleransi */
                padding: 15mm 20mm; /* Padding aman */
                background: white;
                margin: 0;
                display: flex;
                flex-direction: column; /* Susun atas-bawah */
                justify-content: space-between; /* Header di atas, Footer di bawah */
            }
            /* Pastikan elemen terlihat */
            .printable-area * {
                visibility: visible;
            }
            /* Reset Layout Bootstrap untuk Print */
            .container, .card, .card-body {
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                border: none !important;
                box-shadow: none !important;
            }
        }

        /* TAMPILAN WEB (PREVIEW) */
        .printable-area {
            width: 210mm;
            min-height: 297mm;
            background: white;
            margin: auto;
            padding: 15mm 20mm;
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }
      `}</style>

      <Container>
        {/* TOMBOL NAVIGASI (Hanya di Layar) */}
        <div className="d-flex justify-content-center gap-3 mb-4 no-print">
            <Button variant="dark" onClick={() => navigate('/')} className="px-4">
                <ArrowLeft size={18} className="me-2"/> Kembali
            </Button>
            <Button variant="primary" onClick={() => window.print()} className="px-4 shadow">
                <Printer size={18} className="me-2"/> Cetak PDF (1 Halaman)
            </Button>
        </div>

        {/* KERTAS A4 */}
        <div className="printable-area shadow-sm">
            
            {/* --- BAGIAN ATAS (Header + Konten) --- */}
            <div>
                {/* KOP SURAT */}
                <div className="border-bottom border-2 border-dark pb-3 mb-4">
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-3">
                            <div className="bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                                <BookOpen size={28} />
                            </div>
                            <div>
                                <h4 className="fw-bold mb-0 text-uppercase" style={{ letterSpacing: '1px' }}>BIMBEL MAPA</h4>
                                <small className="text-muted d-block" style={{ lineHeight: '1.2' }}>Jl. Pendidikan No. 123, Jakarta</small>
                            </div>
                        </div>
                        <div className="text-end">
                            <h2 className="fw-bold text-primary mb-0">INVOICE</h2>
                            <small className="text-muted">#{invoiceData.invoice_no}</small>
                        </div>
                    </div>
                </div>

                {/* INFO UTAMA */}
                <Row className="mb-4 small">
                    <Col xs={6}>
                        <div className="text-uppercase text-secondary fw-bold mb-1" style={{ fontSize: '0.7rem' }}>Ditagihkan Kepada:</div>
                        <h5 className="fw-bold mb-1">{invoiceData.student_name}</h5>
                        <div className="text-muted">
                            Kelas {invoiceData.student_kelas} ({invoiceData.student_jenjang})<br/>
                            WA: {invoiceData.student_whatsapp || '-'}
                        </div>
                    </Col>
                    <Col xs={6} className="text-end">
                        <table className="ms-auto">
                            <tbody>
                                <tr>
                                    <td className="text-muted pe-3">Tanggal:</td>
                                    <td className="fw-bold">{formatDate(invoiceData.created_at)}</td>
                                </tr>
                                <tr>
                                    <td className="text-muted pe-3">Status:</td>
                                    <td>{getStatusBadge(invoiceData.status)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </Col>
                </Row>

                {/* TABEL ITEM */}
                <div className="mb-4">
                    <Table className="align-middle border-top border-dark mb-0" hover={false} size="sm">
                        <thead className="bg-light">
                            <tr>
                                <th className="py-2 ps-2 text-uppercase small fw-bold text-secondary">Layanan</th>
                                <th className="py-2 pe-2 text-end text-uppercase small fw-bold text-secondary">Harga</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="p-3 border-bottom">
                                    <div className="fw-bold text-dark">{invoiceData.package_name}</div>
                                    <div className="small text-muted">Paket Bimbingan Belajar (1 Bulan)</div>
                                </td>
                                <td className="p-3 text-end fw-bold align-top">
                                    {formatRupiah(invoiceData.package_price)}
                                </td>
                            </tr>
                            <tr>
                                <td className="p-3 border-bottom">
                                    <div className="fw-bold text-dark">Biaya Admin</div>
                                    <div className="small text-muted">Administrasi & Server</div>
                                </td>
                                <td className="p-3 text-end fw-bold align-top">
                                    {formatRupiah(invoiceData.admin_fee)}
                                </td>
                            </tr>
                        </tbody>
                    </Table>
                </div>

                {/* TOTAL SUMMARY */}
                <div className="row justify-content-end mb-4">
                    <div className="col-6">
                        <div className="bg-dark text-white p-3 d-flex justify-content-between align-items-center shadow-sm">
                            <span className="fw-bold small text-uppercase">Total Tagihan</span>
                            <span className="h4 mb-0 fw-bold">{formatRupiah(invoiceData.total_amount)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- BAGIAN BAWAH (Footer & TTD) --- */}
            {/* Flex-grow-0 memastikan ini nempel di bawah tapi tidak maksa page baru */}
            <div>
                <Row className="align-items-end">
                    <Col xs={7}>
                        <div className="border p-3 rounded bg-white small">
                            <div className="fw-bold text-primary mb-1">INFO PEMBAYARAN</div>
                            <div className="mb-1">Bank BCA: <strong>123 456 7890</strong></div>
                            <div>a.n. PT BIMBEL MAPA</div>
                            <div className="text-muted mt-2 fst-italic" style={{ fontSize: '0.7rem' }}>
                                *Harap transfer sesuai nominal hingga digit terakhir.
                            </div>
                        </div>
                    </Col>
                    <Col xs={5} className="text-center">
                        <div className="mb-4 d-inline-block">
                            <div className="small text-muted mb-4">Jakarta, {formatDate(new Date())}</div>
                            <div className="fw-bold border-bottom border-dark px-4 pb-1">Admin Keuangan</div>
                        </div>
                    </Col>
                </Row>
                
                {/* Copyright Line */}
                <div className="text-center mt-3 pt-2 border-top small text-muted" style={{ fontSize: '0.7rem' }}>
                    Dokumen ini sah dan diterbitkan otomatis oleh sistem. Terima kasih atas kepercayaan Anda.
                </div>
            </div>

        </div>
      </Container>
    </div>
  );
}