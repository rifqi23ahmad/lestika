import { supabase } from '../lib/supabase';

export const invoiceService = {
  create: async (registrationData, selectedPackage, userId, userEmail) => {
    // 1. Hitung Biaya
    const adminFee = 15000;
    const total = Number(selectedPackage.price) + adminFee;
    
    // 2. Buat Nomor Invoice
    const invoiceNo = `INV-${Date.now()}`;

    // 3. Payload: HANYA gunakan kolom yang ada di kode asli RegisterView kamu.
    // Jangan tambah kolom user_id/email/due_date jika belum bikin kolomnya di database.
    const payload = {
      invoice_no: invoiceNo,
      
      // Data Siswa
      student_name: registrationData.name,
      student_jenjang: registrationData.jenjang || '-',
      student_kelas: registrationData.kelas || '-',
      student_whatsapp: registrationData.whatsapp || '-',
      
      // Data Paket
      package_id: selectedPackage.id,
      package_name: selectedPackage.title,
      package_price: selectedPackage.price,
      
      // Biaya
      admin_fee: adminFee,
      total_amount: total, // Pastikan ini 'total_amount', bukan 'amount'
      
      // Status
      status: 'unpaid' 
      // payment_proof_url: null (default null dari database biasanya)
    };

    // 4. Debugging: Cek di Console browser jika masih error
    console.log("Mengirim payload invoice:", payload);

    const { data, error } = await supabase
      .from('invoices')
      .insert([payload])
      .select();

    if (error) {
      console.error("Error Supabase:", error);
      throw error;
    }
    
    return data[0];
  }
};