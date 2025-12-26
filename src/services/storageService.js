import { supabase } from '../lib/supabaseClient';

export const storageService = {
  uploadFile: async (file, bucket = 'images', folder = 'public') => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (error) throw error;

      // Ambil Public URL
      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return { url: publicUrlData.publicUrl, error: null };
    } catch (error) {
      console.error('Upload Error:', error);
      return { url: null, error };
    }
  },

  deleteFile: async (path, bucket = 'images') => {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    return { error };
  }
};