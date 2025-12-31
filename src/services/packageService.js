import { supabase } from '../lib/supabase';

export const packageService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .order('id', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  create: async (pkg) => {
    const { data, error } = await supabase
      .from('packages')
      .insert([pkg])
      .select();
    if (error) throw error;
    return data[0];
  },

  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('packages')
      .update(updates)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },

  delete: async (id) => {
    const { error } = await supabase
      .from('packages')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
};