import React, { useState, useEffect } from "react";
import {
  Accordion,
  Badge,
  Button,
  Modal,
  Spinner,
  Alert,
} from "react-bootstrap";
import { User, Check, HelpCircle } from "lucide-react";
import { supabase } from "../../../lib/supabase";

export default function StudentScheduleTab({ user, showModal }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ show: false, slot: null });
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchAvailableSlots();
  }, []);

  const fetchAvailableSlots = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("teaching_slots")
        .select(`*, teacher:profiles!teacher_id ( full_name )`)
        .order("start_time", { ascending: true });

      if (error) throw error;
      setSlots(data || []);
    } catch (err) {
      console.error("Gagal ambil jadwal:", err);
    } finally {
      setLoading(false);
    }
  };

  const processBooking = async () => {
    const slot = confirmModal.slot;
    if (!slot) return;
    setBookingLoading(true);
    try {
      const { error } = await supabase
        .from("teaching_slots")
        .update({ status: "booked", student_id: user.id })
        .eq("id", slot.id)
        .eq("status", "open");

      if (error) throw error;

      setConfirmModal({ show: false, slot: null });
      showModal("Berhasil", "Jadwal berhasil dipilih!", "success");
      fetchAvailableSlots();
    } catch (err) {
      setConfirmModal({ show: false, slot: null });
      showModal(
        "Gagal",
        "Jadwal gagal diambil (mungkin sudah terisi).",
        "error"
      );
      fetchAvailableSlots();
    } finally {
      setBookingLoading(false);
    }
  };

  const getDayNameFromDate = (dateString) => {
    const dayNames = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];
    const d = new Date(dateString);
    return dayNames[d.getDay()];
  };

  const groupSlotsByDayName = (slotList) => {
    const renderOrder = [
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
      "Minggu",
    ];
    const groups = {};
    renderOrder.forEach((d) => (groups[d] = []));

    slotList.forEach((slot) => {
      const dayName = getDayNameFromDate(slot.start_time);
      if (groups[dayName]) groups[dayName].push(slot);
    });
    return groups;
  };

  const formatTime = (dateString) =>
    new Date(dateString).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  if (slots.length === 0)
    return (
      <Alert variant="light" className="text-center py-5">
        Belum ada jadwal tersedia.
      </Alert>
    );

  const groupedSlots = groupSlotsByDayName(slots);
  const daysOrder = [
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
    "Minggu",
  ];

  return (
    <>
      <Accordion defaultActiveKey={["0"]} alwaysOpen>
        {daysOrder.map((day, index) => {
          const daySlots = groupedSlots[day];
          if (!daySlots?.length) return null;

          return (
            <Accordion.Item
              eventKey={index.toString()}
              key={day}
              className="mb-3 border rounded shadow-sm"
            >
              <Accordion.Header>
                <div className="d-flex align-items-center w-100 justify-content-between pe-3">
                  <span className="fw-bold text-primary">{day}</span>
                  <Badge bg="secondary" pill>
                    {daySlots.length} Sesi
                  </Badge>
                </div>
              </Accordion.Header>
              <Accordion.Body className="bg-light p-0">
                {daySlots.map((slot) => {
                  const isMySlot = slot.student_id === user.id;
                  const isBooked = slot.status === "booked" && !isMySlot;

                  return (
                    <div
                      key={slot.id}
                      className={`p-3 border-bottom bg-white d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 ${
                        isMySlot ? "bg-success bg-opacity-10" : ""
                      }`}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="text-center border rounded p-2 bg-white"
                          style={{ minWidth: "80px" }}
                        >
                          <div className="fw-bold fs-5 text-dark">
                            {formatTime(slot.start_time)}
                          </div>
                          <small
                            className="text-muted"
                            style={{ fontSize: "0.75rem" }}
                          >
                            {formatTime(slot.end_time)}
                          </small>
                        </div>
                        <div>
                          <div className="fw-bold text-dark fs-6">
                            {slot.subject}
                          </div>
                          <div className="text-primary small fw-medium mt-1 d-flex align-items-center">
                            <User size={14} className="me-1" />{" "}
                            {slot.teacher?.full_name || "Guru"}
                          </div>
                        </div>
                      </div>

                      <div className="d-flex justify-content-end">
                        {isMySlot ? (
                          <Badge bg="success" className="px-3 py-2">
                            <Check size={14} className="me-1" /> Milik Anda
                          </Badge>
                        ) : isBooked ? (
                          <Badge
                            bg="secondary"
                            className="px-3 py-2 opacity-50"
                          >
                            Terisi
                          </Badge>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            className="px-4 rounded-pill shadow-sm"
                            onClick={() =>
                              setConfirmModal({ show: true, slot })
                            }
                          >
                            Pilih
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </Accordion.Body>
            </Accordion.Item>
          );
        })}
      </Accordion>

      <Modal
        show={confirmModal.show}
        onHide={() => setConfirmModal({ show: false, slot: null })}
        centered
      >
        <Modal.Body className="text-center p-4">
          <div className="mx-auto mb-3 p-3 bg-primary bg-opacity-10 rounded-circle d-inline-flex text-primary">
            <HelpCircle size={32} />
          </div>
          <h5 className="fw-bold mb-3">Konfirmasi</h5>
          <p className="text-muted mb-4">
            Ambil jadwal <strong>{confirmModal.slot?.subject}</strong>
            <br />
            Hari{" "}
            {confirmModal.slot &&
              getDayNameFromDate(confirmModal.slot.start_time)}
            , Pukul{" "}
            {confirmModal.slot && formatTime(confirmModal.slot.start_time)}?
          </p>
          <div className="d-flex gap-2 justify-content-center">
            <Button
              variant="outline-secondary"
              onClick={() => setConfirmModal({ show: false, slot: null })}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              onClick={processBooking}
              disabled={bookingLoading}
            >
              {bookingLoading ? <Spinner size="sm" /> : "Ya, Ambil"}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
