import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type TaskUpdateData = {
  updatedAt: Date;
  title?: string;
  description?: string | null;
  position?: number;
  archived?: boolean;
  completed?: boolean;
  completedAt?: Date | null;
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, completed, archived, position, tagIds } = body;

    const updateData: TaskUpdateData = { updatedAt: new Date() };

    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined)
      updateData.description = description?.trim() || null;
    if (position !== undefined) updateData.position = position;
    if (archived !== undefined) updateData.archived = archived;

    // Handle completion toggle
    if (completed !== undefined) {
      updateData.completed = completed;
      updateData.completedAt = completed ? new Date() : null;

      // When marking as complete, move to bottom of list
      if (completed) {
        const lastTask = await prisma.task.findFirst({
          where: { archived: false },
          orderBy: { position: "desc" },
        });
        updateData.position = lastTask ? lastTask.position + 1 : 1;
      }
    }

    // Handle tag updates if provided
    if (tagIds !== undefined) {
      // Delete existing tags and recreate
      await prisma.taskTag.deleteMany({
        where: { taskId: id },
      });

      if (tagIds.length > 0) {
        await prisma.taskTag.createMany({
          data: tagIds.map((tagId: string) => ({
            taskId: id,
            tagId,
          })),
        });
      }
    }

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("Failed to update task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
