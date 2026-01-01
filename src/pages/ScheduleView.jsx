import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  Button,
  Spinner,
  Badge,
  Tab,
  Tabs,
  Alert,
  Modal,
  Row,
  Col,
} from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import {
  Lock,
  Clock,
  CheckCircle,
  PlusCircle,
  Calendar,
  HelpCircle,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ScheduleView() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [hasPaid, setHasPaid] = useState(false);
  const [mySchedules, setMySchedules] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [targetSlot, setTargetSlot] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoModalContent, setInfoModalContent] = useState({
    title: "",
    msg: "",
    type: "success",
  });

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
        await Promise.all([fetchMySchedules(), fetchAvailableSlots()]);
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

  const fetchAvailableSlots = async () => {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("teaching_slots")
      .select(`*, teacher:profiles!teacher_id(full_name)`)
      .is("student_id", null)
      .eq("status", "open")
      .order("start_time", { ascending: true });

    if (error) console.error("Error fetching slots:", error);
    setAvailableSlots(data || []);
  };

  const initiateBooking = (slot) => {
    setTargetSlot(slot);
    setShowConfirmModal(true);
  };

  const handleConfirmBooking = async () => {
    if (!targetSlot) return;
    setBookingLoading(true);
    setShowConfirmModal(false);

    try {
      const { error } = await supabase
        .from("teaching_slots")
        .update({
          student_id: user.id,
          status: "booked",
        })
        .eq("id", targetSlot.id)
        .is("student_id", null);

      if (error) throw error;

      setInfoModalContent({
        title: "Berhasil!",
        msg: "Jadwal rutin berhasil diambil.",
        type: "success",
      });
      setShowInfoModal(true);

      await Promise.all([fetchMySchedules(), fetchAvailableSlots()]);
    } catch (err) {
      console.error(err);
      setInfoModalContent({
        title: "Gagal!",
        msg: "Slot sudah diambil orang lain.",
        type: "error",
      });
      setShowInfoModal(true);
      fetchAvailableSlots();
    } finally {
      setBookingLoading(false);
      setTargetSlot(null);
    }
  };

  const groupAvailableByDay = () => {
    const grouped = {};
    daysOrder.forEach((day) => (grouped[day] = []));

    availableSlots.forEach((slot) => {
      const date = new Date(slot.start_time);
      const dayName = date.toLocaleDateString("id-ID", { weekday: "long" });

      if (grouped[dayName]) {
        grouped[dayName].push(slot);
      }
    });
    return grouped;
  };

  const groupedAvailable = groupAvailableByDay();

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
          Silakan beli paket terlebih dahulu untuk mengakses pemilihan jadwal.
        </p>
        <Button variant="primary" onClick={() => navigate("/dashboard")}>
          Cek Status Paket
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Tabs defaultActiveKey="booking" className="mb-4 custom-tabs">
        {/* TAB 1: PILIH JADWAL BARU */}
        <Tab
          eventKey="booking"
          title={
            <>
              <PlusCircle size={18} className="me-2" />
              Pilih Jadwal Rutin
            </>
          }
        >
          <Card className="shadow-sm border-0 bg-light">
            <Card.Body>
              {availableSlots.length === 0 ? (
                <Alert
                  variant="warning"
                  className="d-flex align-items-center justify-content-center py-5"
                >
                  <Calendar className="me-3" size={32} />
                  <div className="text-start">
                    <strong>Tidak ada slot kosong.</strong>
                    <br />
                    Guru belum membuka jadwal rutin.
                  </div>
                </Alert>
              ) : (
                daysOrder.map((dayName) => {
                  const daySlots = groupedAvailable[dayName];
                  if (!daySlots || daySlots.length === 0) return null;

                  return (
                    <div key={dayName} className="mb-4">
                      <h5 className="fw-bold text-primary border-bottom pb-2 mb-3 d-flex align-items-center">
                        <Calendar size={20} className="me-2" />
                        Hari {dayName}
                      </h5>
                      <Row className="g-3">
                        {daySlots.map((slot) => (
                          <Col md={6} lg={4} key={slot.id}>
                            <div className="border rounded p-3 h-100 bg-white shadow-sm d-flex flex-column hover-shadow transition">
                              <div className="mb-3 text-center">
                                <Badge bg="info" text="dark" className="mb-2">
                                  {slot.subject}
                                </Badge>

                                <div className="py-2">
                                  <div className="text-dark fw-bold fs-3">
                                    {new Date(
                                      slot.start_time
                                    ).toLocaleTimeString("id-ID", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </div>
                                  <div className="text-muted small">
                                    Selesai:{" "}
                                    {new Date(slot.end_time).toLocaleTimeString(
                                      "id-ID",
                                      { hour: "2-digit", minute: "2-digit" }
                                    )}
                                  </div>
                                </div>

                                <div className="text-muted small mt-2 pt-2 border-top">
                                  Pengajar:{" "}
                                  <strong>
                                    {slot.teacher?.full_name || "Tim Pengajar"}
                                  </strong>
                                </div>
                              </div>

                              <Button
                                variant="primary"
                                className="w-100 mt-auto fw-bold"
                                onClick={() => initiateBooking(slot)}
                                disabled={bookingLoading}
                              >
                                {bookingLoading ? "..." : "Pilih Jadwal"}
                              </Button>
                            </div>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  );
                })
              )}
            </Card.Body>
          </Card>
        </Tab>

        {/* TAB 2: JADWAL SAYA */}
        <Tab
          eventKey="myschedule"
          title={
            <>
              <CheckCircle size={18} className="me-2" />
              Jadwal Saya
            </>
          }
        >
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
                            {new Date(slot.start_time).toLocaleDateString(
                              "id-ID",
                              { weekday: "long" }
                            )}
                          </td>
                          <td>
                            <Badge
                              bg="light"
                              text="dark"
                              className="border fs-6"
                            >
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
        </Tab>
      </Tabs>

      {/* MODAL KONFIRMASI */}
      <Modal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        centered
      >
        <Modal.Body className="p-4 text-center">
          <div className="mx-auto mb-3 p-3 bg-blue-100 rounded-full w-fit text-blue-600">
            <HelpCircle size={32} />
          </div>
          <h5 className="fw-bold mb-2">Ambil Jadwal Rutin?</h5>
          <p className="text-muted mb-4">
            Anda akan mengambil kelas rutinitas setiap hari <br />
            <strong>
              {targetSlot &&
                new Date(targetSlot.start_time).toLocaleDateString("id-ID", {
                  weekday: "long",
                })}
            </strong>{" "}
            jam{" "}
            <strong>
              {targetSlot &&
                new Date(targetSlot.start_time).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
            </strong>
            ?
          </p>
          <div className="d-flex justify-content-center gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowConfirmModal(false)}
            >
              Batal
            </Button>
            <Button variant="primary" onClick={handleConfirmBooking}>
              Ya, Ambil Rutin
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* MODAL INFO */}
      <Modal
        show={showInfoModal}
        onHide={() => setShowInfoModal(false)}
        centered
      >
        <Modal.Body className="p-4 text-center">
          <div
            className={`mx-auto mb-3 p-3 rounded-full w-fit ${
              infoModalContent.type === "success"
                ? "bg-green-100 text-green-600"
                : "bg-red-100 text-red-600"
            }`}
          >
            {infoModalContent.type === "success" ? (
              <CheckCircle size={32} />
            ) : (
              <XCircle size={32} />
            )}
          </div>
          <h5 className="fw-bold mb-2">{infoModalContent.title}</h5>
          <p className="text-muted">{infoModalContent.msg}</p>
          <Button
            variant="outline-dark"
            onClick={() => setShowInfoModal(false)}
          >
            Tutup
          </Button>
        </Modal.Body>
      </Modal>
    </Container>
  );
}
