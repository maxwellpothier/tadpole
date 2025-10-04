"use client";

import { useState } from "react";
import { Trash2, Pencil, GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task, UpdateTaskInput } from "../types";

interface TodoItemProps {
  task: Task;
  onUpdate: (id: string, input: UpdateTaskInput) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function TodoItem({ task, onUpdate, onDelete }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSave = async () => {
    if (title.trim()) {
      await onUpdate(task.id, { title, description });
      setIsEditing(false);
    }
  };

  const handleToggleComplete = () => {
    onUpdate(task.id, { completed: !task.completed });
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Only save if clicking outside the edit form
    const currentTarget = e.currentTarget;
    setTimeout(() => {
      if (!currentTarget.contains(document.activeElement)) {
        handleSave();
      }
    }, 0);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group border border-gray-200 rounded-lg p-3 hover:border-gray-400 hover:shadow-md transition-all bg-white
        ${task.completed ? "opacity-50" : ""}
        ${isDragging ? "shadow-xl ring-2 ring-gray-400 opacity-60" : ""}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical size={16} />
        </button>

        {/* Checkbox */}
        <input
          type="checkbox"
          checked={task.completed}
          onChange={handleToggleComplete}
          className="mt-0.5 w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-2" onBlur={handleBlur}>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white text-gray-900 px-2 py-1 text-sm border border-gray-200 rounded focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 focus:outline-none transition-all"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSave();
                  }
                  if (e.key === "Escape") setIsEditing(false);
                }}
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white text-gray-900 px-2 py-1 text-sm border border-gray-200 rounded focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 focus:outline-none resize-none transition-all"
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setIsEditing(false);
                }}
              />
            </div>
          ) : (
            <div className="cursor-default">
              <h3
                className={`text-gray-900 text-sm ${
                  task.completed ? "line-through" : ""
                }`}
              >
                {task.title}
              </h3>
              {task.description && (
                <p
                  className={`text-sm text-gray-500 mt-1 ${
                    task.completed ? "line-through" : ""
                  }`}
                >
                  {task.description}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
          <button
            onClick={() => setIsEditing(true)}
            className="text-gray-400 hover:text-gray-900 transition-colors"
            title="Edit"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="text-gray-400 hover:text-red-500 transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
