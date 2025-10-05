"use client";

import { useState, useEffect, useCallback } from "react";
import type { Tag, CreateTagInput } from "../types";

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTags = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/tags");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch tags: ${response.status}`);
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setTags(data);
      } else {
        console.error("API returned non-array data:", data);
        setTags([]);
        setError("Invalid data received from server");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch tags";
      console.error("Failed to fetch tags:", errorMessage);
      setError(errorMessage);
      setTags([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const createTag = async (input: CreateTagInput) => {
    try {
      const response = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create tag");
      }

      const newTag = await response.json();
      setTags((prev) => [...prev, newTag]);
      return newTag;
    } catch (error) {
      console.error("Failed to create tag:", error);
      throw error;
    }
  };

  const deleteTag = async (id: string) => {
    // Optimistic delete
    setTags((prev) => prev.filter((tag) => tag.id !== id));

    try {
      await fetch(`/api/tags/${id}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Failed to delete tag:", error);
      // Revert
      fetchTags();
      throw error;
    }
  };

  return {
    tags,
    loading,
    error,
    createTag,
    deleteTag,
    refetch: fetchTags,
  };
}
