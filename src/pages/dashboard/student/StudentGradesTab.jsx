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
      /* =========================
         NILAI LATIHAN
      ========================= */
      const { data: attempts, error: attemptError } = await supabase
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

      if (attemptError) throw attemptError;
      setExerciseScores(attempts || []);

      /* =========================
         NILAI GURU
      ========================= */
      const { data: grades, error: gradeError } = await supabase
        .from("grades")
        .select(`
          *,
          teacher:profiles!teacher_id(full_name)
        `)
        .eq("student_id", user.id)
        .order("created_at", { ascending: false });

      if (gradeError) throw gradeError;
      setTeacherGrades(grades || []);
    } catch {
      setExerciseScores([]);
      setTeacherGrades([]);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     FORMATTER (DIKUNCI)
  ========================= */
  const formatScore = (value) => {
    if (value === null || value === undefined) return "-";
    return Math.round(Number(value));
  };

  const calcAverage = (list) => {
    if (!list.length) return 0;
    const total = list.reduce(
      (acc, curr) => acc + (Number(curr.score) || 0),
      0
    );
    return Math.round(total / list.length);
  };

  const avgExercise = calcAverage(exerciseScores);
  const avgTeacher = calcAverage(teacherGrades);

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* ===============================
          SECTION: NILAI LATIHAN
      =============================== */}
      <Row className="mb-4">
        <Col md={5} lg={4}>
          <Card className="border-0 shadow-sm rounded-4 bg-success text-white h-100 overflow-hidden">
            <Card.Body className="position-relative p-4">
              <div className="position-absolute top-0 end-0 p-3 opacity-25">
                <Award size={72} />
              </div>
              <h6 className="text-white text-opacity-75">
                Rata-rata Nilai Latihan
              </h6>
              <h1 className="fw-bold display-4 mb-0">
                {avgExercise}
              </h1>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <h5 className="fw-bold mb-3 d-flex align-items-center">
        <BookOpen size={20} className="me-2 text-success" />
        Riwayat Latihan
      </h5>

      <Card className="border-0 shadow-sm rounded-4 mb-5">
        {exerciseScores.length === 0 ? (
          <Alert variant="light" className="m-4">
            Belum ada nilai latihan.
          </Alert>
        ) : (
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4">Paket</th>
                  <th>Mata Pelajaran</th>
                  <th>Tanggal</th>
                  <th className="text-end pe-4">Skor</th>
                </tr>
              </thead>
              <tbody>
                {exerciseScores.map((e) => (
                  <tr key={e.id}>
                    <td className="ps-4 fw-bold">
                      {e.package?.title || "-"}
                    </td>
                    <td>{e.package?.subject || "-"}</td>
                    <td>
                      <Calendar size={14} className="me-1 text-success" />
                      {new Date(e.created_at).toLocaleDateString("id-ID")}
                    </td>
                    <td className="text-end pe-4">
                      <span
                        className={`fw-bold ${
                          formatScore(e.score) >= 80
                            ? "text-success"
                            : formatScore(e.score) >= 60
                            ? "text-warning"
                            : "text-danger"
                        }`}
                      >
                        {formatScore(e.score)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card>

      {/* ===============================
          SECTION: NILAI GURU
      =============================== */}
      <Row className="mb-4">
        <Col md={5} lg={4}>
          <Card className="border-0 shadow-sm rounded-4 bg-primary text-white h-100 overflow-hidden">
            <Card.Body className="position-relative p-4">
              <div className="position-absolute top-0 end-0 p-3 opacity-25">
                <GraduationCap size={72} />
              </div>
              <h6 className="text-white text-opacity-75">
                Rata-rata Nilai Guru
              </h6>
              <h1 className="fw-bold display-4 mb-0">
                {avgTeacher}
              </h1>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <h5 className="fw-bold mb-3 d-flex align-items-center">
        <TrendingUp size={20} className="me-2 text-primary" />
        Riwayat Penilaian Guru
      </h5>

      <Card className="border-0 shadow-sm rounded-4">
        {teacherGrades.length === 0 ? (
          <Alert variant="light" className="m-4">
            Belum ada penilaian dari guru.
          </Alert>
        ) : (
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4">Mata Pelajaran</th>
                  <th>Guru</th>
                  <th>Tanggal</th>
                  <th className="text-end pe-4">Nilai</th>
                </tr>
              </thead>
              <tbody>
                {teacherGrades.map((g) => (
                  <tr key={g.id}>
                    <td className="ps-4 fw-bold">
                      {g.subject}
                    </td>
                    <td>
                      {g.teacher?.full_name || "-"}
                    </td>
                    <td>
                      <Calendar size={14} className="me-1 text-primary" />
                      {new Date(g.created_at).toLocaleDateString("id-ID")}
                    </td>
                    <td className="text-end pe-4">
                      <span
                        className={`fw-bold ${
                          formatScore(g.score) >= 80
                            ? "text-success"
                            : formatScore(g.score) >= 60
                            ? "text-warning"
                            : "text-danger"
                        }`}
                      >
                        {formatScore(g.score)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
