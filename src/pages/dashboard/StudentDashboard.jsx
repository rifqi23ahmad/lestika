import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Badge, Button, Alert } from 'react-bootstrap';
import { Award, BookOpen, Clock, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      if (!user) return;

      try {
        // PERBAIKAN UTAMA DI SINI:
        // Gunakan .eq('user_id', user.id) ATAU .eq('email', user.email)
        // Jangan gunakan student_name karena nama bisa berubah/belum load saat refresh.
        
        let query = supabase
          .from('invoices')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1);

        // Prioritas 1: Cari by User ID (Paling Stabil)
        if (user.id) {
            query = query.eq('user_id', user.id);
        } else {
            // Fallback: Cari by Email jika ID entah kenapa null
            query = query.eq('email', user.email);
        }

        const { data, error } = await query.single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 = Data not found (wajar)
            console.error("Error fetch invoice:", error);
        }

        setActiveInvoice(data); // Data bisa null jika belum ada invoice, itu wajar
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [user]);

  if (loading) return <div className="p-4 text-center">Memuat data paket...</div>;

  // --- LOGIC TAMPILAN BERDASARKAN STATUS (Sama seperti sebelumnya) ---
  
  // 1. Jika Belum Ada Invoice
  if (!activeInvoice) {
    return (
      <Alert variant="warning" className="d-flex align-items-center p-4">
        <AlertTriangle size={32} className="me-3" />
        <div>
            <h4 className="alert-heading">Paket Belum Aktif</h4>
            <p>Anda belum terdaftar di paket belajar manapun.</p>
            <Button href="/#pricing" variant="warning" className="fw-bold">Pilih Paket Sekarang</Button>
        </div>
      </Alert>
    );
  }

  // 2. Jika Status UNPAID
  if (activeInvoice.status === 'unpaid') {
    return (
      <Alert variant="danger" className="text-center p-5">
        <h4 className="fw-bold">Tagihan Belum Dibayar</h4>
        <p className="mb-4">Paket <strong>{activeInvoice.package_name}</strong> menunggu pembayaran.</p>
        <div className="h2 fw-bold mb-4">Rp {activeInvoice.total_amount?.toLocaleString('id-ID')}</div>
        {/* Tombol diarahkan kembali ke Invoice View untuk upload bukti */}
        <Button onClick={() => window.location.href='/invoice'} variant="danger" className="px-4">
            Bayar & Konfirmasi Sekarang
        </Button>
      </Alert>
    );
  }

  // 3. Jika Status WAITING
  if (activeInvoice.status === 'waiting_confirmation') {
    return (
      <Alert variant="info" className="text-center p-5">
        <Clock size={48} className="mb-3 text-info"/>
        <h4 className="fw-bold">Menunggu Konfirmasi Admin</h4>
        <p>Paket <strong>{activeInvoice.package_name}</strong> sedang diverifikasi.</p>
        <Button onClick={() => window.location.href='/invoice'} variant="outline-info">
            Lihat Status Invoice
        </Button>
      </Alert>
    );
  }

  // 4. Jika Status PAID (Aktif)
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
      
       <Col md={12}>
        <Alert variant="light" className="border">
            <h6 className="fw-bold"><BookOpen size={16}/> Materi Belajar</h6>
            <p className="mb-0">Materi akan muncul di sini sesuai jadwal.</p>
        </Alert>
       </Col>
    </Row>
  );
}