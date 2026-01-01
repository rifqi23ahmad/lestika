import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Button, Form, Alert } from 'react-bootstrap';
import { FileText, CreditCard } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { invoiceService } from '../services/invoiceService'; // Import Service

export default function RegisterView() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // AMBIL DATA PAKET DARI STATE ROUTER
  const selectedPackage = location.state?.pkg;

  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);

  // Redirect jika user refresh halaman ini (data paket hilang)
  useEffect(() => {
    if (!selectedPackage) {
      navigate('/');
    }
  }, [selectedPackage, navigate]);

  if (!selectedPackage || !user) return null;

  // Hitung total (Disamakan dengan invoiceService: Rp 15.000)
  const adminFee = 15000;
  const totalAmount = Number(selectedPackage.price) + adminFee;

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let proofUrl = null;

      // 1. Upload Bukti (Jika ada)
      if (file) {
        const fileName = `pay_${user.id}_${Date.now()}`;
        const { error: uploadError } = await supabase.storage
            .from('payments')
            .upload(fileName, file);
        
        if (uploadError) throw uploadError;
        
        const { data: publicUrlData } = supabase.storage.from('payments').getPublicUrl(fileName);
        proofUrl = publicUrlData.publicUrl;
      }

      // 2. Buat Invoice Menggunakan Service
      // Parameter: (registrationData, selectedPackage, userId, userEmail)
      const newInvoice = await invoiceService.create(
        user,           // registrationData (berisi name, kelas, jenjang, dll)
        selectedPackage, 
        user.id, 
        user.email
      );

      // 3. Update Invoice jika ada Bukti Bayar
      // (Karena invoiceService defaultnya status 'unpaid' dan tanpa bukti)
      if (proofUrl && newInvoice) {
        const { error: updateError } = await supabase
          .from('invoices')
          .update({
            status: 'waiting_confirmation',
            payment_proof_url: proofUrl
          })
          .eq('id', newInvoice.id);

        if (updateError) throw updateError;
        
        // Update object lokal untuk dikirim ke halaman selanjutnya
        newInvoice.status = 'waiting_confirmation';
        newInvoice.payment_proof_url = proofUrl;
      }

      alert("Invoice berhasil dibuat!");
      
      // 4. Pindah ke halaman Invoice
      navigate('/invoice', { state: { invoice: newInvoice } });

    } catch (error) {
      console.error(error);
      alert("Gagal memproses: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Card className="shadow-lg border-0 overflow-hidden mx-auto" style={{ maxWidth: '900px' }}>
        <div className="bg-primary text-white p-4">
          <h3 className="fw-bold mb-0 d-flex align-items-center">
             <FileText className="me-2"/> Rincian Invoice & Pembayaran
          </h3>
        </div>
        
        <Card.Body className="p-4">
          <Row>
            {/* Bagian KIRI */}
            <Col md={7} className="border-end pe-md-5">
              <h5 className="fw-bold mb-4 text-secondary">Rincian Tagihan</h5>
              <div className="d-flex justify-content-between mb-2">
                <span>Paket Belajar</span>
                <span className="fw-bold">{selectedPackage.title}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Harga Paket</span>
                <span>Rp {Number(selectedPackage.price).toLocaleString('id-ID')}</span>
              </div>
              <div className="d-flex justify-content-between mb-2 text-muted">
                <span>Biaya Admin</span>
                <span>Rp {adminFee.toLocaleString('id-ID')}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-4">
                <span className="h5 fw-bold">Total Pembayaran</span>
                <span className="h4 fw-bold text-primary">Rp {totalAmount.toLocaleString('id-ID')}</span>
              </div>

              <Alert variant="info" className="small">
                <strong>Data Siswa:</strong> <br/>
                {user.name} ({user.kelas} - {user.jenjang}) <br/>
                WA: {user.whatsapp}
              </Alert>
            </Col>

            {/* Bagian KANAN */}
            <Col md={5} className="ps-md-4 mt-4 mt-md-0">
              <h5 className="fw-bold mb-3 text-secondary">Transfer Bank</h5>
              <Card className="bg-light border-0 mb-3">
                <Card.Body>
                    <div className="d-flex align-items-center mb-2">
                        <CreditCard className="me-2 text-primary"/> <strong>BCA</strong>
                    </div>
                    <div className="h4 fw-bold mb-0 text-dark">123 456 7890</div>
                    <small>a.n. PT BIMBEL MAPA</small>
                </Card.Body>
              </Card>

              <Form onSubmit={handlePayment}>
                <Form.Group className="mb-3">
                    <Form.Label className="fw-bold small">Upload Bukti Transfer</Form.Label>
                    <Form.Control type="file" onChange={(e) => setFile(e.target.files[0])} />
                    <Form.Text className="text-muted">
                      Opsional. Bisa diupload nanti di menu Invoice.
                    </Form.Text>
                </Form.Group>

                <div className="d-grid gap-2">
                    <Button type="submit" variant="success" size="lg" disabled={loading}>
                        {loading ? 'Memproses...' : (file ? 'Kirim Bukti Pembayaran' : 'Bayar Nanti')}
                    </Button>
                    <Button variant="outline-secondary" onClick={() => navigate('/')}>Batal</Button>
                </div>
              </Form>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
}