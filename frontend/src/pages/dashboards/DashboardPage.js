import React, { useState } from 'react';
import { subMonths } from 'date-fns';
import DashboardTemplate from '@/components/DashboardTemplate';
import { useDashboardData } from '@/hooks/useDashboardData';

export default function DashboardPage({ dashboardType }) {
  const [dateRange, setDateRange] = useState({ from: subMonths(new Date(), 6), to: new Date() });
  const { data, loading, error, refetch } = useDashboardData(dashboardType, dateRange);

  return (
    <DashboardTemplate
      title={data?.title || 'Loading...'}
      subtitle={data?.subtitle || ''}
      level={data?.level || ''}
      tabs={data?.tabs || []}
      loading={loading}
      error={error}
      dateRange={dateRange}
      onDateChange={setDateRange}
      onRefresh={refetch}
    />
  );
}
