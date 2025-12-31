import React, { useState } from 'react';
import { Container, Card, Row, Col, Button, Form, Alert, Badge } from 'react-bootstrap';
import { FileText, CreditCard, Upload, CheckCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function RegisterView({ selectedPackage, onSuccess, onCancel }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [isUploaded, setIsUploaded] = useState(false);

  // Hitung total (Harga + Biaya Admin)
  const adminFee = 5000;
  const totalAmount = Number(selectedPackage.price) + adminFee;

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let proofUrl = null;

      // 1. Upload Bukti jika ada file
      if (file) {
        const fileName = `pay_${user.id}_${Date.now()}`;
        const { data, error: uploadError } = await supabase.storage
            .from('payments')
            .upload(fileName, file);
        
        if (uploadError) throw uploadError;
        
        // Dapatkan Public URL
        const { data: publicUrlData } = supabase.storage.from('payments').getPublicUrl(fileName);
        proofUrl = publicUrlData.publicUrl;
      }

      // 2. Simpan Invoice ke Database
      // Status: jika ada bukti -> waiting_confirmation, jika tidak -> unpaid
      const status = proofUrl ? 'waiting_confirmation' : 'unpaid';

      const invoicePayload = {
        invoice_no: `INV-${Date.now()}`,
        student_name: user.name,
        student_jenjang: user.jenjang || '-', // Fallback jika data lama belum update
        student_kelas: user.kelas || '-',
        student_whatsapp: user.whatsapp || '-',
        package_id: selectedPackage.id,
        package_name: selectedPackage.title,
        package_price: selectedPackage.price,
        admin_fee: adminFee,
        total_amount: totalAmount,
        status: status,
        payment_proof_url: proofUrl,
        // Kita juga perlu simpan user_id pemilik invoice agar relasi jelas (tambahkan kolom user_id di tabel invoices jika belum ada, atau gunakan student_name sebagai referensi sementara - IDEALNYA ADA user_id)
      };
      
      // Note: Di tutorial sebelumnya tabel invoices belum ada user_id. 
      // Kita pakai insert biasa, tapi sebaiknya tambahkan kolom user_id di SQL.
      // Untuk sekarang kita anggap insert berhasil.
      
      const { data, error } = await supabase.from('invoices').insert([invoicePayload]).select();
      if (error) throw error;

      setIsUploaded(true);
      setTimeout(() => {
          onSuccess(data[0]); // Kembali ke Home/Dashboard
      }, 2000);

    } catch (error) {
      alert("Gagal memproses pembayaran: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (isUploaded) {
    return (
      <Container className="py-5 text-center">
        <Card className="shadow mx-auto p-5" style={{maxWidth: '500px'}}>
            <div className="mb-3 text-success"><CheckCircle size={64}/></div>
            <h3>Pembayaran Berhasil Dikirim!</h3>
            <p className="text-muted">Admin kami akan memverifikasi pembayaran Anda dalam waktu 1x24 jam.</p>
            <p>Status: <Badge bg="warning" text="dark">Menunggu Konfirmasi</Badge></p>
        </Card>
      </Container>
    );
  }

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
            {/* Bagian KIRI: Rincian Tagihan */}
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

            {/* Bagian KANAN: Metode Pembayaran */}
            <Col md={5} className="ps-md-4 mt-4 mt-md-0">
              <h5 className="fw-bold mb-3 text-secondary">Transfer Bank</h5>
              <Card className="bg-light border-0 mb-3">
                <Card.Body>
                    <div className="d-flex align-items-center mb-2">
                        <CreditCard className="me-2 text-primary"/> <strong>BCA (Bank Central Asia)</strong>
                    </div>
                    <div className="h4 fw-bold mb-0 text-dark">123 456 7890</div>
                    <small>a.n. PT BIMBEL MAPA INDONESIA</small>
                </Card.Body>
              </Card>
              <Card className="bg-light border-0 mb-4">
                <Card.Body>
                    <div className="d-flex align-items-center mb-2">
                        <CreditCard className="me-2 text-primary"/> <strong>MANDIRI</strong>
                    </div>
                    <div className="h4 fw-bold mb-0 text-dark">000 111 222 333</div>
                    <small>a.n. PT BIMBEL MAPA INDONESIA</small>
                </Card.Body>
              </Card>

              <Form onSubmit={handlePayment}>
                <Form.Group className="mb-3">
                    <Form.Label className="fw-bold small">Upload Bukti Transfer</Form.Label>
                    <Form.Control type="file" onChange={(e) => setFile(e.target.files[0])} />
                    <Form.Text className="text-muted small">
                        *Jika belum bayar sekarang, Anda bisa pilih paket dulu. Status akan menjadi <strong>Belum Dibayar</strong>.
                    </Form.Text>
                </Form.Group>

                <div className="d-grid gap-2">
                    <Button type="submit" variant="success" size="lg" disabled={loading}>
                        {loading ? 'Memproses...' : (file ? 'Kirim Bukti Pembayaran' : 'Simpan & Bayar Nanti')}
                    </Button>
                    <Button variant="outline-secondary" onClick={onCancel}>Batal</Button>
                </div>
              </Form>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
}