"use client";

import { useState, useRef, useEffect } from "react";
import { X, Plus } from "lucide-react";
import type { Tag } from "../types";
import { getTextColor } from "../utils/colorUtils";

interface TagInputProps {
  availableTags: Tag[];
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  onCreateTag: (input: { name: string; color: string }) => Promise<Tag>;
}

const PRESET_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#06b6d4", // cyan
];

export default function TagInput({
  availableTags,
  selectedTags,
  onTagsChange,
  onCreateTag,
}: TagInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setIsCreating(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredTags = availableTags.filter(
    (tag) =>
      tag.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedTags.some((t) => t.id === tag.id)
  );

  const handleToggleTag = (tag: Tag) => {
    const isSelected = selectedTags.some((t) => t.id === tag.id);
    if (isSelected) {
      onTagsChange(selectedTags.filter((t) => t.id !== tag.id));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const handleCreateTag = async () => {
    if (!searchTerm.trim()) return;

    // Check for duplicate tag (case-insensitive)
    const existingTag = availableTags.find(
      (tag) => tag.name.toLowerCase() === searchTerm.trim().toLowerCase()
    );

    if (existingTag) {
      // If tag exists, just add it to selected tags
      onTagsChange([...selectedTags, existingTag]);
      setSearchTerm("");
      setIsCreating(false);
      setError(null);
      return;
    }

    try {
      setError(null);
      const newTag = await onCreateTag({
        name: searchTerm.trim(),
        color: selectedColor,
      });
      onTagsChange([...selectedTags, newTag]);
      setSearchTerm("");
      setIsCreating(false);
      setSelectedColor(PRESET_COLORS[0]);
    } catch (error) {
      console.error("Failed to create tag:", error);
      setError(
        error instanceof Error ? error.message : "Failed to create tag"
      );
    }
  };

  const showCreateOption =
    searchTerm.trim() &&
    !availableTags.some(
      (tag) => tag.name.toLowerCase() === searchTerm.trim().toLowerCase()
    );

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected tags */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {selectedTags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium"
            style={{
              backgroundColor: tag.color,
              color: getTextColor(tag.color)
            }}
          >
            {tag.name}
            <button
              onClick={() => handleToggleTag(tag)}
              className="hover:bg-black/20 rounded"
            >
              <X size={12} />
            </button>
          </span>
        ))}
      </div>

      {/* Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Add tags..."
          className="w-full bg-white text-gray-900 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 focus:outline-none transition-all"
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          onMouseDown={(e) => {
            // Prevent blur from firing when clicking dropdown
            e.preventDefault();
          }}
        >
          {isCreating ? (
            <div className="p-3 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Tag name
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setError(null);
                  }}
                  className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 focus:outline-none"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Color
                </label>
                <div className="flex gap-2 flex-wrap">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-6 h-6 rounded border-2 transition-all ${
                        selectedColor === color
                          ? "border-gray-900 scale-110"
                          : "border-gray-200"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              {error && (
                <div className="text-xs text-red-600 bg-red-50 px-2 py-1.5 rounded">
                  {error}
                </div>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCreateTag}
                  className="flex-1 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setSearchTerm("");
                    setError(null);
                  }}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              {filteredTags.length > 0 ? (
                <div className="py-1">
                  {filteredTags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => {
                        handleToggleTag(tag);
                        setSearchTerm("");
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-900 hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <span
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: tag.color }}
                      />
                      {tag.name}
                    </button>
                  ))}
                </div>
              ) : searchTerm ? (
                <div className="p-2 text-sm text-gray-500 text-center">
                  No matching tags
                </div>
              ) : (
                <div className="p-2 text-sm text-gray-500 text-center">
                  Start typing to search tags
                </div>
              )}

              {showCreateOption && (
                <button
                  type="button"
                  onClick={() => setIsCreating(true)}
                  className="w-full px-3 py-2 text-left text-sm border-t border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-2 text-gray-700"
                >
                  <Plus size={14} />
                  Create &quot;{searchTerm}&quot;
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
