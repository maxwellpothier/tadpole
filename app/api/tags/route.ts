import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(tags);
  } catch (error) {
    console.error("Failed to fetch tags:", error);
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, color } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (!color || !/^#[0-9A-F]{6}$/i.test(color)) {
      return NextResponse.json(
        { error: "Valid hex color is required" },
        { status: 400 }
      );
    }

    const tag = await prisma.tag.create({
      data: {
        name: name.trim(),
        color,
      },
    });

    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    console.error("Failed to create tag:", error);

    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Tag with this name already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create tag" },
      { status: 500 }
    );
  }
}
