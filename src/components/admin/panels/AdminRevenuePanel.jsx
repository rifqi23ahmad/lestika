import React, { useState, useEffect } from "react";
import { Card, Row, Col, Form, Table, Badge, Spinner, Alert } from "react-bootstrap";
import { DollarSign, Calendar, TrendingUp, Download } from "lucide-react";
import { invoiceService } from "../../../services/invoiceService";
import { formatRupiah } from "../../../utils/format";
import { APP_CONFIG } from "../../../config/constants";

export default function AdminRevenuePanel() {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await invoiceService.getAll();
      setInvoices(data || []);
    } catch (error) {
      console.error("Gagal load revenue:", error);
    } finally {
      setLoading(false);
    }
  };

  
  const filteredInvoices = invoices.filter((inv) => {
    const invDate = new Date(inv.created_at);
    const isPaid = inv.status === APP_CONFIG.INVOICE.STATUS.PAID;
    const isSameMonth = invDate.getMonth() === parseInt(selectedMonth);
    const isSameYear = invDate.getFullYear() === parseInt(selectedYear);
    
    return isPaid && isSameMonth && isSameYear;
  });

  const totalRevenue = filteredInvoices.reduce((acc, curr) => acc + (curr.total_amount || 0), 0);

  const years = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i);

  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>;

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold text-dark mb-0">Laporan Pendapatan</h4>
      </div>

      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-3">
          <Row className="g-3 align-items-end">
            <Col md={3}>
              <Form.Label className="small fw-bold text-muted">Pilih Bulan</Form.Label>
              <Form.Select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="shadow-none border-secondary-subtle"
              >
                {months.map((m, idx) => (
                  <option key={idx} value={idx}>{m}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Label className="small fw-bold text-muted">Pilih Tahun</Form.Label>
              <Form.Select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(e.target.value)}
                className="shadow-none border-secondary-subtle"
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Row className="mb-4">
        <Col md={12}>
          <Card className="border-0 shadow-sm overflow-hidden text-white" style={{ background: "linear-gradient(135deg, #198754 0%, #0f5132 100%)" }}>
            <Card.Body className="p-4 d-flex justify-content-between align-items-center position-relative">
              <div>
                <h6 className="opacity-75 mb-1">Total Pendapatan</h6>
                <div className="small opacity-75 mb-2">
                  Periode: {months[selectedMonth]} {selectedYear}
                </div>
                <h1 className="display-5 fw-bold mb-0">{formatRupiah(totalRevenue)}</h1>
              </div>
              <div className="bg-white bg-opacity-25 p-3 rounded-circle text-white">
                <TrendingUp size={48} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white py-3 border-bottom">
          <h6 className="fw-bold mb-0 text-dark">Rincian Transaksi Masuk</h6>
        </Card.Header>
        <Card.Body className="p-0">
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-5">
              <div className="text-muted opacity-50 mb-2"><DollarSign size={48} /></div>
              <p className="text-muted">Tidak ada pendapatan tercatat pada periode ini.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0 align-middle">
                <thead className="bg-light text-secondary small text-uppercase">
                  <tr>
                    <th className="ps-4">No. Invoice</th>
                    <th>Tanggal Bayar (Upload)</th>
                    <th>Siswa</th>
                    <th>Paket</th>
                    <th className="text-end pe-4">Nominal</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((item) => (
                    <tr key={item.id}>
                      <td className="ps-4 fw-bold text-primary">#{item.invoice_no}</td>
                      <td className="small text-muted">
                        <div className="d-flex align-items-center">
                          <Calendar size={14} className="me-2" />
                          {new Date(item.created_at).toLocaleDateString("id-ID")}
                        </div>
                      </td>
                      <td>
                        <div className="fw-bold text-dark">{item.student_name}</div>
                        <div className="small text-muted">{item.student_kelas}</div>
                      </td>
                      <td><Badge bg="light" text="dark" className="border">{item.package_name}</Badge></td>
                      <td className="text-end pe-4 fw-bold text-success">
                        +{formatRupiah(item.total_amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
        <Card.Footer className="bg-white border-top py-3 text-end">
           <small className="text-muted">Menampilkan {filteredInvoices.length} transaksi</small>
        </Card.Footer>
      </Card>
    </div>
  );
}