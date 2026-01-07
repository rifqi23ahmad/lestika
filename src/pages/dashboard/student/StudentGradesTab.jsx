import React, { useState, useEffect } from "react";
import { Table, Badge, Alert, Spinner } from "react-bootstrap";
import { supabase } from "../../../lib/supabase";

export default function StudentGradesTab({ user }) {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrades = async () => {
      const { data } = await supabase
        .from("grades")
        .select("*")
        .eq("student_id", user.id)
        .order("created_at", { ascending: false });
      setGrades(data || []);
      setLoading(false);
    };
    if (user) fetchGrades();
  }, [user]);

  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;
  if (grades.length === 0) return <Alert variant="light" className="text-center py-5">Belum ada nilai.</Alert>;

  return (
    <Table hover className="align-middle">
      <thead className="table-light">
        <tr><th>Mapel</th><th className="text-center">Nilai</th><th>Feedback</th></tr>
      </thead>
      <tbody>
        {grades.map((g) => (
          <tr key={g.id}>
            <td className="fw-bold">{g.subject}</td>
            <td className="text-center"><Badge bg={g.score >= 75 ? "success" : "warning"}>{g.score}</Badge></td>
            <td className="text-muted small">"{g.feedback || "-"}"</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}