"use client";

import { useState, useEffect, useCallback } from "react";
import type { Task, CreateTaskInput, UpdateTaskInput } from "../types";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/tasks");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch tasks: ${response.status}`);
      }

      const data = await response.json();

      // Ensure data is an array before setting
      if (Array.isArray(data)) {
        setTasks(data);
      } else {
        console.error("API returned non-array data:", data);
        setTasks([]);
        setError("Invalid data received from server");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch tasks";
      console.error("Failed to fetch tasks:", errorMessage);
      setError(errorMessage);
      setTasks([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (input: CreateTaskInput) => {
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const newTask = await response.json();
      setTasks((prev) => [...prev, newTask]);
      return newTask;
    } catch (error) {
      console.error("Failed to create task:", error);
      throw error;
    }
  };

  const updateTask = async (id: string, input: UpdateTaskInput) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, ...input } : task))
    );

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const updatedTask = await response.json();

      // Replace with server response
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? updatedTask : task))
      );

      return updatedTask;
    } catch (error) {
      console.error("Failed to update task:", error);
      // Revert optimistic update
      fetchTasks();
      throw error;
    }
  };

  const deleteTask = async (id: string) => {
    // Optimistic delete
    setTasks((prev) => prev.filter((task) => task.id !== id));

    try {
      await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Failed to delete task:", error);
      // Revert
      fetchTasks();
      throw error;
    }
  };

  const reorderTasks = async (reorderedTasks: Task[]) => {
    // Optimistic update
    setTasks(reorderedTasks);

    try {
      // Update positions for all reordered tasks
      await Promise.all(
        reorderedTasks.map((task, index) =>
          fetch(`/api/tasks/${task.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ position: index }),
          })
        )
      );
    } catch (error) {
      console.error("Failed to reorder tasks:", error);
      fetchTasks();
      throw error;
    }
  };

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    reorderTasks,
    refetch: fetchTasks,
  };
}
