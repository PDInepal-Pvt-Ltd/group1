import bcrypt from "bcrypt";
import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient, Role } from "./generated/prisma/client";
const connectionString = `${process.env.DATABASE_URL}`

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function seedStaffUsers() {
  const usersToSeed = [
    { email: "cashier@restaurant.com", name: "Cashier User", password: "cashier123", role: Role.CASHIER },
    { email: "waiter@restaurant.com", name: "Waiter User", password: "waiter123", role: Role.WAITER },
    { email: "kitchen@restaurant.com", name: "Kitchen User", password: "kitchen123", role: Role.KITCHEN },
  ];

  for (const userData of usersToSeed) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
      },
    });

    console.log(`✅ ${userData.role} user seeded: ${userData.email}`);
  }
}

seedStaffUsers()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
