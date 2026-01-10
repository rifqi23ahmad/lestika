import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Badge, Spinner } from "react-bootstrap";
import {
  Calendar,
  BookOpen,
  FileQuestion,
  TrendingUp,
  ArrowRight,
  Users,
  Clock,
  CheckSquare,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function TeacherHome({ user }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // State untuk menyimpan data real
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalSchedules: 0,
    totalMaterials: 0
  });

  useEffect(() => {
    if (user?.id) {
      fetchDashboardStats();
    }
  }, [user]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      // 1. Hitung Total Siswa
      // (Tetap menggunakan profiles dengan role siswa sebagai gambaran global/platform)
      const { count: studentCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "siswa");

      // 2. Hitung Total Sesi Mengajar (FIXED)
      // Mengambil dari 'teaching_slots' dimana status = 'booked', tanpa melihat tanggal
      const { count: bookedSlotsCount } = await supabase
        .from("teaching_slots")
        .select("*", { count: "exact", head: true })
        .eq("teacher_id", user.id)
        .eq("status", "booked");

      // 3. Hitung Materi/Modul yang sudah diupload Guru Ini
      const { count: materialCount } = await supabase
        .from("materials") 
        .select("*", { count: "exact", head: true })
        .eq("teacher_id", user.id);

      setStats({
        totalStudents: studentCount || 0,
        totalSchedules: bookedSlotsCount || 0,
        totalMaterials: materialCount || 0,
      });

    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const goToDashboard = (tab) => {
    navigate(`/teacher/dashboard?tab=${tab}`);
  };

  // Data untuk ditampilkan di UI
  const statCards = [
    { 
      title: "Total Siswa", 
      value: stats.totalStudents, 
      icon: Users, 
      color: "primary", 
      bg: "bg-primary" 
    },
    { 
      title: "Sesi Aktif", 
      value: `${stats.totalSchedules} Sesi`, 
      icon: Clock, 
      color: "success", 
      bg: "bg-success" 
    },
    { 
      title: "Materi Upload", 
      value: `${stats.totalMaterials} File`, 
      icon: BookOpen, 
      color: "warning", 
      bg: "bg-warning" 
    },
  ];

  const menuItems = [
    {
      title: "Jadwal Mengajar",
      desc: "Kelola slot waktu dan sesi kelas Anda.",
      icon: Calendar,
      color: "primary",
      tab: "jadwal",
      action: "Cek Jadwal",
    },
    {
      title: "Materi & Modul",
      desc: "Upload dan kelola bahan ajar siswa.",
      icon: BookOpen,
      color: "success",
      tab: "materi",
      action: "Kelola File",
    },
    {
      title: "Bank Soal",
      desc: "Buat kuis dan latihan soal otomatis.",
      icon: FileQuestion,
      color: "danger",
      tab: "bank_soal",
      action: "Buat Soal",
    },
    {
      title: "Penilaian Siswa",
      desc: "Input dan pantau perkembangan nilai.",
      icon: TrendingUp,
      color: "info",
      tab: "nilai",
      action: "Input Nilai",
    },
  ];

  return (
    <div className="bg-light min-vh-100 pb-5">
      {/* Hero Section */}
      <div className="bg-white border-bottom shadow-sm mb-5">
        <Container className="py-5">
          <Row className="align-items-center">
            <Col md={8}>
              <Badge bg="primary" className="mb-2 px-3 py-2 rounded-pill">
                Teacher Workspace
              </Badge>
              <h1 className="fw-bold display-5 text-dark mb-2">
                Halo, <span className="text-primary">{user?.full_name || user?.name || "Guru"}</span>!
              </h1>
              <p className="text-muted lead mb-4">
                Siap menginspirasi siswa hari ini? Berikut ringkasan aktivitas Anda.
              </p>
              
              <div className="d-flex gap-3">
                <Button variant="primary" className="rounded-pill px-4" onClick={() => goToDashboard("jadwal")}>
                  <Calendar size={18} className="me-2" />
                  Lihat Jadwal Hari Ini
                </Button>
                <Button variant="outline-primary" className="rounded-pill px-4" onClick={() => goToDashboard("bank_soal")}>
                  + Buat Latihan Baru
                </Button>
              </div>
            </Col>
            
            <Col md={4} className="d-none d-md-block text-end">
               <div className="d-inline-block bg-primary bg-opacity-10 rounded-circle p-4">
                  <BookOpen size={64} className="text-primary" />
               </div>
            </Col>
          </Row>
        </Container>
      </div>

      <Container>
        
        {/* Stats Grid */}
        <Row className="g-4 mb-5">
          {statCards.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Col md={4} key={idx}>
                <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden">
                  <Card.Body className="d-flex align-items-center p-4">
                    <div className={`${stat.bg} bg-opacity-10 p-3 rounded-circle me-3`}>
                      <Icon size={24} className={`text-${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-muted small mb-0 fw-bold text-uppercase">{stat.title}</p>
                      {loading ? (
                        <Spinner animation="border" size="sm" variant={stat.color} />
                      ) : (
                        <h3 className="fw-bold mb-0 text-dark">{stat.value}</h3>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>

        {/* Quick Access Menu */}
        <div className="d-flex align-items-center justify-content-between mb-4">
           <h4 className="fw-bold text-dark mb-0">Menu Utama</h4>
           <span className="text-muted small">Pilih menu untuk mulai mengelola</span>
        </div>

        <Row className="g-4">
          {menuItems.map((item, idx) => (
            <Col md={6} lg={3} key={idx}>
              <Card 
                className="h-100 border-0 shadow-sm rounded-4 hover-top transition-all"
                style={{ cursor: "pointer" }}
                onClick={() => goToDashboard(item.tab)}
              >
                <Card.Body className="p-4 d-flex flex-column">
                  <div className={`bg-${item.color} bg-opacity-10 text-${item.color} rounded-3 d-flex align-items-center justify-content-center mb-3`} style={{ width: 50, height: 50 }}>
                    <item.icon size={24} />
                  </div>
                  <h5 className="fw-bold text-dark mb-2">{item.title}</h5>
                  <p className="text-muted small mb-4 flex-grow-1">{item.desc}</p>
                  
                  <div className={`d-flex align-items-center justify-content-between text-${item.color} fw-bold small mt-auto`}>
                    {item.action}
                    <ArrowRight size={16} />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
}