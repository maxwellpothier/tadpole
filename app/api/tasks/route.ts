import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: { position: "asc" },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Failed to fetch tasks:", error);

    // Check if it's a database connection error
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch tasks";

    if (
      errorMessage.includes("Can't reach database") ||
      errorMessage.includes("prisma")
    ) {
      return NextResponse.json(
        {
          error: "Database connection failed. Please check DATABASE_URL.",
          details: errorMessage,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch tasks", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, tagIds } = body;

    console.log("Creating task with data:", { title, description, tagIds });

    if (!title || title.trim().length === 0) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const lastTask = await prisma.task.findFirst({
      where: { archived: false, completed: false },
      orderBy: { position: "desc" },
    });

    const newPosition = lastTask ? lastTask.position + 1 : 1;

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        position: newPosition,
        tags: tagIds && tagIds.length > 0
          ? {
              create: tagIds.map((tagId: string) => ({
                tag: { connect: { id: tagId } },
              })),
            }
          : undefined,
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    console.log("Created task:", task);

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Failed to create task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
