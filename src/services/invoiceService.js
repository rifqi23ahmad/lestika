import { supabase } from '../lib/supabase';
import { APP_CONFIG } from '../config/constants';

export const invoiceService = {
  /**
   * Menghitung total biaya berdasarkan paket
   * @param {number} packagePrice 
   */
  calculateTotal(packagePrice) {
    const price = Number(packagePrice);
    const adminFee = APP_CONFIG.FEES.ADMIN;
    return {
      packagePrice: price,
      adminFee: adminFee,
      total: price + adminFee
    };
  },

  /**
   * Membuat Invoice baru
   */
  async create(user, selectedPackage) {
    const { adminFee, total } = this.calculateTotal(selectedPackage.price);
    
    const invoiceNo = `${APP_CONFIG.INVOICE.PREFIX}-${Date.now()}`;

    const payload = {
      invoice_no: invoiceNo,
      student_name: user.name,
      student_jenjang: user.jenjang || '-',
      student_kelas: user.kelas || '-',
      student_whatsapp: user.whatsapp || '-',
      
      package_id: selectedPackage.id,
      package_name: selectedPackage.title,
      package_price: selectedPackage.price,
      
      admin_fee: adminFee,
      total_amount: total,
      
      status: APP_CONFIG.INVOICE.STATUS.UNPAID
    };

    const { data, error } = await supabase
      .from('invoices')
      .insert([payload])
      .select()
      .single(); // Gunakan single() agar return object, bukan array

    if (error) throw error;
    return data;
  },

  /**
   * Upload bukti bayar DAN update status invoice sekaligus
   * Ini membungkus proses bisnis "Konfirmasi Pembayaran"
   */
  async processPaymentConfirmation(invoiceId, userId, fileObj) {
    if (!fileObj) return null;

    try {
      const fileExt = fileObj.name.split('.').pop();
      const fileName = `pay_${invoiceId}_${userId}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
          .from('payments')
          .upload(fileName, fileObj);
      
      if (uploadError) throw uploadError;
      
      const { data: publicUrlData } = supabase.storage
          .from('payments')
          .getPublicUrl(fileName);

      const { data, error: updateError } = await supabase
        .from('invoices')
        .update({
          status: APP_CONFIG.INVOICE.STATUS.WAITING,
          payment_proof_url: publicUrlData.publicUrl
        })
        .eq('id', invoiceId)
        .select()
        .single();

      if (updateError) throw updateError;
      
      return data;

    } catch (error) {
      console.error("Payment Process Error:", error);
      throw error;
    }
  }
};