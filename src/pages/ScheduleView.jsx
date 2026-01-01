import React, { useEffect, useState } from 'react';
import { Container, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Calendar, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ScheduleView() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hasPaid, setHasPaid] = useState(false);

  useEffect(() => {
    checkPaymentStatus();
  }, [user]);

  const checkPaymentStatus = async () => {
    if (!user) return;
    try {
      // Cek apakah ada invoice dengan status 'paid' milik user ini
      const { data } = await supabase
        .from('invoices')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'paid')
        .limit(1);
        
      setHasPaid(data && data.length > 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border"/></div>;

  // JIKA BELUM BAYAR -> TAMPILKAN BLOCKER
  if (!hasPaid) {
    return (
      <Container className="py-5 text-center">
         <div className="d-inline-block p-4 rounded-circle bg-light mb-3">
            <Lock size={48} className="text-secondary"/>
         </div>
         <h3 className="fw-bold">Akses Jadwal Terkunci</h3>
         <p className="text-muted mw-50 mx-auto">
            Anda belum memiliki paket belajar yang aktif. <br/>
            Silakan selesaikan pembayaran invoice Anda untuk melihat jadwal.
         </p>
         <Button variant="primary" onClick={() => navigate('/invoice')}>
            Cek Status Pembayaran
         </Button>
      </Container>
    );
  }

  // JIKA SUDAH BAYAR -> TAMPILKAN JADWAL
  return (
    <Container className="py-5">
      <div className="d-flex align-items-center mb-4">
        <Calendar className="text-primary me-2" size={32}/>
        <h2 className="fw-bold mb-0">Jadwal Belajar Saya</h2>
      </div>

      <Alert variant="success">
        Halo <strong>{user.name}</strong>, paket belajar Anda aktif! Berikut adalah jadwal minggu ini.
      </Alert>

      {/* Placeholder Jadwal Statis (Nanti bisa diganti data dari DB) */}
      <Card className="shadow-sm border-0">
        <Card.Body>
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Hari</th>
                  <th>Jam</th>
                  <th>Mata Pelajaran</th>
                  <th>Pengajar</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Senin</td>
                  <td>14:00 - 15:30</td>
                  <td>Matematika</td>
                  <td>Kak Budi</td>
                  <td><span className="badge bg-primary">Akan Datang</span></td>
                </tr>
                <tr>
                  <td>Rabu</td>
                  <td>16:00 - 17:30</td>
                  <td>Bahasa Inggris</td>
                  <td>Ms. Sarah</td>
                  <td><span className="badge bg-secondary">Menunggu</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}