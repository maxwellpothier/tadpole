"use client";

import { useState, useEffect, useCallback } from "react";
import type { Task, CreateTaskInput, UpdateTaskInput } from "../types";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/tasks");
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
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

  return {
    tasks,
    loading,
    createTask,
    updateTask,
    deleteTask,
    refetch: fetchTasks,
  };
}
