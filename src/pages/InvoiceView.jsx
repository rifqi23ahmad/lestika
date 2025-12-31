import React from 'react';
import { Container, Card, Table, Button, Badge, Row, Col } from 'react-bootstrap';
import { BookOpen, Printer, ArrowLeft } from 'lucide-react';

export default function InvoiceView({ data, onHome }) {
  if (!data) return null;

  return (
    <Container className="py-5">
      <Card className="shadow-lg border-0 overflow-hidden mx-auto" style={{ maxWidth: '800px' }}>
        {/* Print only styling handled by Bootstrap's d-print utilities if needed, but simple window.print works well */}
        <div className="bg-dark text-white p-5 d-flex justify-content-between align-items-start">
          <div>
            <div className="d-flex align-items-center mb-3">
               <BookOpen className="text-primary me-2" size={32} />
               <span className="h3 fw-bold mb-0">MAPA</span>
            </div>
            <p className="text-white-50 mb-0 small">Jl. Pendidikan No. 123, Jakarta</p>
            <p className="text-white-50 small">admin@bimbelmapa.com</p>
          </div>
          <div className="text-end">
            <h2 className="text-uppercase fw-bold text-primary mb-2">Invoice</h2>
            <h5 className="mb-3">#{data.no}</h5>
            <small className="text-white-50">Jatuh Tempo:</small>
            <div className="fw-bold">{data.dueDate}</div>
          </div>
        </div>

        <Card.Body className="p-5">
          <div className="d-flex justify-content-between align-items-end mb-5 border-bottom pb-4">
            <div>
              <small className="text-muted text-uppercase fw-bold d-block mb-2">Tagihan Kepada:</small>
              <h4 className="fw-bold text-dark mb-1">{data.student.name}</h4>
              <p className="text-muted mb-0">Kelas {data.student.kelas} ({data.student.jenjang})</p>
            </div>
            <Badge bg="warning" text="dark" className="px-3 py-2 text-uppercase">Menunggu Pembayaran</Badge>
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
                <td className="py-3 fw-bold">{data.package.title}</td>
                <td className="text-end py-3">Rp {Number(data.package.price).toLocaleString('id-ID')}</td>
              </tr>
              <tr>
                <td className="py-3 fw-bold">Biaya Administrasi</td>
                <td className="text-end py-3">Rp {data.adminFee.toLocaleString('id-ID')}</td>
              </tr>
            </tbody>
            <tfoot className="border-top">
              <tr>
                <td className="pt-4 text-end fw-bold text-muted">Total Tagihan</td>
                <td className="pt-4 text-end h3 fw-bold text-primary">Rp {data.total.toLocaleString('id-ID')}</td>
              </tr>
            </tfoot>
          </Table>

          <div className="d-print-none d-flex justify-content-center gap-3 mt-5">
            <Button variant="outline-secondary" onClick={() => window.print()} className="d-flex align-items-center px-4">
              <Printer size={18} className="me-2"/> Cetak Invoice
            </Button>
            <Button variant="primary" onClick={onHome} className="d-flex align-items-center px-4">
              <ArrowLeft size={18} className="me-2"/> Kembali ke Beranda
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}