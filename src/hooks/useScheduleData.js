import { useState, useEffect } from "react";
import { scheduleService } from "../services/scheduleService"; // Path ke service global
import { format } from "date-fns";
import { id } from "date-fns/locale";

export function useScheduleData({ user, showModal }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [confirmModal, setConfirmModal] = useState({
    show: false,
    slot: null,
  });

  useEffect(() => {
    if (user) fetchSlots();
  }, [user]);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const data = await scheduleService.getAllSlots();
      setSlots(data);
    } catch (error) {
      console.error(error);
      if (showModal) showModal("Error", "Gagal memuat jadwal.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSlotClick = (slot) => {
    if (
      slot.status === "booked" &&
      slot.student_id &&
      slot.student_id !== user.id
    ) {
      return;
    }
    setConfirmModal({ show: true, slot: slot });
  };

  const processBooking = async () => {
    if (!confirmModal.slot) return;
    setBookingLoading(true);

    try {
      const slot = confirmModal.slot;
      const isMySlot = slot.student_id === user.id;

      const isBooking = !isMySlot;

      await scheduleService.toggleBooking(slot.id, user.id, isBooking);

      if (showModal) {
        showModal(
          "Berhasil",
          isBooking
            ? "Jadwal berhasil dibooking!"
            : "Jadwal berhasil dibatalkan.",
          "success"
        );
      }

      setConfirmModal({ show: false, slot: null });
      fetchSlots();
    } catch (err) {
      if (showModal) showModal("Gagal", err.message, "error");
    } finally {
      setBookingLoading(false);
    }
  };

  const getDayNameFromDate = (dateStr) => {
    try {
      return format(new Date(dateStr), "EEEE", { locale: id });
    } catch (e) {
      return "-";
    }
  };

  const formatTime = (dateStr) => {
    try {
      return format(new Date(dateStr), "HH:mm");
    } catch (e) {
      return "-";
    }
  };

  return {
    slots,
    loading,
    bookingLoading,
    confirmModal,
    setConfirmModal,
    handleSlotClick,
    processBooking,
    getDayNameFromDate,
    formatTime,
    refreshSlots: fetchSlots, // Expose fungsi refresh jika butuh dipanggil manual
  };
}
