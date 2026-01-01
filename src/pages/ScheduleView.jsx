import React, { useEffect, useState } from 'react';
import { Container, Card, Button, Spinner, Badge, Tab, Tabs, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Lock, Clock, CheckCircle, PlusCircle, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ScheduleView() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [hasPaid, setHasPaid] = useState(false);
  const [mySchedules, setMySchedules] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    checkPaymentAndFetchData();
  }, [user]);

  // FORMATTER: HARI, TANGGAL BULAN TAHUN (Sesuai Request)
  const formatDateFull = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    });
  };

  const checkPaymentAndFetchData = async () => {
    if (!user) return;
    try {
      // 1. Cek Status Bayar
      const { data: invoiceData } = await supabase
        .from('invoices')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'paid')
        .limit(1);
        
      const paid = invoiceData && invoiceData.length > 0;
      setHasPaid(paid);

      // 2. Jika Paid, Ambil Data
      if (paid) {
        await Promise.all([fetchMySchedules(), fetchAvailableSlots()]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMySchedules = async () => {
    // Ambil jadwal milik siswa sendiri
    const { data } = await supabase
      .from('teaching_slots')
      .select(`*, teacher:profiles!teacher_id(full_name)`)
      .eq('student_id', user.id)
      .order('start_time', { ascending: true });
    setMySchedules(data || []);
  };

  const fetchAvailableSlots = async () => {
    // Ambil jadwal KOSONG (open & student_id null)
    // Pastikan SQL RLS sudah dijalankan agar data ini muncul!
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('teaching_slots')
      .select(`*, teacher:profiles!teacher_id(full_name)`)
      .is('student_id', null)  // Filter: Belum ada murid
      .eq('status', 'open')    // Filter: Status Open
      .gt('start_time', now)   // Filter: Masa depan
      .order('start_time', { ascending: true });
      
    if (error) console.error("Error fetching slots:", error);
    setAvailableSlots(data || []);
  };

  const handleBookSlot = async (slotId) => {
    if(!confirm("Apakah Anda yakin ingin mengambil jadwal ini?")) return;
    setBookingLoading(true);

    try {
      // Logic Booking: Update student_id ke user saat ini
      const { error } = await supabase
        .from('teaching_slots')
        .update({ 
            student_id: user.id, 
            status: 'booked' 
        })
        .eq('id', slotId)
        .is('student_id', null); // Pastikan slot belum diambil orang lain saat diklik

      if (error) throw error;

      alert("Jadwal berhasil diambil!");
      await Promise.all([fetchMySchedules(), fetchAvailableSlots()]); // Refresh data

    } catch (err) {
      console.error(err);
      alert("Gagal mengambil jadwal. Mungkin slot sudah keduluan diambil siswa lain.");
      fetchAvailableSlots();
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border"/></div>;

  // BLOCKER JIKA BELUM BAYAR
  if (!hasPaid) {
    return (
      <Container className="py-5 text-center">
         <div className="d-inline-block p-4 rounded-circle bg-light mb-3">
            <Lock size={48} className="text-secondary"/>
         </div>
         <h3 className="fw-bold">Akses Jadwal Terkunci</h3>
         <p className="text-muted mw-50 mx-auto">
            Selesaikan pembayaran invoice Anda untuk memilih jadwal.
         </p>
         <Button variant="primary" onClick={() => navigate('/invoice')}>
            Cek Status Pembayaran
         </Button>
      </Container>
    );
  }

  // TAMPILAN UTAMA (Tanpa Header Double)
  return (
    <Container className="py-4">
      <Tabs defaultActiveKey="myschedule" className="mb-4 custom-tabs">
        
        {/* TAB 1: JADWAL SAYA */}
        <Tab eventKey="myschedule" title={<><CheckCircle size={18} className="me-2"/>Jadwal Saya</>}>
            <Card className="shadow-sm border-0">
                <Card.Body>
                    {mySchedules.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <Clock size={48} className="mb-3 opacity-50"/>
                            <p>Anda belum memiliki jadwal terdaftar.</p>
                            <Button variant="link" onClick={() => document.getElementById('schedule-tabs-tab-booking').click()}>
                                Cari Jadwal Baru
                            </Button>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Tanggal</th>
                                        <th>Jam</th>
                                        <th>Mata Pelajaran</th>
                                        <th>Pengajar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mySchedules.map(slot => (
                                        <tr key={slot.id}>
                                            <td className="fw-bold text-dark">
                                                {formatDateFull(slot.start_time)}
                                            </td>
                                            <td>
                                                <span className="badge bg-light text-dark border">
                                                    {new Date(slot.start_time).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}
                                                    {' - '}
                                                    {new Date(slot.end_time).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}
                                                </span>
                                            </td>
                                            <td>{slot.subject}</td>
                                            <td>{slot.teacher?.full_name}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </Tab>

        {/* TAB 2: PILIH JADWAL BARU */}
        <Tab eventKey="booking" title={<><PlusCircle size={18} className="me-2"/>Pilih Jadwal Baru</>}>
            <Card className="shadow-sm border-0">
                <Card.Body>
                    {availableSlots.length === 0 ? (
                        <Alert variant="warning" className="d-flex align-items-center">
                            <Calendar className="me-3"/>
                            <div>
                                <strong>Tidak ada slot kosong.</strong>
                                <br/>Saat ini semua slot guru sudah terisi atau belum dibuka. Silakan cek lagi nanti.
                            </div>
                        </Alert>
                    ) : (
                        <div className="row g-3">
                            {availableSlots.map(slot => (
                                <div className="col-md-6 col-lg-4" key={slot.id}>
                                    <div className="border rounded p-3 h-100 bg-white shadow-sm d-flex flex-column">
                                        <div className="mb-3">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <Badge bg="info" text="dark" className="px-2 py-1">{slot.subject}</Badge>
                                                <small className="text-muted">
                                                    {Math.round((new Date(slot.end_time) - new Date(slot.start_time))/60000)} Menit
                                                </small>
                                            </div>
                                            
                                            <h5 className="fw-bold mb-1 text-dark">
                                                {formatDateFull(slot.start_time)}
                                            </h5>
                                            
                                            <div className="text-primary fw-bold fs-5 mb-2">
                                                {new Date(slot.start_time).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}
                                                <span className="text-muted fs-6 fw-normal mx-1">-</span>
                                                {new Date(slot.end_time).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}
                                            </div>
                                            
                                            <div className="text-muted small border-top pt-2 mt-2">
                                                Pengajar: <strong>{slot.teacher?.full_name || 'Tim Pengajar'}</strong>
                                            </div>
                                        </div>
                                        
                                        <Button 
                                            variant="primary" 
                                            className="w-100 mt-auto fw-bold" 
                                            onClick={() => handleBookSlot(slot.id)} 
                                            disabled={bookingLoading}
                                        >
                                            {bookingLoading ? 'Memproses...' : 'Ambil Jadwal Ini'}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card.Body>
            </Card>
        </Tab>

      </Tabs>
    </Container>
  );
}