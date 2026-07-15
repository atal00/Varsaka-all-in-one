import React from 'react';
import { getBlockedIps } from '@/actions/security';
import SecurityList from './SecurityList';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export default async function AdminSecurityPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.email !== 'invoice@varsaka.com') {
    redirect('/dashboard');
  }

  const ips = await getBlockedIps();

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem', color: 'var(--text-primary)' }}>
        IP Security Management
      </h1>
      <SecurityList initialIps={ips} />
    </div>
  );
}
