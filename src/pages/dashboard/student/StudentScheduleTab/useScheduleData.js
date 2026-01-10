import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";

export function useScheduleData({ user, showModal }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ show: false, slot: null });
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    if (user?.id) fetchSlots();
  }, [user?.id]);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("teaching_slots")
        .select(`*, teacher:profiles!teacher_id ( full_name )`)
        .order("start_time", { ascending: true });

      if (error) throw error;
      setSlots(data || []);
    } catch {
      showModal?.("Gagal", "Gagal memuat jadwal.", "error");
    } finally {
      setLoading(false);
    }
  };

  const processBooking = async () => {
    const slot = confirmModal.slot;
    if (!slot || !user?.id) return;

    setBookingLoading(true);
    try {
      const { error } = await supabase
        .from("teaching_slots")
        .update({
          status: "booked",
          student_id: user.id,
        })
        .eq("id", slot.id)
        .eq("status", "open");

      if (error) throw error;

      setConfirmModal({ show: false, slot: null });
      showModal?.("Berhasil", "Jadwal berhasil dipilih!", "success");
      fetchSlots();
    } catch {
      setConfirmModal({ show: false, slot: null });
      showModal?.(
        "Gagal",
        "Jadwal gagal diambil (mungkin sudah terisi).",
        "error"
      );
      fetchSlots();
    } finally {
      setBookingLoading(false);
    }
  };

  const getDayNameFromDate = (dateString) => {
    const days = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];
    return days[new Date(dateString).getDay()];
  };

  const formatTime = (dateString) =>
    new Date(dateString).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const groupSlotsByDayName = () => {
    const days = [
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
      "Minggu",
    ];
    const groups = {};
    days.forEach((d) => (groups[d] = []));

    slots.forEach((slot) => {
      const day = getDayNameFromDate(slot.start_time);
      if (groups[day]) groups[day].push(slot);
    });

    return groups;
  };

  return {
    slots,
    loading,
    confirmModal,
    bookingLoading,
    setConfirmModal,
    processBooking,
    formatTime,
    getDayNameFromDate,
    groupSlotsByDayName,
  };
}
