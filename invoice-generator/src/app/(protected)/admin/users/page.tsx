import React from 'react';
import { getUsers } from '@/actions/admin';
import UserList from './UserList';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.email !== 'invoice@varsaka.com') {
    redirect('/dashboard');
  }

  const users = await getUsers();

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem', color: 'var(--text-primary)' }}>
        User Management
      </h1>
      <UserList initialUsers={users} />
    </div>
  );
}
