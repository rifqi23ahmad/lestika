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
  Briefcase,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

const DEFAULT_SESSION_MINUTES = 60;

export default function TeacherHome({ user }) {
  const navigate = useNavigate();
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingAgenda, setLoadingAgenda] = useState(true);

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalSchedules: 0,
    totalMaterials: 0,
    todaySessions: 0,
    todayAgenda: [],
  });

  useEffect(() => {
    if (user?.id) {
      fetchGlobalStats();
      fetchTodayAgenda();
    }
  }, [user]);

  /* ===============================
     GLOBAL STATS
  =============================== */
  const fetchGlobalStats = async () => {
    try {
      setLoadingStats(true);

      const [{ count: studentCount }, { count: scheduleCount }, { count: materialCount }] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .eq("role", "siswa"),

          supabase
            .from("teaching_slots")
            .select("*", { count: "exact", head: true })
            .eq("teacher_id", user.id)
            .eq("status", "booked"),

          supabase
            .from("materials")
            .select("*", { count: "exact", head: true })
            .eq("teacher_id", user.id),
        ]);

      setStats((prev) => ({
        ...prev,
        totalStudents: studentCount || 0,
        totalSchedules: scheduleCount || 0,
        totalMaterials: materialCount || 0,
      }));
    } catch (err) {
      console.error("Error fetching global stats:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  /* ===============================
     AGENDA HARI INI + STATUS
  =============================== */
  const fetchTodayAgenda = async () => {
    try {
      setLoadingAgenda(true);

      const now = new Date();
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);

      const { data: slots, error } = await supabase
        .from("teaching_slots")
        .select(`
          start_time,
          end_time,
          student_name_manual,
          student:profiles!student_id(full_name)
        `)
        .eq("teacher_id", user.id)
        .eq("status", "booked")
        .gte("start_time", startOfDay.toISOString())
        .lte("start_time", endOfDay.toISOString())
        .order("start_time", { ascending: true });

      if (error) throw error;

      const agenda =
        slots?.map((slot) => {
          const start = new Date(slot.start_time);
          const end = slot.end_time
            ? new Date(slot.end_time)
            : new Date(start.getTime() + DEFAULT_SESSION_MINUTES * 60000);

          let status = "upcoming";
          if (now >= start && now <= end) status = "ongoing";
          if (now > end) status = "finished";

          return {
            studentName:
              slot.student?.full_name ||
              slot.student_name_manual ||
              "Siswa",
            startTime: start,
            status,
          };
        }) || [];

      setStats((prev) => ({
        ...prev,
        todaySessions: agenda.length,
        todayAgenda: agenda,
      }));
    } catch (err) {
      console.error("Error fetching agenda:", err);
    } finally {
      setLoadingAgenda(false);
    }
  };

  const goToDashboard = (tab) => {
    navigate(`/teacher/dashboard?tab=${tab}`);
  };

  /* ===============================
     MENU ITEMS 
  =============================== */
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

  const statusBadge = (status) => {
    if (status === "ongoing") return <Badge bg="success">Sedang Berlangsung</Badge>;
    if (status === "finished") return <Badge bg="secondary">Selesai</Badge>;
    return <Badge bg="info">Akan Datang</Badge>;
  };

  return (
    <div className="bg-light min-vh-100 pb-5">
      {/* HERO */}
      <div className="bg-white border-bottom shadow-sm mb-5">
        <Container className="py-5">
          <Row>
            <Col md={8}>
              <Badge bg="primary" className="mb-2 px-3 py-2 rounded-pill">
                Teacher Workspace
              </Badge>

              <h1 className="fw-bold display-5 text-dark mb-2">
                Halo,{" "}
                <span className="text-primary">
                  {user?.full_name || user?.name || "Guru"}
                </span>
                !
              </h1>

              <p className="text-muted lead mb-4">
                Siap menginspirasi siswa hari ini? Berikut ringkasan aktivitas Anda.
              </p>

              {!loadingAgenda && (
                <div className="mb-4 bg-light px-4 py-3 rounded-4 border shadow-sm">
                  <div className="d-flex align-items-start gap-3 mb-2">
                    <div className="bg-primary text-white rounded-circle p-2">
                      <Briefcase size={20} />
                    </div>
                    <div>
                      <span className="text-muted small fw-bold d-block">
                        Agenda Hari Ini
                      </span>
                      <span className="fw-bold text-dark h5">
                        {stats.todaySessions > 0
                          ? `Ada ${stats.todaySessions} Sesi Mengajar`
                          : "Tidak ada jadwal mengajar"}
                      </span>
                    </div>
                  </div>

                  {/* LIST AGENDA – RAPI */}
                  {stats.todayAgenda.map((item, i) => (
                    <div
                      key={i}
                      className="d-flex align-items-center py-1"
                    >
                      <div className="flex-grow-1 fw-medium text-dark">
                        {item.studentName}
                      </div>

                      {/* JAM */}
                      <div
                        className="text-muted small text-end me-3"
                        style={{ width: 60 }}
                      >
                        {item.startTime.toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>

                      {/* STATUS */}
                      <div style={{ width: 120, textAlign: "center" }}>
                        {statusBadge(item.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Col>
          </Row>
        </Container>
      </div>

      {/* STATS */}
      <Container>
        <Row className="g-4 mb-5">
          {[
            {
              title: "Total Siswa",
              value: stats.totalStudents,
              icon: Users,
              color: "primary",
              bg: "bg-primary",
            },
            {
              title: "Total Sesi Aktif",
              value: `${stats.totalSchedules} Sesi`,
              icon: Clock,
              color: "success",
              bg: "bg-success",
            },
            {
              title: "Materi Upload",
              value: `${stats.totalMaterials} File`,
              icon: BookOpen,
              color: "warning",
              bg: "bg-warning",
            },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Col md={4} key={idx}>
                <Card className="border-0 shadow-sm rounded-4 h-100">
                  <Card.Body className="d-flex align-items-center p-4 text-dark">
                    <div className={`${stat.bg} bg-opacity-10 p-3 rounded-circle me-3`}>
                      <Icon size={24} className={`text-${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-muted small fw-bold text-uppercase mb-0">
                        {stat.title}
                      </p>
                      {loadingStats ? (
                        <Spinner animation="border" size="sm" variant={stat.color} />
                      ) : (
                        <h3 className="fw-bold mb-0">{stat.value}</h3>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>

        {/* MENU UTAMA */}
        <div className="d-flex justify-content-between mb-4">
          <h4 className="fw-bold text-dark">Menu Utama</h4>
          <span className="text-muted small">Pilih menu untuk mulai mengelola</span>
        </div>

        <Row className="g-4">
          {menuItems.map((item, idx) => (
            <Col md={6} lg={3} key={idx}>
              <Card
                className="h-100 border-0 shadow-sm rounded-4 bg-white"
                onClick={() => goToDashboard(item.tab)}
                style={{ cursor: "pointer" }}
              >
                <Card.Body className="p-4 d-flex flex-column text-dark">
                  <div
                    className={`bg-${item.color} bg-opacity-10 text-${item.color} rounded-3 d-flex align-items-center justify-content-center mb-3`}
                    style={{ width: 50, height: 50 }}
                  >
                    <item.icon size={24} />
                  </div>
                  <h5 className="fw-bold mb-2">{item.title}</h5>
                  <p className="text-muted small mb-4 flex-grow-1">{item.desc}</p>
                  <div className={`d-flex justify-content-between text-${item.color} fw-bold small`}>
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
