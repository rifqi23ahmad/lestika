import React, { useState, useEffect } from "react";
import { Card, Table, Badge, Row, Col, Spinner, Alert } from "react-bootstrap";
import { TrendingUp, Award, Calendar, MessageCircle } from "lucide-react";
import { supabase } from "../../../lib/supabase";

export default function StudentGradesTab({ user }) {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchGrades();
  }, [user]);

  const fetchGrades = async () => {
    try {
      // Mengambil nilai milik user yang sedang login
      const { data, error } = await supabase
        .from("grades")
        .select(`
            *,
            teacher:profiles!teacher_id(full_name)
        `)
        .eq("student_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGrades(data || []);
    } catch (err) {
      console.error("Fetch grades error:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateAverage = () => {
    if (grades.length === 0) return 0;
    const total = grades.reduce((acc, curr) => acc + (parseFloat(curr.score) || 0), 0);
    return (total / grades.length).toFixed(1);
  };

  if (loading) return (
    <div className="text-center py-5">
      <Spinner animation="border" variant="primary" />
    </div>
  );

  const average = calculateAverage();

  return (
    <div className="animate-fade-in">
      {/* Ringkasan Nilai */}
      <Row className="mb-4">
         <Col md={5} lg={4}>
            <Card className="border-0 shadow-sm rounded-4 bg-primary text-white overflow-hidden h-100">
               <Card.Body className="position-relative p-4 d-flex flex-column justify-content-center">
                  <div className="position-absolute top-0 end-0 p-3 opacity-25">
                     <Award size={80} />
                  </div>
                  <h6 className="text-white text-opacity-75 mb-1">Rata-rata Nilai</h6>
                  <h1 className="display-4 fw-bold mb-0">{average}</h1>
                  <div className="mt-2">
                    <Badge bg="white" className="text-primary px-3 py-1 rounded-pill">
                        {average >= 90 ? "Luar Biasa!" : average >= 80 ? "Sangat Baik" : average >= 70 ? "Baik" : "Tingkatkan Lagi"}
                    </Badge>
                  </div>
               </Card.Body>
            </Card>
         </Col>
      </Row>

      <div className="d-flex align-items-center mb-3">
        <TrendingUp size={20} className="text-primary me-2" />
        <h5 className="fw-bold mb-0">Riwayat Penilaian</h5>
      </div>

      <Card className="border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        {grades.length === 0 ? (
            <div className="p-5 text-center">
                <Alert variant="light" className="d-inline-block border rounded-pill px-4">Belum ada data nilai yang masuk.</Alert>
            </div>
        ) : (
            <div className="table-responsive">
                <Table hover className="mb-0 align-middle">
                <thead className="bg-light">
                    <tr>
                    <th className="py-3 ps-4 border-0 text-secondary small fw-bold text-uppercase">Mata Pelajaran</th>
                    <th className="py-3 border-0 text-secondary small fw-bold text-uppercase">Guru</th>
                    <th className="py-3 border-0 text-secondary small fw-bold text-uppercase">Tanggal</th>
                    <th className="py-3 border-0 text-secondary small fw-bold text-uppercase">Catatan</th>
                    <th className="py-3 pe-4 border-0 text-end text-secondary small fw-bold text-uppercase">Nilai</th>
                    </tr>
                </thead>
                <tbody>
                    {grades.map((g) => (
                    <tr key={g.id}>
                        <td className="ps-4 fw-bold text-dark">{g.subject}</td>
                        <td className="text-muted small">{g.teacher?.full_name}</td>
                        <td className="text-muted small">
                            <div className="d-flex align-items-center">
                                <Calendar size={14} className="me-2 text-primary"/> 
                                {new Date(g.created_at).toLocaleDateString("id-ID")}
                            </div>
                        </td>
                        <td>
                            {g.feedback ? (
                                <div className="d-flex align-items-center text-muted small" title={g.feedback}>
                                    <MessageCircle size={14} className="me-1 text-info"/>
                                    <span className="d-inline-block text-truncate" style={{maxWidth: '200px'}}>{g.feedback}</span>
                                </div>
                            ) : <span className="text-muted small">-</span>}
                        </td>
                        <td className="pe-4 text-end">
                        <span className={`fs-5 fw-bold ${g.score >= 80 ? 'text-success' : g.score >= 60 ? 'text-warning' : 'text-danger'}`}>
                            {g.score}
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