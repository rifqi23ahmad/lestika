import { useState, useEffect } from 'react';
import { dataService } from '../services/dataService';

export const useDashboardData = (user, isAdmin) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const data = await dataService.getPackages();
      setPackages(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchPackages();
  }, [user]);

  return { packages, loading, refetch: fetchPackages };
};