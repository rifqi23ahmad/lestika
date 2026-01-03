import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Spinner,
  Nav,
} from "react-bootstrap";
import { Calendar, BookOpen, Coffee, Clock, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

export default function ScheduleView() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  const todayName = new Date().toLocaleDateString("id-ID", { weekday: "long" });
  const [activeDay, setActiveDay] = useState(todayName);

  const daysOrder = [
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
    "Minggu",
  ];

  useEffect(() => {
    if (user) fetchSchedule();
  }, [user]);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const startOfWeek = new Date(now.setDate(diff));
      startOfWeek.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from("teaching_slots")
        .select(
          `
          *,
          teacher:profiles!teacher_id(full_name)
        `
        )
        .eq("student_id", user.id)
        .gte("start_time", startOfWeek.toISOString())
        .order("start_time", { ascending: true });

      if (error) throw error;

      const formattedData = (data || []).map((slot) => {
        const startDate = new Date(slot.start_time);
        const endDate = new Date(slot.end_time);

        return {
          id: slot.id,
          day: startDate.toLocaleDateString("id-ID", { weekday: "long" }),
          time_start: startDate
            .toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
            .replace(".", ":"),
          time_end: endDate
            .toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
            .replace(".", ":"),
          subject: slot.subject,
          raw_date: startDate,
          teacher_name: slot.teacher?.full_name || "Guru Pengajar",
        };
      });

      setSchedules(formattedData);

      const availableDays = [...new Set(formattedData.map((s) => s.day))];
      if (formattedData.length > 0 && !availableDays.includes(todayName)) {
        const sortedAvailable = daysOrder.filter((d) =>
          availableDays.includes(d)
        );
        if (sortedAvailable.length > 0) {
          setActiveDay(sortedAvailable[0]);
        }
      }
    } catch (error) {
      console.error("Gagal mengambil jadwal:", error);
    } finally {
      setLoading(false);
    }
  };

  const isClassNow = (item) => {
    const now = new Date();
    const start = new Date(item.raw_date);
    const end = new Date(item.raw_date);
    const [endH, endM] = item.time_end.split(":").map(Number);
    end.setHours(endH, endM, 0, 0);
    return now >= start && now <= end;
  };

  const renderScheduleCard = (item) => {
    const isLive = isClassNow(item);

    return (
      <Card
        key={item.id}
        className={`mb-3 border-0 shadow-sm overflow-hidden transition-all ${
          isLive ? "border border-primary ring-2 ring-primary-100" : ""
        }`}
        style={{ borderRadius: "12px" }}
      >
        <div className="d-flex align-items-stretch">
          <div
            className={`p-3 d-flex flex-column align-items-center justify-content-center text-white ${
              isLive ? "bg-primary" : "bg-dark"
            }`}
            style={{ width: "100px", minWidth: "100px" }}
          >
            <Clock size={18} className="mb-1 opacity-75" />
            <span className="fw-bold fs-5">{item.time_start}</span>
            <span className="small opacity-75">{item.time_end}</span>
          </div>

          <Card.Body className="p-3 d-flex flex-column justify-content-center">
            <h5 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
              {item.subject}
              {isLive && (
                <Badge bg="danger" className="blink_me small fw-normal">
                  ● SEDANG BERLANGSUNG
                </Badge>
              )}
            </h5>
            <div className="text-muted small d-flex align-items-center mt-1">
              <User size={14} className="me-2 text-primary" />
              <span className="fw-medium text-secondary">
                {item.teacher_name}
              </span>
            </div>
          </Card.Body>
        </div>
      </Card>
    );
  };

  const availableDays = [...new Set(schedules.map((s) => s.day))];
  const sortedDays = daysOrder.filter((day) => availableDays.includes(day));
  const activeSchedules = schedules.filter((s) => s.day === activeDay);

  return (
    <Container className="py-4 py-md-5" style={{ minHeight: "80vh" }}>
      <div className="mb-4 mb-md-5 text-center text-md-start">
        <h2 className="fw-bold text-dark">Jadwal Belajar</h2>
        <p className="text-muted">
          <Calendar size={18} className="me-2 text-primary" />
          Kelola waktumu, raih prestasimu.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted small">Memuat jadwal...</p>
        </div>
      ) : (
        <Row>
          {sortedDays.length > 0 && (
            <Col md={3} className="mb-4">
              <Card className="border-0 shadow-sm rounded-4">
                <Card.Body className="p-2">
                  <Nav
                    variant="pills"
                    className="flex-column"
                    activeKey={activeDay}
                    onSelect={(k) => setActiveDay(k)}
                  >
                    {sortedDays.map((day) => (
                      <Nav.Item key={day}>
                        <Nav.Link
                          eventKey={day}
                          className={`text-start fw-medium py-2 px-3 mb-1 rounded-3 ${
                            activeDay === day
                              ? "bg-primary text-white shadow-sm"
                              : "text-secondary hover-bg-light"
                          }`}
                          style={{ cursor: "pointer" }}
                        >
                          {day}
                          {day === todayName && (
                            <Badge bg="danger" className="ms-2 float-end small">
                              Hari Ini
                            </Badge>
                          )}
                        </Nav.Link>
                      </Nav.Item>
                    ))}
                  </Nav>
                </Card.Body>
              </Card>
            </Col>
          )}

          <Col md={sortedDays.length > 0 ? 9 : 12}>
            <div className="fade-in">
              {sortedDays.length > 0 ? (
                <>
                  <h5 className="fw-bold mb-3 d-flex align-items-center">
                    <BookOpen size={20} className="me-2 text-primary" />
                    Jadwal {activeDay}
                  </h5>
                  {activeSchedules.map(renderScheduleCard)}
                </>
              ) : (
                <div className="text-center py-5 bg-white rounded-4 border border-dashed">
                  <div className="bg-light rounded-circle d-inline-flex p-3 mb-3">
                    <Coffee size={32} className="text-muted opacity-50" />
                  </div>
                  <h6 className="fw-bold text-dark">Belum Ada Jadwal</h6>
                  <p className="text-muted small mb-0">
                    Kamu belum memiliki jadwal aktif minggu ini.
                  </p>
                </div>
              )}
            </div>
          </Col>
        </Row>
      )}

      <style>
        {`
          .hover-bg-light:hover { background-color: #f8f9fa; }
          .blink_me { animation: blinker 1.5s linear infinite; }
          @keyframes blinker { 50% { opacity: 0; } }
          .transition-all { transition: all 0.3s ease; }
        `}
      </style>
    </Container>
  );
}
