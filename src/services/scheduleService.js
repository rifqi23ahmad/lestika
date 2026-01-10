import { supabase } from "../lib/supabase";

export const scheduleService = {
  // --- TEACHER METHODS (Yang sudah ada) ---
  async getTeacherSlots(teacherId) {
    const { data, error } = await supabase
      .from("teaching_slots")
      .select(`*, student:profiles!student_id ( full_name ) `)
      .eq("teacher_id", teacherId)
      .order("start_time", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createWeeklySlots(teacherId, { selectedDays, startTime, endTime, duration, subject }) {
    // ... (kode logic createWeeklySlots yang sebelumnya tetap sama) ...
    // Jika perlu saya tulis ulang logic panjangnya, kabari ya. 
    // Untuk mempersingkat, pastikan logic createWeeklySlots dari jawaban sebelumnya ada di sini.
    const slotsToInsert = [];
    const getNextDayDate = (dayIndex) => {
      const d = new Date();
      d.setDate(d.getDate() + ((dayIndex + 7 - d.getDay()) % 7));
      return d;
    };

    for (const dayIndex of selectedDays) {
      const anchorDate = getNextDayDate(dayIndex);
      let timeCursor = new Date(anchorDate);
      const [startH, startM] = startTime.split(":").map(Number);
      timeCursor.setHours(startH, startM, 0, 0);

      let dayEndTime = new Date(anchorDate);
      const [endH, endM] = endTime.split(":").map(Number);
      dayEndTime.setHours(endH, endM, 0, 0);

      while (timeCursor < dayEndTime) {
        const slotStart = new Date(timeCursor);
        const slotEnd = new Date(timeCursor.getTime() + duration * 60000);
        if (slotEnd > dayEndTime) break;

        slotsToInsert.push({
          teacher_id: teacherId,
          subject: subject,
          start_time: slotStart.toISOString(),
          end_time: slotEnd.toISOString(),
          status: "open",
          student_id: null,
        });
        timeCursor = slotEnd;
      }
    }

    if (slotsToInsert.length === 0) return 0;
    const { error } = await supabase.from("teaching_slots").insert(slotsToInsert);
    if (error) throw error;
    return slotsToInsert.length;
  },

  async updateSlot(slotId, payload) {
    const { error } = await supabase.from("teaching_slots").update(payload).eq("id", slotId);
    if (error) throw error;
  },

  async deleteSlot(slotId) {
    const { error } = await supabase.from("teaching_slots").delete().eq("id", slotId);
    if (error) throw error;
  },

  // --- STUDENT METHODS (BARU) ---
  
  // Ambil semua slot (Open & Booked) untuk ditampilkan di dashboard siswa
  async getAllSlots() {
    const { data, error } = await supabase
      .from("teaching_slots")
      .select(`*, teacher:profiles!teacher_id ( full_name )`)
      .order("start_time", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Handle Booking & Cancel sekaligus
  async toggleBooking(slotId, studentId, isBooking) {
    const updates = isBooking 
      ? { status: "booked", student_id: studentId }   // Booking
      : { status: "open", student_id: null };         // Cancel

    const { error } = await supabase
      .from("teaching_slots")
      .update(updates)
      .eq("id", slotId);
      
    if (error) throw error;
  }
};