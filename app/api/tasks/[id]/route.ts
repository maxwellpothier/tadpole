import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { title, description, completed, archived, position } = body;

    const updateData: any = { updatedAt: new Date() };

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

    const task = await prisma.task.update({
      where: { id: params.id },
      data: updateData,
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
  { params }: { params: { id: string } }
) {
  try {
    await prisma.task.delete({
      where: { id: params.id },
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
