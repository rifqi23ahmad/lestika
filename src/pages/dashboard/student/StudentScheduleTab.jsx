import React, { useState, useEffect } from "react";
import { Card, Button, Badge, Row, Col, Spinner, Form } from "react-bootstrap";
import { Calendar, Clock, User, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "../../../lib/supabase";

export default function StudentScheduleTab({ user, showModal }) {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(null);
  
  // Filter State
  const [filterDay, setFilterDay] = useState("all");

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      // 1. Ambil jadwal yang tersedia
      const { data: scheduleData, error } = await supabase
        .from("schedules")
        .select(`
          id, day, time, subject, max_students,
          teacher:profiles!teacher_id(full_name),
          bookings:schedule_bookings(count)
        `)
        .order("day", { ascending: true }); // Logic sorting hari bisa diperbaiki nanti

      if (error) throw error;

      // 2. Cek mana yang SUDAH diambil oleh user ini
      const { data: myBookings } = await supabase
        .from("schedule_bookings")
        .select("schedule_id")
        .eq("student_id", user.id);

      const myBookedIds = myBookings?.map(b => b.schedule_id) || [];

      // 3. Format data
      const formatted = scheduleData.map(s => {
        const bookedCount = s.bookings?.[0]?.count || 0;
        return {
          ...s,
          current_students: bookedCount,
          is_full: bookedCount >= s.max_students,
          is_booked: myBookedIds.includes(s.id)
        };
      });

      setSchedules(formatted);
    } catch (err) {
      console.error("Fetch schedule error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (scheduleId) => {
    setBookingLoading(scheduleId);
    try {
      const { error } = await supabase
        .from("schedule_bookings")
        .insert({ schedule_id: scheduleId, student_id: user.id });

      if (error) throw error;
      
      showModal("Berhasil!", "Jadwal berhasil diambil. Jangan lupa hadir ya!", "success");
      fetchSchedules(); // Refresh UI
    } catch (err) {
      showModal("Gagal", err.message || "Gagal mengambil jadwal.", "error");
    } finally {
      setBookingLoading(null);
    }
  };

  // Helper untuk filter hari
  const filteredSchedules = filterDay === "all" 
    ? schedules 
    : schedules.filter(s => s.day === filterDay);

  const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>;

  return (
    <div>
      {/* Header & Filter */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4">
        <div>
           <h5 className="fw-bold mb-1">Jadwal Tersedia</h5>
           <p className="text-muted small mb-0">Pilih sesi kelas yang cocok dengan waktumu.</p>
        </div>
        <Form.Select 
          className="w-auto mt-3 mt-md-0 shadow-sm border-0 bg-white rounded-pill px-4"
          value={filterDay}
          onChange={(e) => setFilterDay(e.target.value)}
        >
          <option value="all">Semua Hari</option>
          {days.map(d => <option key={d} value={d}>{d}</option>)}
        </Form.Select>
      </div>

      {filteredSchedules.length === 0 ? (
        <Card className="border-0 shadow-sm rounded-4 text-center py-5">
           <Card.Body>
             <Calendar size={48} className="text-muted opacity-25 mb-3" />
             <h6 className="text-muted">Tidak ada jadwal tersedia untuk filter ini.</h6>
           </Card.Body>
        </Card>
      ) : (
        <Row className="g-3">
          {filteredSchedules.map((item) => (
            <Col md={6} lg={4} key={item.id}>
              <Card className={`h-100 border-0 shadow-sm rounded-4 transition hover-top ${item.is_booked ? 'bg-primary bg-opacity-10 border-primary' : 'bg-white'}`}>
                <Card.Body className="p-4 d-flex flex-column">
                  
                  {/* Header Card */}
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <Badge bg="white" className="text-primary border px-3 py-2 rounded-pill fw-bold shadow-sm">
                      {item.day}
                    </Badge>
                    {item.is_booked && <Badge bg="success" className="rounded-pill"><CheckCircle size={12} className="me-1"/> Terdaftar</Badge>}
                    {item.is_full && !item.is_booked && <Badge bg="secondary" className="rounded-pill">Penuh</Badge>}
                  </div>

                  {/* Body Content */}
                  <div className="mb-4">
                    <h4 className="fw-bold mb-1">{item.time}</h4>
                    <h6 className="text-primary fw-bold mb-3">{item.subject}</h6>
                    
                    <div className="d-flex align-items-center text-muted small mb-2">
                       <User size={14} className="me-2" />
                       <span>Tutor: {item.teacher?.full_name || "Tim Pengajar"}</span>
                    </div>
                    <div className="d-flex align-items-center text-muted small">
                       <AlertCircle size={14} className="me-2" />
                       <span>Kuota: {item.current_students} / {item.max_students} Siswa</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-auto">
                    {item.is_booked ? (
                      <Button variant="outline-primary" className="w-100 rounded-pill fw-bold" disabled>
                        Sudah Diambil
                      </Button>
                    ) : item.is_full ? (
                      <Button variant="secondary" className="w-100 rounded-pill" disabled>
                        Kelas Penuh
                      </Button>
                    ) : (
                      <Button 
                        variant="primary" 
                        className="w-100 rounded-pill fw-bold shadow-sm"
                        onClick={() => handleBook(item.id)}
                        disabled={bookingLoading === item.id}
                      >
                        {bookingLoading === item.id ? <Spinner size="sm"/> : "Ambil Jadwal"}
                      </Button>
                    )}
                  </div>

                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}