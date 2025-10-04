"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { CreateTaskInput } from "../types";

interface TodoFormProps {
  onSubmit: (input: CreateTaskInput) => Promise<void>;
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
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task..."
          className="flex-1 bg-white text-gray-900 placeholder-gray-400 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 focus:outline-none transition-all"
          onFocus={() => setShowDescription(true)}
        />
        <button
          type="submit"
          disabled={!title.trim()}
          className="bg-gray-900 hover:bg-gray-800 hover:shadow-lg hover:scale-105 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5"
        >
          <Plus size={16} />
          Add
        </button>
      </div>

      {showDescription && (
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a description (optional)..."
          className="w-full bg-white text-gray-900 placeholder-gray-400 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 focus:outline-none resize-none transition-all"
          rows={2}
        />
      )}
    </form>
  );
}
