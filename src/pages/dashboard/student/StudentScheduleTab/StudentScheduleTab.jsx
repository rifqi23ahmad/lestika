import React from "react";
import { Spinner, Alert, Badge } from "react-bootstrap";
import { CheckCircle, Clock } from "lucide-react";
import ConfirmModal from "./ConfirmModal";

import { useScheduleData } from "../../../../hooks/useScheduleData"; // Global Hook
import { useIsMobile } from "../../../../hooks/useIsMobile"; // Global Hook

import WeeklyScheduleBoard from "../../../../components/schedule/WeeklyScheduleBoard";
import MobileScheduleList from "../../../../components/schedule/MobileScheduleList";

export default function StudentScheduleTab({ user, showModal }) {
  const isMobile = useIsMobile();
  const schedule = useScheduleData({ user, showModal });

  if (schedule.loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!schedule.slots || schedule.slots.length === 0) {
    return (
      <Alert variant="light" className="text-center py-5 shadow-sm border-0">
        <Clock size={48} className="text-muted mb-3 opacity-50" />
        <p className="mb-0 text-muted">Belum ada jadwal tersedia saat ini.</p>
      </Alert>
    );
  }

  const getSlotVariant = (slot) => {
    if (slot.student_id === user.id) return "primary";
    if (slot.status === "booked") return "secondary";
    return "success";
  };

  const renderSlotContent = (slot) => {
    const isMySlot = slot.student_id === user.id;
    const isBooked = slot.status === "booked" && !isMySlot;

    return (
      <div>
        <div className="fw-bold text-dark small mb-1">{slot.subject}</div>
        {isMySlot ? (
          <Badge
            bg="primary"
            className="fw-normal d-flex align-items-center w-fit gap-1"
            style={{ fontSize: "0.7rem" }}
          >
            <CheckCircle size={10} /> Terjadwal
          </Badge>
        ) : isBooked ? (
          <Badge
            bg="secondary"
            className="fw-normal"
            style={{ fontSize: "0.7rem" }}
          >
            Penuh
          </Badge>
        ) : (
          <div
            className="text-success small fw-bold"
            style={{ fontSize: "0.75rem" }}
          >
            Tersedia
          </div>
        )}
      </div>
    );
  };

  const handleSlotClick = (slot) => {
    if (slot.status === "booked" && slot.student_id !== user.id) return;
    schedule.handleSlotClick(slot);
  };

  const sharedProps = {
    slots: schedule.slots,
    onSlotClick: handleSlotClick,
    getSlotVariant: getSlotVariant,
    renderSlotContent: renderSlotContent,
  };

  return (
    <>
      {isMobile ? (
        <MobileScheduleList {...sharedProps} />
      ) : (
        <WeeklyScheduleBoard {...sharedProps} />
      )}

      <ConfirmModal
        show={schedule.confirmModal.show}
        slot={schedule.confirmModal.slot}
        loading={schedule.bookingLoading}
        onCancel={() => schedule.setConfirmModal({ show: false, slot: null })}
        onConfirm={schedule.processBooking}
        getDayName={schedule.getDayNameFromDate}
        formatTime={schedule.formatTime}
      />
    </>
  );
}
