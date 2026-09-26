import React from 'react';
import type { Metadata } from 'next';
import { AuthorityProfileContent } from '@/components/profile/AuthorityProfileContent';

export const metadata: Metadata = {
  title: 'Authority Official Profile | Sri Lanka Tourism Development Authority',
  description: 'Manage official clearance credentials, carrying capacity dispatch notifications, and jurisdictional oversight.',
};

export default function AdminProfilePage() {
  return (
    <div className="max-w-4xl mx-auto pb-16">
      <AuthorityProfileContent />
    </div>
  );
}
