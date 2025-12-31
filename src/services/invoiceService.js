import { supabase } from '../lib/supabase';

export const invoiceService = {
  // Tambahkan parameter userId dan userEmail
  create: async (registrationData, selectedPackage, userId, userEmail) => {
    const adminFee = 15000;
    const total = Number(selectedPackage.price) + adminFee;
    const invoiceNo = `INV/MAPA/${new Date().getFullYear()}/${Math.floor(Math.random() * 10000)}`;
    const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const payload = {
      invoice_no: invoiceNo,
      user_id: userId,        // SIMPAN ID (Kunci Utama)
      email: userEmail,       // SIMPAN EMAIL (Cadangan)
      student_name: registrationData.name,
      student_data: registrationData,
      package_id: selectedPackage.id,
      amount: total,          // Pastikan nama kolom di DB 'amount' atau 'total_amount' (sesuaikan DB anda)
      total_amount: total,    // Jaga-jaga jika anda pakai total_amount
      due_date: dueDate,
      status: 'unpaid',       // Default biasanya unpaid/pending
      package_name: selectedPackage.title, // Simpan nama paket biar gampang query
      package_price: selectedPackage.price,
      admin_fee: adminFee
    };

    const { data, error } = await supabase
      .from('invoices')
      .insert([payload])
      .select();

    if (error) throw error;
    
    return data[0];
  }
};