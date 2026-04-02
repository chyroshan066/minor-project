"use client";

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/axios';
import { access } from 'fs';
import { useAuthStore } from '@/store/authStore';

export interface DashboardStats {
  todayRevenue: number;
  pendingAppointments: number;
  newRegistrations: number;
  unpaidInvoices: number;
}

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { accessToken } = useAuthStore();

  const fetchStats = async () => {
    try {
      if (!accessToken) {
        setLoading(false);
        return;
      }

      setLoading(true);
      // Ensure your axios instance has the Authorization header set with the JWT
      const response = await apiClient.get('/dashboard/stats');
      console.log('Dashboard stats response:', response.data); // Debug log
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, error, refresh: fetchStats };
};