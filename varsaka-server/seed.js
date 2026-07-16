const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      apps: 'react,admin,invoice,blogs',
      isAdmin: true
    }
  });
  
  console.log('Seed: Created default admin user (admin / admin123)');

  const apps = ['react', 'admin', 'invoice', 'blogs'];
  for (const app of apps) {
    await prisma.appStatus.upsert({
      where: { id: app },
      update: {},
      create: { id: app, isOnline: true }
    });
  }
  
  console.log('Seed: Initialized all apps to online.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
