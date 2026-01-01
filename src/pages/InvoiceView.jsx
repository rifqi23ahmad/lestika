import React, { useEffect, useState } from 'react';
import { Container, Card, Badge, Button, Alert, Row, Col, Spinner } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { FileText, Clock, CheckCircle, AlertTriangle, Upload, ArrowRight } from 'lucide-react';

export default function InvoiceView() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(location.state?.invoice || null);
  const [loading, setLoading] = useState(!invoice); // Jika ada state, tidak loading
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);

  // Jika tidak ada data dari navigasi (misal refresh page), ambil dari DB
  useEffect(() => {
    if (!invoice && user) {
      fetchLatestInvoice();
    }
  }, [user]);

  const fetchLatestInvoice = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = data not found
      setInvoice(data);
    } catch (err) {
      console.error("Gagal ambil invoice:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!file || !invoice) return;
    setUploading(true);
    try {
      // 1. Upload File
      const fileName = `proof_${invoice.invoice_no}_${Date.now()}`;
      const { error: uploadError } = await supabase.storage
        .from('payments')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: publicUrlData } = supabase.storage.from('payments').getPublicUrl(fileName);
      const proofUrl = publicUrlData.publicUrl;

      // 3. Update Invoice Status
      const { error: updateError } = await supabase
        .from('invoices')
        .update({ 
          status: 'waiting_confirmation',
          payment_proof_url: proofUrl 
        })
        .eq('id', invoice.id);

      if (updateError) throw updateError;

      // 4. Refresh State
      setInvoice({ ...invoice, status: 'waiting_confirmation', payment_proof_url: proofUrl });
      alert("Bukti pembayaran berhasil dikirim! Admin akan segera memverifikasi.");

    } catch (err) {
      alert("Gagal upload: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  // --- RENDER HELPERS ---
  const getStatusBadge = (status) => {
    switch(status) {
      case 'paid': return <Badge bg="success" className="px-3 py-2"><CheckCircle size={16} className="me-1"/> Lunas</Badge>;
      case 'waiting_confirmation': return <Badge bg="warning" text="dark" className="px-3 py-2"><Clock size={16} className="me-1"/> Menunggu Konfirmasi</Badge>;
      default: return <Badge bg="danger" className="px-3 py-2"><AlertTriangle size={16} className="me-1"/> Belum Dibayar</Badge>;
    }
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="primary"/></div>;

  if (!invoice) {
    return (
      <Container className="py-5 text-center">
        <div className="py-5">
           <FileText size={64} className="text-muted mb-3"/>
           <h3>Belum Ada Tagihan</h3>
           <p className="text-muted">Anda belum mendaftar paket belajar apapun.</p>
           <Button onClick={() => navigate('/')} variant="primary">Pilih Paket Sekarang</Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Card className="shadow-sm border-0 mx-auto" style={{ maxWidth: '800px' }}>
        <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center">
          <div>
            <small className="text-muted d-block">Nomor Invoice</small>
            <span className="fw-bold font-monospace">{invoice.invoice_no}</span>
          </div>
          {getStatusBadge(invoice.status)}
        </Card.Header>
        
        <Card.Body className="p-4">
          {/* JIKA SUDAH LUNAS */}
          {invoice.status === 'paid' && (
             <Alert variant="success" className="mb-4 text-center">
                <h4 className="alert-heading fw-bold"><CheckCircle className="me-2"/>Pembayaran Berhasil!</h4>
                <p>Paket belajar Anda sudah aktif. Silakan cek jadwal belajar Anda.</p>
                <Button variant="outline-success" onClick={() => navigate('/jadwal')}>
                   Lihat Jadwal Belajar <ArrowRight size={16}/>
                </Button>
             </Alert>
          )}

          <Row className="mb-4">
             <Col md={6}>
                <h6 className="text-secondary mb-3">Ditagihkan Kepada:</h6>
                <h5 className="fw-bold">{invoice.student_name}</h5>
                <p className="text-muted mb-0">
                  {invoice.student_kelas} - {invoice.student_jenjang}<br/>
                  {invoice.email}<br/>
                  {invoice.student_whatsapp}
                </p>
             </Col>
             <Col md={6} className="text-md-end mt-3 mt-md-0">
                <h6 className="text-secondary mb-3">Detail Pembayaran:</h6>
                <div className="fs-5 fw-bold text-primary">Rp {Number(invoice.total_amount).toLocaleString('id-ID')}</div>
                <small className="text-muted">Jatuh Tempo: {new Date(invoice.created_at).toLocaleDateString()}</small>
             </Col>
          </Row>

          <div className="table-responsive mb-4">
            <table className="table table-bordered">
                <thead className="bg-light">
                    <tr>
                        <th>Deskripsi</th>
                        <th className="text-end">Jumlah</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <div className="fw-bold">{invoice.package_name}</div>
                            <small className="text-muted">Paket Bimbingan Belajar</small>
                        </td>
                        <td className="text-end">Rp {Number(invoice.package_price).toLocaleString('id-ID')}</td>
                    </tr>
                    <tr>
                        <td>Biaya Admin</td>
                        <td className="text-end">Rp {Number(invoice.admin_fee).toLocaleString('id-ID')}</td>
                    </tr>
                    <tr className="fw-bold table-light">
                        <td>Total</td>
                        <td className="text-end">Rp {Number(invoice.total_amount).toLocaleString('id-ID')}</td>
                    </tr>
                </tbody>
            </table>
          </div>

          {/* FORM UPLOAD BUKTI (Hanya jika belum lunas) */}
          {invoice.status !== 'paid' && (
            <div className="bg-light p-3 rounded">
                <h6 className="fw-bold mb-3"><Upload size={18} className="me-2"/> Konfirmasi Pembayaran</h6>
                
                {invoice.status === 'waiting_confirmation' ? (
                   <Alert variant="info" className="mb-0 small">
                      Bukti pembayaran sudah dikirim. Admin sedang memverifikasi data Anda. 
                      Anda bisa mengupload ulang jika bukti sebelumnya salah.
                   </Alert>
                ) : (
                   <p className="small text-muted mb-2">Silakan transfer ke rekening <strong>BCA 123 456 7890 (PT BIMBEL MAPA)</strong> dan upload bukti transfer di bawah ini.</p>
                )}

                <div className="d-flex gap-2 mt-3">
                   <input type="file" className="form-control" onChange={(e) => setFile(e.target.files[0])} accept="image/*" />
                   <Button 
                      variant="primary" 
                      onClick={handleUpload} 
                      disabled={uploading || !file}
                      style={{ minWidth: '120px' }}
                   >
                      {uploading ? <Spinner size="sm" animation="border"/> : 'Upload'}
                   </Button>
                </div>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}