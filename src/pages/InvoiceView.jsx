import React, { useEffect } from 'react';
import { Container, Card, Table, Button, Badge } from 'react-bootstrap';
import { BookOpen, Printer, ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function InvoiceView() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Ambil data invoice dari state navigasi
  const invoiceData = location.state?.invoice;

  useEffect(() => {
    // Jika user langsung akses /invoice tanpa data, kembalikan ke home
    if (!invoiceData) {
      navigate('/');
    }
  }, [invoiceData, navigate]);

  if (!invoiceData) return null;

  // Helper untuk format tanggal
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  return (
    <Container className="py-5">
      <Card className="shadow-lg border-0 overflow-hidden mx-auto" style={{ maxWidth: '800px' }}>
        <div className="bg-dark text-white p-5 d-flex justify-content-between align-items-start">
          <div>
            <div className="d-flex align-items-center mb-3">
               <BookOpen className="text-primary me-2" size={32} />
               <span className="h3 fw-bold mb-0">MAPA</span>
            </div>
            <p className="text-white-50 mb-0 small">Jl. Pendidikan No. 123, Jakarta</p>
          </div>
          <div className="text-end">
            <h2 className="text-uppercase fw-bold text-primary mb-2">Invoice</h2>
            <h5 className="mb-3">#{invoiceData.invoice_no}</h5>
            <small className="text-white-50">Tanggal:</small>
            <div className="fw-bold">{formatDate(invoiceData.created_at)}</div>
          </div>
        </div>

        <Card.Body className="p-5">
          <div className="d-flex justify-content-between align-items-end mb-5 border-bottom pb-4">
            <div>
              <small className="text-muted text-uppercase fw-bold d-block mb-2">Tagihan Kepada:</small>
              <h4 className="fw-bold text-dark mb-1">{invoiceData.student_name}</h4>
              <p className="text-muted mb-0">Kelas {invoiceData.student_kelas} ({invoiceData.student_jenjang})</p>
            </div>
            <Badge 
                bg={invoiceData.status === 'paid' ? 'success' : invoiceData.status === 'waiting_confirmation' ? 'warning' : 'danger'} 
                className="px-3 py-2 text-uppercase"
            >
                {invoiceData.status === 'paid' ? 'LUNAS' : invoiceData.status === 'waiting_confirmation' ? 'Menunggu Konfirmasi' : 'Belum Dibayar'}
            </Badge>
          </div>

          <Table borderless className="mb-4">
            <thead className="border-bottom text-muted text-uppercase small">
              <tr>
                <th className="py-3">Deskripsi</th>
                <th className="text-end py-3">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-3 fw-bold">{invoiceData.package_name}</td>
                <td className="text-end py-3">Rp {Number(invoiceData.package_price).toLocaleString('id-ID')}</td>
              </tr>
              <tr>
                <td className="py-3 fw-bold">Biaya Administrasi</td>
                <td className="text-end py-3">Rp {Number(invoiceData.admin_fee).toLocaleString('id-ID')}</td>
              </tr>
            </tbody>
            <tfoot className="border-top">
              <tr>
                <td className="pt-4 text-end fw-bold text-muted">Total Tagihan</td>
                <td className="pt-4 text-end h3 fw-bold text-primary">Rp {Number(invoiceData.total_amount).toLocaleString('id-ID')}</td>
              </tr>
            </tfoot>
          </Table>

          <div className="d-print-none d-flex justify-content-center gap-3 mt-5">
            <Button variant="outline-secondary" onClick={() => window.print()} className="d-flex align-items-center px-4">
              <Printer size={18} className="me-2"/> Cetak Invoice
            </Button>
            <Button variant="primary" onClick={() => navigate('/')} className="d-flex align-items-center px-4">
              <ArrowLeft size={18} className="me-2"/> Kembali ke Beranda
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}