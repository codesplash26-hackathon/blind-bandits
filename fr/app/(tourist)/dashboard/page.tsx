'use client';

import dynamic from 'next/dynamic';
import { useAuth } from '@/context/AuthContext';

const TouristDashboard = dynamic(() => import('@/components/tourist/TouristDashboard'));
const AdminDashboard = dynamic(() => import('@/components/admin/AdminDashboard'));

export default function DashboardPage() {
  const { role, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (role === 'ADMIN') {
    return <AdminDashboard />;
  }

  return <TouristDashboard />;
}
