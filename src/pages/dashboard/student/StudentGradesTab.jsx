import React from "react";
import { Card, Table, Badge, Row, Col } from "react-bootstrap";
import { TrendingUp, Award, Calendar } from "lucide-react";

export default function StudentGradesTab({ user }) {
  // Dummy Data
  const grades = [
    { id: 1, subject: "Matematika - Aljabar", score: 85, date: "10 Feb 2025", type: "Quiz" },
    { id: 2, subject: "Matematika - Geometri", score: 78, date: "15 Feb 2025", type: "Tryout" },
    { id: 3, subject: "Fisika - Mekanika", score: 92, date: "20 Feb 2025", type: "Tugas" },
  ];

  const average = (grades.reduce((acc, curr) => acc + curr.score, 0) / grades.length).toFixed(1);

  return (
    <div>
      {/* Summary Card */}
      <Row className="mb-4">
         <Col md={4}>
            <Card className="border-0 shadow-sm rounded-4 bg-primary text-white overflow-hidden">
               <Card.Body className="position-relative p-4">
                  <div className="position-absolute top-0 end-0 p-3 opacity-25">
                     <Award size={64} />
                  </div>
                  <h6 className="text-white text-opacity-75">Rata-rata Nilai</h6>
                  <h1 className="display-4 fw-bold mb-0">{average}</h1>
                  <Badge bg="white" className="text-primary mt-2">Sangat Baik</Badge>
               </Card.Body>
            </Card>
         </Col>
      </Row>

      <h5 className="fw-bold mb-3">Riwayat Penilaian</h5>
      <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
        <Table responsive hover className="mb-0 align-middle">
          <thead className="bg-light">
            <tr>
              <th className="py-3 ps-4 border-0 text-muted small fw-bold text-uppercase">Materi</th>
              <th className="py-3 border-0 text-muted small fw-bold text-uppercase">Tipe</th>
              <th className="py-3 border-0 text-muted small fw-bold text-uppercase">Tanggal</th>
              <th className="py-3 pe-4 border-0 text-end text-muted small fw-bold text-uppercase">Nilai</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((g) => (
              <tr key={g.id}>
                <td className="ps-4 fw-bold text-dark">{g.subject}</td>
                <td><Badge bg="light" className="text-dark border">{g.type}</Badge></td>
                <td className="text-muted"><small><Calendar size={12} className="me-1"/> {g.date}</small></td>
                <td className="pe-4 text-end">
                  <span className={`fw-bold ${g.score >= 80 ? 'text-success' : g.score >= 60 ? 'text-warning' : 'text-danger'}`}>
                    {g.score}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}