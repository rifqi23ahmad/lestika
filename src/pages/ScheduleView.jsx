import React, { useEffect, useState } from "react";
import { Container, Card, Button, Spinner, Badge } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { Lock, Clock, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ScheduleView() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [hasPaid, setHasPaid] = useState(false);
  const [mySchedules, setMySchedules] = useState([]);

  useEffect(() => {
    checkPaymentAndFetchData();
  }, [user]);

  const checkPaymentAndFetchData = async () => {
    if (!user) return;
    try {
      const { data: invoices } = await supabase
        .from("invoices")
        .select("id, expiry_date")
        .eq("user_id", user.id)
        .eq("status", "paid")
        .order("created_at", { ascending: false });

      const activeInvoice = invoices?.find((inv) => {
        if (!inv.expiry_date) return true;
        return new Date(inv.expiry_date) > new Date();
      });

      const isAccessGranted = !!activeInvoice;
      setHasPaid(isAccessGranted);

      if (isAccessGranted) {
        await fetchMySchedules();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMySchedules = async () => {
    const { data } = await supabase
      .from("teaching_slots")
      .select(`*, teacher:profiles!teacher_id(full_name)`)
      .eq("student_id", user.id)
      .order("start_time", { ascending: true });
    setMySchedules(data || []);
  };

  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );

  if (!hasPaid) {
    return (
      <Container className="py-5 text-center">
        <div className="d-inline-block p-4 rounded-circle bg-light mb-3">
          <Lock size={48} className="text-secondary" />
        </div>
        <h3 className="fw-bold">Akses Jadwal Terkunci</h3>
        <p className="text-muted mw-50 mx-auto">
          Silakan beli paket terlebih dahulu untuk melihat jadwal.
        </p>
        <Button variant="primary" onClick={() => navigate("/dashboard")}>
          Cek Status Paket
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex align-items-center mb-4">
        <CheckCircle size={24} className="me-2 text-primary" />
        <h4 className="fw-bold mb-0">Jadwal Saya</h4>
      </div>

      <Card className="shadow-sm border-0">
        <Card.Body>
          {mySchedules.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <Clock size={48} className="mb-3 opacity-50" />
              <p>Anda belum memiliki jadwal rutin.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Hari</th>
                    <th>Jam</th>
                    <th>Mata Pelajaran</th>
                    <th>Pengajar</th>
                  </tr>
                </thead>
                <tbody>
                  {mySchedules.map((slot) => (
                    <tr key={slot.id}>
                      <td className="fw-bold text-primary">
                        {new Date(slot.start_time).toLocaleDateString("id-ID", {
                          weekday: "long",
                        })}
                      </td>
                      <td>
                        <Badge bg="light" text="dark" className="border fs-6">
                          {new Date(slot.start_time).toLocaleTimeString(
                            "id-ID",
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                        </Badge>
                      </td>
                      <td>{slot.subject}</td>
                      <td>{slot.teacher?.full_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
