import React, { useState, useEffect } from "react";
import { Card, Form, Button, Row, Col, Table } from "react-bootstrap";
import { supabase } from "../../../lib/supabase"; 

export default function GradeTab({ user, students, showModal }) {
  const [gradeForm, setGradeForm] = useState({
    studentId: "",
    subject: "",
    score: "",
    feedback: "",
  });

  // State untuk daftar nilai
  const [gradesList, setGradesList] = useState([]);

  useEffect(() => {
    fetchGrades();
  }, [user]);

  const fetchGrades = async () => {
    const { data } = await supabase
      .from("grades")
      .select(`*, student:profiles!student_id(full_name)`)
      .eq("teacher_id", user.id)
      .order("created_at", { ascending: false });
    setGradesList(data || []);
  };

  const handleSaveGrade = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("grades").insert({
        student_id: gradeForm.studentId,
        teacher_id: user.id,
        subject: gradeForm.subject,
        score: gradeForm.score,
        feedback: gradeForm.feedback,
      });
      if (error) throw error;
      showModal("Sukses", "Nilai berhasil disimpan!", "success");
      setGradeForm({ studentId: "", subject: "", score: "", feedback: "" });
      fetchGrades(); // Refresh tabel setelah simpan
    } catch (err) {
      showModal("Gagal", "Gagal simpan nilai: " + err.message, "error");
    }
  };

  return (
    <div className="d-flex flex-column gap-4">
      {/* FORM INPUT */}
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white fw-bold">Input Nilai Baru</Card.Header>
        <Card.Body>
          <Form onSubmit={handleSaveGrade}>
            {/* ... (Form code kamu yang lama tetap disini) ... */}
            <Row className="g-3">
            <Col md={6}>
              <Form.Label>Pilih Siswa</Form.Label>
              <Form.Select
                value={gradeForm.studentId}
                onChange={(e) =>
                  setGradeForm({ ...gradeForm, studentId: e.target.value })
                }
                required
              >
                <option value="">-- Pilih Siswa --</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={6}>
              <Form.Label>Mata Pelajaran</Form.Label>
              <Form.Control
                type="text"
                value={gradeForm.subject}
                onChange={(e) =>
                  setGradeForm({ ...gradeForm, subject: e.target.value })
                }
                required
              />
            </Col>
            <Col md={3}>
              <Form.Label>Nilai (0-100)</Form.Label>
              <Form.Control
                type="number"
                value={gradeForm.score}
                onChange={(e) =>
                  setGradeForm({ ...gradeForm, score: e.target.value })
                }
                required
              />
            </Col>
            <Col md={9}>
              <Form.Label>Feedback / Catatan</Form.Label>
              <Form.Control
                type="text"
                value={gradeForm.feedback}
                onChange={(e) =>
                  setGradeForm({ ...gradeForm, feedback: e.target.value })
                }
              />
            </Col>
            <Col xs={12}>
              <Button type="submit" variant="success">
                Simpan Nilai
              </Button>
            </Col>
          </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* TABEL RIWAYAT NILAI (TAMBAHAN) */}
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white fw-bold">Riwayat Nilai Siswa</Card.Header>
        <Card.Body className="p-0">
          <Table hover responsive className="mb-0 align-middle">
            <thead className="bg-light">
              <tr>
                <th className="ps-3">Siswa</th>
                <th>Mapel</th>
                <th>Nilai</th>
                <th>Feedback</th>
                <th>Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {gradesList.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-4 text-muted">Belum ada data nilai.</td></tr>
              ) : (
                gradesList.map((g) => (
                  <tr key={g.id}>
                    <td className="ps-3 fw-medium">{g.student?.full_name || "-"}</td>
                    <td>{g.subject}</td>
                    <td><span className={`badge ${g.score >= 75 ? 'bg-success' : 'bg-warning text-dark'}`}>{g.score}</span></td>
                    <td className="small text-muted">{g.feedback || "-"}</td>
                    <td className="small">{new Date(g.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
}