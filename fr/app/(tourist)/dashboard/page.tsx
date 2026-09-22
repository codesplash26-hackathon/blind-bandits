'use client';

import dynamic from 'next/dynamic';
import { useAuth } from '@/context/AuthContext';
import { Loader } from '@/components/Loader';

const TouristDashboard = dynamic(() => import('@/components/tourist/TouristDashboard'), {
  loading: () => (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader label="Loading tourist dashboard..." />
    </div>
  ),
});

const AdminDashboard = dynamic(() => import('@/components/admin/AdminDashboard'), {
  loading: () => (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader label="Loading authority dashboard..." />
    </div>
  ),
});

export default function DashboardPage() {
  const { role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader label="Initializing session..." />
      </div>
    );
  }

  if (role === 'ADMIN') {
    return <AdminDashboard />;
  }

  return <TouristDashboard />;
}
