import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcrypt';
import { PrismaClient } from "./generated/prisma/client";
const connectionString = `${process.env.DATABASE_URL}`

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

import { Role, TableStatus } from "./generated/prisma/client";
// import { qrCodeService } from "./common/services/qrCodeService";


async function main() {
  console.log("--- Cleaning Database ---")
  await prisma.menuItemAllergen.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();
  // await prisma.table.deleteMany();
  console.log("--- Starting Seed ---");



  // 1. SEED TABLES (Physical layout of your restaurant)
  // const tables = [
  //   { name: 'Table 1', seats: 2 },
  //   { name: 'Table 2', seats: 4 },
  //   { name: 'Table 3', seats: 4 },
  //   { name: 'Booth A', seats: 6 },
  //   { name: 'Bar 1',   seats: 1 },
  // ];

  // for (const t of tables) {
  //   await prisma.table.upsert({
  //     where: { name: t.name },
  //     update: {},
  //     create: { ...t, status: TableStatus.AVAILABLE },
  //   });
  // }
  // console.log("✅ Tables seeded");

//   // After seeding tables
// const dbtables = await prisma.table.findMany({});
// for (const table of dbtables) {
//   const qrCode = await qrCodeService.generateTableQrCode(table.id);
//   if (qrCode) {
//     await prisma.table.update({
//       where: { id: table.id },
//       data: { qrCodeUrl: qrCode },
//     });
//   }
// }   

const hashedPassword = await bcrypt.hash('password', 10);
  // 2. SEED USERS (Staff members)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@restaurant.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@restaurant.com',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });
  console.log("✅ Admin user seeded");

  // 3. FETCH API DATA
  const response = await fetch('https://dummyjson.com/recipes?limit=50');
  const { recipes } = await response.json();

  // 4. SEED MENU, CATEGORIES, AND ALLERGENS
  for (const recipe of recipes) {
    // A. Handle Category
    const category = await prisma.category.upsert({
      where: { name: recipe.cuisine },
      update: {},
      create: { name: recipe.cuisine },
    });

    // B. Create MenuItem
    const menuItem = await prisma.menuItem.create({
      data: {
        name: recipe.name,
        description: recipe.instructions.join(' ').substring(0, 199),
        price: (Math.random() * (30 - 10) + 10).toFixed(2), // Random price $10-$30
        imageUrl: recipe.image,
        isVeg: recipe.tags.includes('Vegetarian') || recipe.tags.includes('Salad'),
        categoryId: category.id,
      },
    });

    // C. Handle Allergens (Smart mapping from ingredients)
    const commonAllergens = ['Dairy', 'Nuts', 'Gluten', 'Seafood'];
    const ingredientsString = recipe.ingredients.join(' ').toLowerCase();

    for (const allergenName of commonAllergens) {
      // Basic logic to detect allergens from ingredients list
      const match = (allergenName === 'Dairy' && ingredientsString.match(/cheese|milk|butter|cream/)) ||
                    (allergenName === 'Gluten' && ingredientsString.match(/flour|pasta|bread|dough/)) ||
                    (allergenName === 'Nuts' && ingredientsString.match(/nut|almond|peanut/)) ||
                    (allergenName === 'Seafood' && ingredientsString.match(/shrimp|fish|prawn/));

      if (match) {
        const allergen = await prisma.allergen.upsert({
          where: { name: allergenName },
          update: {},
          create: { name: allergenName },
        });

        await prisma.menuItemAllergen.create({
          data: {
            menuItemId: menuItem.id,
            allergenId: allergen.id,
          },
        });
      }
    }
  }

  console.log("✅ Menu, Categories, and Allergens seeded");
  console.log("--- Seed Finished Successfully ---");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });