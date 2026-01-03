import React, { useState } from "react";
import { Card, Form, Button, Row, Col } from "react-bootstrap";
import { supabase } from "../../../lib/supabase"; 

export default function GradeTab({ user, students, showModal }) {
  const [gradeForm, setGradeForm] = useState({
    studentId: "",
    subject: "",
    score: "",
    feedback: "",
  });

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
    } catch (err) {
      showModal("Gagal", "Gagal simpan nilai: " + err.message, "error");
    }
  };

  return (
    <Card className="shadow-sm border-0">
      <Card.Body>
        <Form onSubmit={handleSaveGrade}>
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
  );
}
