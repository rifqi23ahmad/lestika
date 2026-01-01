import { supabase } from "../lib/supabase";

export const packageService = {
  async getAll() {
    const { data, error } = await supabase
      .from("packages")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;
    return data;
  },

  async create(pkg) {
    const { data, error } = await supabase
      .from("packages")
      .insert([pkg])
      .select();

    if (error) throw error;
    return data[0];
  },

  async update(id, pkg) {
    const { data, error } = await supabase
      .from("packages")
      .update(pkg)
      .eq("id", id)
      .select();

    if (error) throw error;
    return data[0];
  },

  async delete(id) {
    const { error } = await supabase.from("packages").delete().eq("id", id);

    if (error) throw error;
    return true;
  },
};
