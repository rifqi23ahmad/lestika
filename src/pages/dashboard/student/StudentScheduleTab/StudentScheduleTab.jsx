import React from "react";
import { Spinner, Alert } from "react-bootstrap";
import { useScheduleData } from "./useScheduleData";
import WeeklyBoard from "./WeeklyBoard";
import MobileSchedule from "./MobileSchedule";
import ConfirmModal from "./ConfirmModal";
import { useIsMobile } from "./useIsMobile";

export default function StudentScheduleTab({ user, showModal }) {
  const isMobile = useIsMobile();
  const schedule = useScheduleData({ user, showModal });

  if (schedule.loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (!schedule.slots.length) {
    return (
      <Alert variant="light" className="text-center py-5">
        Belum ada jadwal tersedia.
      </Alert>
    );
  }

  return (
    <>
      {isMobile ? (
        <MobileSchedule {...schedule} user={user} />
      ) : (
        <WeeklyBoard {...schedule} user={user} />
      )}

      <ConfirmModal
        show={schedule.confirmModal.show}
        slot={schedule.confirmModal.slot}
        loading={schedule.bookingLoading}
        onCancel={() =>
          schedule.setConfirmModal({ show: false, slot: null })
        }
        onConfirm={schedule.processBooking}
        getDayName={schedule.getDayNameFromDate}
        formatTime={schedule.formatTime}
      />
    </>
  );
}
