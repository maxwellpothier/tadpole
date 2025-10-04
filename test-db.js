const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Create a test task
    const task = await prisma.task.create({
      data: {
        title: "Test Task",
        description: "This is a test task from the database setup",
        position: 1
      }
    });
    console.log("✅ Database connected successfully!");
    console.log("Created task:", task);
    
    // Clean up - delete the test task
    await prisma.task.delete({
      where: { id: task.id }
    });
    console.log("Test task deleted.");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();