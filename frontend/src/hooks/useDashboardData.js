import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API } from '@/config/api';

export function useDashboardData(dashboardType, dateRange) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (dateRange?.from) params.date_from = dateRange.from.toISOString().slice(0, 10);
      if (dateRange?.to) params.date_to = dateRange.to.toISOString().slice(0, 10);
      const res = await axios.get(`${API}/dashboard/${dashboardType}`, {
        params,
        withCredentials: true,
      });
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [dashboardType, dateRange]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
