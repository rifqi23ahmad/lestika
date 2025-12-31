import { supabase } from '../lib/supabase';

export const invoiceService = {
  create: async (registrationData, selectedPackage) => {
    const adminFee = 15000;
    const total = Number(selectedPackage.price) + adminFee;
    const invoiceNo = `INV/MAPA/${new Date().getFullYear()}/${Math.floor(Math.random() * 10000)}`;
    const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const payload = {
      invoice_no: invoiceNo,
      student_name: registrationData.name,
      student_data: registrationData,
      package_id: selectedPackage.id,
      amount: total,
      due_date: dueDate,
      status: 'pending'
    };

    const { data, error } = await supabase
      .from('invoices')
      .insert([payload])
      .select();

    if (error) throw error;
    
    // Return format yang sesuai untuk UI
    return {
      ...data[0],
      no: data[0].invoice_no,
      date: new Date(data[0].created_at).toLocaleDateString('id-ID'),
      dueDate: new Date(data[0].due_date).toLocaleDateString('id-ID'),
      student: registrationData,
      package: selectedPackage,
      adminFee: adminFee,
      total: total
    };
  }
};