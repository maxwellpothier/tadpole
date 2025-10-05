"use client";

import { useState, useEffect } from "react";
import { Trash2, Pencil, GripVertical, Archive, ArchiveRestore } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task, UpdateTaskInput, Tag } from "../types";
import TagInput from "./TagInput";
import { useTags } from "../hooks/useTags";
import { getTextColor } from "../utils/colorUtils";

interface TodoItemProps {
  task: Task;
  onUpdate: (id: string, input: UpdateTaskInput) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function TodoItem({ task, onUpdate, onDelete }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [selectedTags, setSelectedTags] = useState<Tag[]>(
    task.tags.map((t) => t.tag)
  );

  const { tags, createTag } = useTags();

  // Sync local state with task prop when editing starts
  useEffect(() => {
    if (isEditing) {
      setTitle(task.title);
      setDescription(task.description || "");
      setSelectedTags(task.tags.map((t) => t.tag));
    }
  }, [isEditing, task]);

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
      await onUpdate(task.id, {
        title,
        description,
        tagIds: selectedTags.map((t) => t.id),
      });
      setIsEditing(false);
    }
  };

  const handleToggleComplete = () => {
    onUpdate(task.id, { completed: !task.completed });
  };

  const handleToggleArchive = () => {
    onUpdate(task.id, { archived: !task.archived });
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Only save if clicking outside the edit form
    const currentTarget = e.currentTarget;
    // Increase timeout to ensure dropdown interactions complete
    setTimeout(() => {
      if (!currentTarget.contains(document.activeElement)) {
        console.log("Blur detected, saving task");
        handleSave();
      }
    }, 100);
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
                placeholder="Add a description (optional)..."
                onKeyDown={(e) => {
                  if (e.key === "Escape") setIsEditing(false);
                }}
              />
              <TagInput
                availableTags={tags}
                selectedTags={selectedTags}
                onTagsChange={setSelectedTags}
                onCreateTag={createTag}
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
              {task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {task.tags.map(({ tag }) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium"
                      style={{
                        backgroundColor: tag.color,
                        color: getTextColor(tag.color)
                      }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
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
            onClick={handleToggleArchive}
            className="text-gray-400 hover:text-blue-500 transition-colors"
            title={task.archived ? "Unarchive" : "Archive"}
          >
            {task.archived ? <ArchiveRestore size={16} /> : <Archive size={16} />}
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
