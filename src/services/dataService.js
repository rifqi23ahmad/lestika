import { supabase } from '../lib/supabaseClient';

export const dataService = {
  getPackages: async () => {
    const { data, error } = await supabase.from('packages').select('*').order('price');
    if (error) throw error;
    return data;
  },

  savePackage: async (pkgData, isUpdate = false) => {
    if (isUpdate) {
      return await supabase.from('packages').update(pkgData).eq('id', pkgData.id);
    }
    return await supabase.from('packages').insert(pkgData);
  },

  deletePackage: async (id) => {
    return await supabase.from('packages').delete().eq('id', id);
  },
  
  // ... tambahkan method untuk invoices, landing_settings, dll di sini
};