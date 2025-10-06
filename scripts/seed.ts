import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const tasks = [
  {
    title: "Review project documentation",
    description: "Go through the technical implementation guide and ensure all sections are up to date",
  },
  {
    title: "Update dependencies",
    description: "Check for outdated npm packages and update to latest stable versions",
  },
  {
    title: "Write unit tests",
    description: "Add test coverage for API endpoints and core components",
  },
  {
    title: "Optimize database queries",
    description: "Review Prisma queries and add indexes where needed for performance",
  },
  {
    title: "Implement error logging",
    description: "Set up error tracking with Sentry or similar service",
  },
  {
    title: "Design mobile layout",
    description: "Create responsive designs for smaller screen sizes",
  },
  {
    title: "Add keyboard shortcuts",
    description: "Implement Cmd+K for search and other productivity shortcuts",
  },
  {
    title: "Configure CI/CD pipeline",
    description: "Set up automated testing and deployment with GitHub Actions",
  },
  {
    title: "Research authentication solutions",
    description: "Evaluate NextAuth.js, Clerk, and other auth providers for Phase 3",
  },
  {
    title: "Create API documentation",
    description: "Document all API endpoints with request/response examples",
  },
  {
    title: "Refactor component structure",
    description: "Reorganize components for better maintainability and reusability",
  },
  {
    title: "Add loading states",
    description: "Implement skeleton loaders and loading indicators throughout the app",
  },
  {
    title: "Set up analytics",
    description: "Integrate Google Analytics or Plausible for usage tracking",
  },
  {
    title: "Implement search functionality",
    description: "Add full-text search across task titles and descriptions",
  },
  {
    title: "Create dark mode",
    description: "Design and implement dark theme with theme toggle",
  },
  {
    title: "Add data export feature",
    description: "Allow users to export tasks to JSON or CSV format",
  },
  {
    title: "Optimize bundle size",
    description: "Analyze webpack bundle and reduce unnecessary dependencies",
  },
  {
    title: "Write integration tests",
    description: "Add E2E tests with Playwright or Cypress",
  },
  {
    title: "Improve accessibility",
    description: "Run WCAG audit and fix any accessibility issues",
  },
  {
    title: "Add task filtering",
    description: "Implement filters for status, date range, and other criteria",
  },
  {
    title: "Set up staging environment",
    description: "Create separate staging deployment for testing before production",
  },
  {
    title: "Implement rate limiting",
    description: "Add rate limiting to API endpoints to prevent abuse",
  },
  {
    title: "Create user onboarding",
    description: "Design and implement welcome tour for new users",
  },
  {
    title: "Add task templates",
    description: "Allow users to create and save task templates for reuse",
  },
  {
    title: "Performance monitoring",
    description: "Set up performance monitoring with Vercel Analytics or similar",
  },
];

async function main() {
  console.log("Starting database seed...");

  // Clear existing tasks (optional - comment out if you want to keep existing data)
  await prisma.task.deleteMany({});
  console.log("Cleared existing tasks");

  // Create tasks with incrementing positions
  for (let i = 0; i < tasks.length; i++) {
    const task = await prisma.task.create({
      data: {
        title: tasks[i].title,
        description: tasks[i].description,
        position: i + 1,
        completed: false,
        archived: false,
      },
    });
    console.log(`Created task ${i + 1}/25: ${task.title}`);
  }

  console.log("\nSeed completed successfully!");
  console.log(`Created ${tasks.length} tasks`);
}

main()
  .catch((e) => {
    console.error("Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
