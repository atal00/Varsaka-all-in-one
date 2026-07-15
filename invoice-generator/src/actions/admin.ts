'use server';

import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

async function checkMasterAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.email !== 'invoice@varsaka.com') {
    throw new Error('Forbidden: Only the Master Admin can perform this action.');
  }
}

export async function getUsers() {
  await checkMasterAdmin();
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, createdAt: true },
    orderBy: { createdAt: 'desc' }
  });
  return users;
}

export async function deleteUser(id: string) {
  await checkMasterAdmin();
  
  const user = await prisma.user.findUnique({ where: { id } });
  if (user?.email === 'invoice@varsaka.com') {
    throw new Error('Forbidden: Cannot delete the Master Admin.');
  }

  await prisma.user.delete({ where: { id } });
  revalidatePath('/admin/users');
}

export async function createUser(data: FormData) {
  await checkMasterAdmin();

  const name = data.get('name') as string;
  const email = data.get('email') as string;
  const password = data.get('password') as string;

  if (!email || !password || !name) {
    throw new Error('All fields are required.');
  }
  
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long.');
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error('User with this email already exists.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword
    }
  });

  revalidatePath('/admin/users');
}
