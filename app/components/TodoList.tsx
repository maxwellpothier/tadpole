"use client";

import { useMemo, useState } from "react";
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
import { useTasks } from "../hooks/useTasks";
import TodoItem from "./TodoItem";
import TodoForm from "./TodoForm";
import ArchiveToggle from "./ArchiveToggle";

export default function TodoList() {
  const {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    reorderTasks,
  } = useTasks();

  const [showArchived, setShowArchived] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filter by archived status, then separate active and completed
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => task.archived === showArchived);
  }, [tasks, showArchived]);

  const { activeTasks, completedTasks } = useMemo(() => {
    const active = filteredTasks.filter((task) => !task.completed);
    const completed = filteredTasks.filter((task) => task.completed);
    return { activeTasks: active, completedTasks: completed };
  }, [filteredTasks]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    // Use filteredTasks for reordering
    const oldIndex = filteredTasks.findIndex((task) => task.id === active.id);
    const newIndex = filteredTasks.findIndex((task) => task.id === over.id);

    const reordered = arrayMove(filteredTasks, oldIndex, newIndex);
    reorderTasks(reordered);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-900 text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-red-200 rounded-lg p-6 bg-red-50">
        <h3 className="text-sm font-semibold text-red-900 mb-2">
          Error loading tasks
        </h3>
        <p className="text-sm text-red-700 mb-4">{error}</p>
        {error.includes("DATABASE_URL") && (
          <p className="text-xs text-red-600">
            Make sure the DATABASE_URL environment variable is set in your Vercel
            project settings.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
        <TodoForm onSubmit={createTask} />
      </div>

      <div className="flex justify-between items-center">
        <ArchiveToggle checked={showArchived} onChange={setShowArchived} />
      </div>

      {filteredTasks.length === 0 ? (
        <div className="border border-gray-200 rounded-lg p-12 text-center bg-white">
          <h3 className="text-sm font-medium text-gray-900 mb-1">
            {showArchived ? "No archived tasks" : "No tasks yet"}
          </h3>
          <p className="text-sm text-gray-500">
            {showArchived
              ? "Archive tasks to see them here"
              : "Add your first task to get started"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Active Tasks */}
          {activeTasks.length > 0 && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={activeTasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-1.5">
                  {activeTasks.map((task) => (
                    <TodoItem
                      key={task.id}
                      task={task}
                      onUpdate={updateTask}
                      onDelete={deleteTask}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div>
              <h2 className="text-xs font-medium text-gray-500 px-1 mt-4 mb-1.5">
                Completed · {completedTasks.length}
              </h2>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={completedTasks.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-1.5">
                    {completedTasks.map((task) => (
                      <TodoItem
                        key={task.id}
                        task={task}
                        onUpdate={updateTask}
                        onDelete={deleteTask}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
