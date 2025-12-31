import React, { useState, useEffect } from 'react';
import { Row, Col, Card, ProgressBar, Badge, ListGroup, Button, Alert } from 'react-bootstrap';
import { Award, BookOpen, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cek Status Paket Terakhir
  useEffect(() => {
    const fetchStatus = async () => {
      // Cari invoice terakhir milik siswa ini (berdasarkan nama dulu sementara karena user_id belum ada di tabel sebelumnya)
      // Idealnya: .eq('user_id', user.id)
      const { data } = await supabase
        .from('invoices')
        .select('*')
        .eq('student_name', user.name) 
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      setActiveInvoice(data);
      setLoading(false);
    };
    fetchStatus();
  }, [user]);

  if (loading) return <div>Loading dashboard...</div>;

  // --- LOGIC TAMPILAN BERDASARKAN STATUS ---
  
  // 1. Jika Belum Ada Paket Sama Sekali
  if (!activeInvoice) {
    return (
      <Alert variant="warning" className="d-flex align-items-center p-4">
        <AlertTriangle size={32} className="me-3" />
        <div>
            <h4 className="alert-heading">Paket Belum Aktif</h4>
            <p>Anda belum terdaftar di paket belajar manapun. Silakan pilih paket di halaman beranda.</p>
            <Button href="/" variant="warning" className="fw-bold">Pilih Paket Sekarang</Button>
        </div>
      </Alert>
    );
  }

  // 2. Jika Status UNPAID (Belum Bayar)
  if (activeInvoice.status === 'unpaid') {
    return (
      <Alert variant="danger" className="text-center p-5">
        <h4 className="fw-bold">Tagihan Belum Dibayar</h4>
        <p className="mb-4">Anda telah memilih paket <strong>{activeInvoice.package_name}</strong>, namun belum melakukan pembayaran.</p>
        <div className="h2 fw-bold mb-4">Rp {activeInvoice.total_amount.toLocaleString('id-ID')}</div>
        <p>Silakan transfer dan hubungi Admin untuk konfirmasi manual (karena fitur upload ulang belum dibuat di dashboard ini).</p>
        <Button variant="danger">Hubungi Admin via WA</Button>
      </Alert>
    );
  }

  // 3. Jika Status WAITING (Menunggu Konfirmasi)
  if (activeInvoice.status === 'waiting_confirmation') {
    return (
      <Alert variant="info" className="text-center p-5">
        <Clock size={48} className="mb-3 text-info"/>
        <h4 className="fw-bold">Menunggu Konfirmasi Admin</h4>
        <p>Bukti pembayaran telah dikirim. Paket <strong>{activeInvoice.package_name}</strong> akan aktif setelah Admin memverifikasi.</p>
        <Badge bg="info" className="p-2">Estimasi: 1x24 Jam</Badge>
      </Alert>
    );
  }

  // 4. Jika Status PAID (Aktif) -> Tampilkan Dashboard Normal
  return (
    <Row className="g-4">
      <Col xs={12}>
        <Card className="bg-success text-white shadow border-0 overflow-hidden">
          <Card.Body className="p-4 d-flex justify-content-between align-items-center">
            <div>
              <Badge bg="light" text="success" className="mb-2">Paket Aktif</Badge>
              <h2 className="fw-bold">{activeInvoice.package_name}</h2>
              <p className="mb-0 opacity-75">Selamat belajar, {user.name}!</p>
            </div>
            <Award size={64} className="opacity-50 text-white" />
          </Card.Body>
        </Card>
      </Col>
      
      {/* ... (Konten Jadwal & Materi seperti sebelumnya) ... */}
       <Col md={12}>
        <Alert variant="light" className="border">
            <h6 className="fw-bold"><BookOpen size={16}/> Materi Belajar</h6>
            <p className="mb-0">Materi akan muncul di sini sesuai jadwal.</p>
        </Alert>
       </Col>
    </Row>
  );
}