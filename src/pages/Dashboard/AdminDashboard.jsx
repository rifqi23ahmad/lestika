import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useDashboardData = (userId = null, isAdmin = false) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('price');
      
      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error("Error fetching packages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  return { packages, loading, refetch: fetchPackages };
};