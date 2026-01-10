import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Badge,
  Row,
  Col,
  Spinner,
  Alert,
} from "react-bootstrap";
import {
  TrendingUp,
  Award,
  Calendar,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";

export default function StudentGradesTab({ user }) {
  const [loading, setLoading] = useState(true);
  const [exerciseScores, setExerciseScores] = useState([]);
  const [teacherGrades, setTeacherGrades] = useState([]);

  useEffect(() => {
    if (user?.id) fetchAll();
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const { data: attempts } = await supabase
        .from("student_attempts")
        .select(`
          id,
          score,
          created_at,
          package:question_packages (
            title,
            subject
          )
        `)
        .eq("student_id", user.id)
        .order("created_at", { ascending: false });

      const { data: grades } = await supabase
        .from("grades")
        .select(`
          *,
          teacher:profiles!teacher_id(full_name)
        `)
        .eq("student_id", user.id)
        .order("created_at", { ascending: false });

      setExerciseScores(attempts || []);
      setTeacherGrades(grades || []);
    } finally {
      setLoading(false);
    }
  };

  const formatScore = (v) =>
    v === null || v === undefined ? "-" : Math.round(Number(v));

  const avg = (list) =>
    list.length === 0
      ? 0
      : Math.round(
          list.reduce((a, b) => a + (b.score || 0), 0) / list.length
        );

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  /* ===========================
     MOBILE VIEW (STACKED)
  ============================ */
  const MobileView = () => (
    <div className="d-block d-md-none">
      {/* LATIHAN */}
      <Card className="mb-3 bg-success text-white border-0 rounded-4">
        <Card.Body>
          <h6>Rata-rata Nilai Latihan</h6>
          <h1 className="fw-bold">{avg(exerciseScores)}</h1>
        </Card.Body>
      </Card>

      <SectionTable
        title="Riwayat Latihan"
        icon={<BookOpen size={18} />}
        rows={exerciseScores}
        type="exercise"
      />

      {/* GURU */}
      <Card className="my-3 bg-primary text-white border-0 rounded-4">
        <Card.Body>
          <h6>Rata-rata Nilai Guru</h6>
          <h1 className="fw-bold">{avg(teacherGrades)}</h1>
        </Card.Body>
      </Card>

      <SectionTable
        title="Riwayat Penilaian Guru"
        icon={<TrendingUp size={18} />}
        rows={teacherGrades}
        type="teacher"
      />
    </div>
  );

  /* ===========================
     DESKTOP VIEW (GRID)
  ============================ */
  const DesktopView = () => (
    <div className="d-none d-md-block">
      {/* SUMMARY */}
      <Row className="mb-4">
        <Col md={6}>
          <SummaryCard
            title="Rata-rata Nilai Latihan"
            value={avg(exerciseScores)}
            color="success"
            icon={<Award size={48} />}
          />
        </Col>
        <Col md={6}>
          <SummaryCard
            title="Rata-rata Nilai Guru"
            value={avg(teacherGrades)}
            color="primary"
            icon={<GraduationCap size={48} />}
          />
        </Col>
      </Row>

      {/* TABLES */}
      <Row>
        <Col md={6}>
          <SectionTable
            title="Riwayat Latihan"
            icon={<BookOpen size={18} />}
            rows={exerciseScores}
            type="exercise"
            dense
          />
        </Col>
        <Col md={6}>
          <SectionTable
            title="Riwayat Penilaian Guru"
            icon={<TrendingUp size={18} />}
            rows={teacherGrades}
            type="teacher"
            dense
          />
        </Col>
      </Row>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <MobileView />
      <DesktopView />
    </div>
  );
}

/* ===========================
   REUSABLE COMPONENTS
=========================== */

function SummaryCard({ title, value, color, icon }) {
  return (
    <Card className={`bg-${color} text-white border-0 rounded-4`}>
      <Card.Body className="position-relative">
        <div className="position-absolute top-0 end-0 p-3 opacity-25">
          {icon}
        </div>
        <h6 className="text-white text-opacity-75">{title}</h6>
        <h1 className="fw-bold">{value}</h1>
      </Card.Body>
    </Card>
  );
}

function SectionTable({ title, icon, rows, type, dense }) {
  if (!rows.length) {
    return (
      <Alert variant="light" className="mt-3">
        Tidak ada data.
      </Alert>
    );
  }

  return (
    <Card className="border-0 shadow-sm rounded-4 mt-3">
      <Card.Body className={dense ? "p-2" : "p-3"}>
        <h6 className="fw-bold d-flex align-items-center gap-2 mb-3">
          {icon} {title}
        </h6>

        <div className="table-responsive">
          <Table hover size={dense ? "sm" : undefined} className="mb-0">
            <thead className="bg-light">
              <tr>
                <th>Info</th>
                <th>Tanggal</th>
                <th className="text-end">Nilai</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="fw-bold">
                    {type === "exercise"
                      ? r.package?.title
                      : r.subject}
                  </td>
                  <td>
                    <Calendar size={14} className="me-1" />
                    {new Date(r.created_at).toLocaleDateString("id-ID")}
                  </td>
                  <td className="text-end fw-bold">
                    {Math.round(r.score)}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
}
