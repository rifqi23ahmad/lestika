import React, { useState } from 'react';
import { Container, Card, Form, Row, Col, Button, Alert } from 'react-bootstrap';
import { FileText, ArrowLeft } from 'lucide-react';
import { invoiceService } from '../services/invoiceService';

export default function RegisterView({ selectedPackage, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', jenjang: 'SD', kelas: '', whatsapp: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newInvoice = await invoiceService.create(formData, selectedPackage);
      onSuccess(newInvoice);
    } catch (error) {
      alert("Terjadi kesalahan saat pendaftaran.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <Container className="py-5">
      <Card className="shadow-lg border-0 overflow-hidden mx-auto" style={{ maxWidth: '700px' }}>
        <div className="bg-primary text-white p-4 d-flex justify-content-between align-items-center">
          <div>
            <h3 className="fw-bold mb-1">Formulir Pendaftaran</h3>
            <p className="mb-0 text-white-50">Silakan lengkapi data siswa</p>
          </div>
          <FileText size={40} className="opacity-50" />
        </div>
        
        <Card.Body className="p-4 p-md-5">
          {/* Info Paket */}
          <Alert variant="info" className="d-flex justify-content-between align-items-center">
            <div>
              <small className="text-muted text-uppercase fw-bold">Paket Dipilih</small>
              <h5 className="fw-bold mb-0 text-dark">{selectedPackage?.title}</h5>
            </div>
            <h5 className="fw-bold text-primary mb-0">{selectedPackage?.price_display || selectedPackage?.price}</h5>
          </Alert>

          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Nama Lengkap Siswa</Form.Label>
                  <Form.Control type="text" name="name" onChange={handleChange} required placeholder="Masukkan nama lengkap" className="py-2" />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Jenjang</Form.Label>
                  <Form.Select name="jenjang" onChange={handleChange} className="py-2">
                    <option value="SD">SD</option>
                    <option value="SMP">SMP</option>
                    <option value="SMA">SMA</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Kelas</Form.Label>
                  <Form.Control type="text" name="kelas" onChange={handleChange} required placeholder="Contoh: 12 IPA" className="py-2" />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label>Nomor WhatsApp</Form.Label>
                  <Form.Control type="number" name="whatsapp" onChange={handleChange} required placeholder="0812xxxx" className="py-2" />
                </Form.Group>
              </Col>

              <Col md={12} className="mt-4 d-flex justify-content-between">
                <Button variant="light" onClick={onCancel} className="d-flex align-items-center">
                  <ArrowLeft size={16} className="me-2"/> Batal
                </Button>
                <Button type="submit" variant="primary" disabled={loading} className="fw-bold px-4">
                  {loading ? 'Memproses...' : 'Daftar Sekarang'}
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}