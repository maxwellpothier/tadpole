# Todo App - Technical Implementation Guide

## 1. Project Setup

### 1.1 Initialize Next.js Project

```bash
npx create-next-app@latest slick-todo-app
# Select: Yes to TypeScript, Yes to Tailwind, Yes to App Router, No to src directory
cd slick-todo-app
```

### 1.2 Install Dependencies

```bash
# Core dependencies
npm install @prisma/client @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install lucide-react

# Dev dependencies
npm install -D prisma
```

### 1.3 Environment Variables

Create `.env.local`:

```
DATABASE_URL="postgresql://username:password@host:26257/defaultdb?sslmode=verify-full"
```

## 2. Database Setup (CockroachDB + Prisma)

### 2.1 Initialize Prisma

```bash
npx prisma init
```

### 2.2 Prisma Schema

Update `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "cockroachdb"
  url      = env("DATABASE_URL")
}

model Todo {
  id          String    @id @default(uuid())
  title       String    @db.String(200)
  description String?   @db.String(2000)
  completed   Boolean   @default(false)
  archived    Boolean   @default(false)
  position    Float     @default(0)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  completedAt DateTime?

  @@index([archived, completed, position])
  @@index([title])
}
```

### 2.3 Run Migrations

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 2.4 Prisma Client Singleton

Create `lib/prisma.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

## 3. API Routes

### 3.1 API Route Structure

```
app/
  api/
    todos/
      route.ts           # GET (list), POST (create)
      [id]/
        route.ts         # GET, PATCH, DELETE
      reorder/
        route.ts         # POST (batch update positions)
```

### 3.2 GET /api/todos - List Todos

`app/api/todos/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const archived = searchParams.get("archived") === "true";
  const completed = searchParams.get("completed");

  try {
    const where: any = { archived };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (completed !== null) {
      where.completed = completed === "true";
    }

    const todos = await prisma.todo.findMany({
      where,
      orderBy: { position: "asc" },
    });

    return NextResponse.json(todos);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch todos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description } = body;

    if (!title || title.trim().length === 0) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Get the highest position to add to the end
    const lastTodo = await prisma.todo.findFirst({
      where: { archived: false, completed: false },
      orderBy: { position: "desc" },
    });

    const newPosition = lastTodo ? lastTodo.position + 1 : 1;

    const todo = await prisma.todo.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        position: newPosition,
      },
    });

    return NextResponse.json(todo, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create todo" },
      { status: 500 }
    );
  }
}
```

### 3.3 PATCH /api/todos/[id] - Update Todo

`app/api/todos/[id]/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const todo = await prisma.todo.findUnique({
      where: { id: params.id },
    });

    if (!todo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    return NextResponse.json(todo);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch todo" },
      { status: 500 }
    );
  }
}

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
        const lastTodo = await prisma.todo.findFirst({
          where: { archived: false },
          orderBy: { position: "desc" },
        });
        updateData.position = lastTodo ? lastTodo.position + 1 : 1;
      }
    }

    const todo = await prisma.todo.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(todo);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update todo" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.todo.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete todo" },
      { status: 500 }
    );
  }
}
```

### 3.4 POST /api/todos/reorder - Batch Update Positions

`app/api/todos/reorder/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { updates } = body; // [{ id: string, position: number }]

    // Use a transaction to update all positions atomically
    await prisma.$transaction(
      updates.map((update: { id: string; position: number }) =>
        prisma.todo.update({
          where: { id: update.id },
          data: { position: update.position },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to reorder todos" },
      { status: 500 }
    );
  }
}
```

## 4. Frontend Architecture

### 4.1 Component Structure

```
app/
  page.tsx                    # Main page
  components/
    TodoList.tsx              # Main container
    TodoItem.tsx              # Individual todo card
    TodoForm.tsx              # Create/edit form
    SearchBar.tsx             # Search input
    FilterBar.tsx             # Filter toggles
    ArchiveToggle.tsx         # Switch between active/archive
    EmptyState.tsx            # No todos message
  hooks/
    useTodos.ts               # Data fetching & mutations
  types/
    index.ts                  # TypeScript types
```

### 4.2 TypeScript Types

`app/types/index.ts`:

```typescript
export interface Todo {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  archived: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface CreateTodoInput {
  title: string;
  description?: string;
}

export interface UpdateTodoInput {
  title?: string;
  description?: string;
  completed?: boolean;
  archived?: boolean;
  position?: number;
}
```

### 4.3 Custom Hook for Todo Operations

`app/hooks/useTodos.ts`:

```typescript
"use client";

import { useState, useEffect, useCallback } from "react";
import type { Todo, CreateTodoInput, UpdateTodoInput } from "../types";

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const fetchTodos = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        archived: showArchived.toString(),
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await fetch(`/api/todos?${params}`);
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.error("Failed to fetch todos:", error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, showArchived]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const createTodo = async (input: CreateTodoInput) => {
    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const newTodo = await response.json();
      setTodos((prev) => [...prev, newTodo]);
      return newTodo;
    } catch (error) {
      console.error("Failed to create todo:", error);
      throw error;
    }
  };

  const updateTodo = async (id: string, input: UpdateTodoInput) => {
    // Optimistic update
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, ...input } : todo))
    );

    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const updatedTodo = await response.json();

      // Replace with server response
      setTodos((prev) =>
        prev.map((todo) => (todo.id === id ? updatedTodo : todo))
      );

      return updatedTodo;
    } catch (error) {
      console.error("Failed to update todo:", error);
      // Revert optimistic update
      fetchTodos();
      throw error;
    }
  };

  const deleteTodo = async (id: string) => {
    // Optimistic delete
    setTodos((prev) => prev.filter((todo) => todo.id !== id));

    try {
      await fetch(`/api/todos/${id}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Failed to delete todo:", error);
      // Revert
      fetchTodos();
      throw error;
    }
  };

  const reorderTodos = async (reorderedTodos: Todo[]) => {
    // Optimistic update
    setTodos(reorderedTodos);

    try {
      const updates = reorderedTodos.map((todo, index) => ({
        id: todo.id,
        position: index,
      }));

      await fetch("/api/todos/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
    } catch (error) {
      console.error("Failed to reorder todos:", error);
      fetchTodos();
      throw error;
    }
  };

  return {
    todos,
    loading,
    searchQuery,
    setSearchQuery,
    showArchived,
    setShowArchived,
    createTodo,
    updateTodo,
    deleteTodo,
    reorderTodos,
    refetch: fetchTodos,
  };
}
```

## 5. Key Components

### 5.1 Main Page

`app/page.tsx`:

```typescript
"use client";

import TodoList from "./components/TodoList";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Slick Todo</h1>
          <p className="text-purple-300">Your minimal task manager</p>
        </header>
        <TodoList />
      </div>
    </main>
  );
}
```

### 5.2 TodoList Component with Drag & Drop

`app/components/TodoList.tsx`:

```typescript
"use client";

import { useState, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useTodos } from "../hooks/useTodos";
import TodoItem from "./TodoItem";
import TodoForm from "./TodoForm";
import SearchBar from "./SearchBar";
import ArchiveToggle from "./ArchiveToggle";
import EmptyState from "./EmptyState";
import type { Todo } from "../types";

export default function TodoList() {
  const {
    todos,
    loading,
    searchQuery,
    setSearchQuery,
    showArchived,
    setShowArchived,
    createTodo,
    updateTodo,
    deleteTodo,
    reorderTodos,
  } = useTodos();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Separate active and completed todos
  const { activeTodos, completedTodos } = useMemo(() => {
    const active = todos.filter((todo) => !todo.completed);
    const completed = todos.filter((todo) => todo.completed);
    return { activeTodos: active, completedTodos: completed };
  }, [todos]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = todos.findIndex((todo) => todo.id === active.id);
    const newIndex = todos.findIndex((todo) => todo.id === over.id);

    const reordered = arrayMove(todos, oldIndex, newIndex);
    reorderTodos(reordered);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl">
        <TodoForm onSubmit={createTodo} />

        <div className="mt-6 space-y-4">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <ArchiveToggle checked={showArchived} onChange={setShowArchived} />
        </div>
      </div>

      {todos.length === 0 ? (
        <EmptyState showArchived={showArchived} searchQuery={searchQuery} />
      ) : (
        <div className="space-y-6">
          {/* Active Todos */}
          {activeTodos.length > 0 && (
            <div className="space-y-2">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={activeTodos.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {activeTodos.map((todo) => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      onUpdate={updateTodo}
                      onDelete={deleteTodo}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          )}

          {/* Completed Todos */}
          {completedTodos.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-purple-300 px-2">
                Completed ({completedTodos.length})
              </h2>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={completedTodos.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {completedTodos.map((todo) => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      onUpdate={updateTodo}
                      onDelete={deleteTodo}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

### 5.3 TodoItem Component (Sortable)

`app/components/TodoItem.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Archive, ArchiveRestore } from "lucide-react";
import type { Todo, UpdateTodoInput } from "../types";

interface TodoItemProps {
  todo: Todo;
  onUpdate: (id: string, input: UpdateTodoInput) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function TodoItem({ todo, onUpdate, onDelete }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description || "");

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSave = async () => {
    if (title.trim()) {
      await onUpdate(todo.id, { title, description });
      setIsEditing(false);
    }
  };

  const handleToggleComplete = () => {
    onUpdate(todo.id, { completed: !todo.completed });
  };

  const handleToggleArchive = () => {
    onUpdate(todo.id, { archived: !todo.archived });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        bg-white/10 backdrop-blur-md rounded-xl p-4
        hover:bg-white/15 transition-all duration-200
        ${todo.completed ? "opacity-60" : ""}
        ${isDragging ? "shadow-2xl scale-105" : "shadow-lg"}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-1 text-gray-400 hover:text-white cursor-grab active:cursor-grabbing"
        >
          <GripVertical size={20} />
        </button>

        {/* Checkbox */}
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={handleToggleComplete}
          className="mt-1 w-5 h-5 rounded cursor-pointer"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white/20 text-white px-3 py-2 rounded-lg border border-white/20 focus:border-purple-400 focus:outline-none"
                autoFocus
                onBlur={handleSave}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                  if (e.key === "Escape") setIsEditing(false);
                }}
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white/20 text-white px-3 py-2 rounded-lg border border-white/20 focus:border-purple-400 focus:outline-none resize-none"
                rows={3}
                onBlur={handleSave}
              />
            </div>
          ) : (
            <div onClick={() => setIsEditing(true)} className="cursor-pointer">
              <h3
                className={`text-white font-medium ${
                  todo.completed ? "line-through" : ""
                }`}
              >
                {todo.title}
              </h3>
              {todo.description && (
                <p
                  className={`text-sm text-gray-300 mt-1 ${
                    todo.completed ? "line-through" : ""
                  }`}
                >
                  {todo.description}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleArchive}
            className="text-gray-400 hover:text-purple-400 transition-colors"
            title={todo.archived ? "Unarchive" : "Archive"}
          >
            {todo.archived ? (
              <ArchiveRestore size={18} />
            ) : (
              <Archive size={18} />
            )}
          </button>
          <button
            onClick={() => onDelete(todo.id)}
            className="text-gray-400 hover:text-red-400 transition-colors"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 5.4 TodoForm Component

`app/components/TodoForm.tsx`:

```typescript
"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { CreateTodoInput } from "../types";

interface TodoFormProps {
  onSubmit: (input: CreateTodoInput) => Promise<void>;
}

export default function TodoForm({ onSubmit }: TodoFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [showDescription, setShowDescription] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
    });

    setTitle("");
    setDescription("");
    setShowDescription(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a new todo..."
          className="flex-1 bg-white/20 text-white placeholder-gray-400 px-4 py-3 rounded-xl border border-white/20 focus:border-purple-400 focus:outline-none"
          onFocus={() => setShowDescription(true)}
        />
        <button
          type="submit"
          disabled={!title.trim()}
          className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Add
        </button>
      </div>

      {showDescription && (
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a description (optional)..."
          className="w-full bg-white/20 text-white placeholder-gray-400 px-4 py-3 rounded-xl border border-white/20 focus:border-purple-400 focus:outline-none resize-none"
          rows={3}
        />
      )}
    </form>
  );
}
```

### 5.5 SearchBar Component

`app/components/SearchBar.tsx`:

```typescript
"use client";

import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        size={20}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search todos..."
        className="w-full bg-white/10 text-white placeholder-gray-400 pl-10 pr-10 py-2 rounded-lg border border-white/20 focus:border-purple-400 focus:outline-none"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
}
```

### 5.6 ArchiveToggle Component

`app/components/ArchiveToggle.tsx`:

```typescript
"use client";

import { Archive } from "lucide-react";

interface ArchiveToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function ArchiveToggle({
  checked,
  onChange,
}: ArchiveToggleProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
        ${
          checked
            ? "bg-purple-500 text-white"
            : "bg-white/10 text-gray-300 hover:bg-white/15"
        }
      `}
    >
      <Archive size={18} />
      {checked ? "Showing Archived" : "Show Archived"}
    </button>
  );
}
```

### 5.7 EmptyState Component

`app/components/EmptyState.tsx`:

```typescript
"use client";

import { Inbox } from "lucide-react";

interface EmptyStateProps {
  showArchived: boolean;
  searchQuery: string;
}

export default function EmptyState({
  showArchived,
  searchQuery,
}: EmptyStateProps) {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-12 text-center">
      <Inbox className="mx-auto text-gray-500 mb-4" size={48} />
      <h3 className="text-xl font-semibold text-white mb-2">
        {searchQuery
          ? "No todos found"
          : showArchived
          ? "No archived todos"
          : "No active todos"}
      </h3>
      <p className="text-gray-400">
        {searchQuery
          ? "Try a different search term"
          : showArchived
          ? "Archive completed todos to see them here"
          : "Add your first todo to get started"}
      </p>
    </div>
  );
}
```

## 6. Styling Enhancements

### 6.1 Global Styles

Update `app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply antialiased;
  }
}

@layer utilities {
  .glass {
    @apply bg-white/10 backdrop-blur-md;
  }

  .glass-hover {
    @apply hover:bg-white/15 transition-all;
  }
}
```

### 6.2 Tailwind Config

Update `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
```

## 7. Deployment

### 7.1 CockroachDB Cloud Setup

1. Go to https://cockroachlabs.cloud/
2. Create a free Serverless cluster
3. Copy the connection string
4. Add to Vercel environment variables

### 7.2 Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Or use: vercel env add DATABASE_URL
```

## 8. Testing Checklist

- [ ] Create a todo
- [ ] Edit todo title (inline)
- [ ] Edit todo description
- [ ] Mark todo as complete (moves to bottom)
- [ ] Unmark completed todo (moves back to active)
- [ ] Delete todo
- [ ] Drag and drop reorder active todos
- [ ] Drag and drop reorder completed todos
- [ ] Search todos by title
- [ ] Search todos by description
- [ ] Archive a todo
- [ ] View archived todos
- [ ] Unarchive a todo
- [ ] Responsive design on mobile
- [ ] Keyboard shortcuts work

## 9. Performance Optimizations

1. **Debounce search input** (300ms)
2. **Optimistic UI updates** for all mutations
3. **Index database** queries on commonly filtered fields
4. **Lazy load** archived todos only when viewed
5. **Memoize** filtered/sorted lists
6. **Virtual scrolling** if list exceeds 200 items

## 10. Next Steps (Future Phases)

- Add priority levels with color coding
- Implement focus mode
- Add keyboard shortcut for quick capture
- Build energy-based tagging system
- Implement subtasks with nested UI
- Add undo/redo functionality
- Export data to JSON/CSV
- Add animations for completion/deletion
