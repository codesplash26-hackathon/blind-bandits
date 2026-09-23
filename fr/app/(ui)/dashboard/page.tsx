'use client';

import { Suspense, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
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

function DashboardContent() {
  const { role, loginAs, isLoading } = useAuth();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get('role');

  useEffect(() => {
    if (roleParam === 'tourist' && role !== 'TOURIST') {
      loginAs('TOURIST');
    } else if (roleParam === 'admin' && role !== 'ADMIN') {
      loginAs('ADMIN');
    }
  }, [roleParam, role, loginAs]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader label="Initializing session..." />
      </div>
    );
  }

  const effectiveRole = roleParam === 'tourist' ? 'TOURIST' : (roleParam === 'admin' ? 'ADMIN' : role);

  if (effectiveRole === 'ADMIN') {
    return <AdminDashboard />;
  }

  return <TouristDashboard />;
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader label="Loading dashboard..." />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
