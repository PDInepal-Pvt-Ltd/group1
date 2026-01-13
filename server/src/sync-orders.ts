import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from "./generated/prisma/client";
const connectionString = `${process.env.DATABASE_URL}`

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function syncOrderStatus() {
  console.log("Starting synchronization...");

  try {
    // 1. Fetch all orders that are not deleted
    const orders = await prisma.order.findMany({
      where: { deletedAt: null },
      include: {
        kdsEvents: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
    });

    let updatedCount = 0;

    for (const order of orders) {
      const latestEvent = order.kdsEvents[0];

      // 2. Check if the order status differs from the latest event status
      if (latestEvent && order.status !== latestEvent.status) {
        console.log(`Syncing Order ${order.id}: ${order.status} -> ${latestEvent.status}`);
        
        await prisma.order.update({
          where: { id: order.id },
          data: { status: latestEvent.status },
        });
        
        updatedCount++;
      }
    }

    console.log(`Successfully synchronized ${updatedCount} orders.`);
  } catch (error) {
    console.error("Error during sync:", error);
  } finally {
    await prisma.$disconnect();
  }
}

syncOrderStatus();