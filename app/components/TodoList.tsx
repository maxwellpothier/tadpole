"use client";

import { useMemo } from "react";
import { useTasks } from "../hooks/useTasks";
import TodoItem from "./TodoItem";
import TodoForm from "./TodoForm";

export default function TodoList() {
  const { tasks, loading, createTask, updateTask, deleteTask } = useTasks();

  // Separate active and completed tasks
  const { activeTasks, completedTasks } = useMemo(() => {
    const active = tasks.filter((task) => !task.completed);
    const completed = tasks.filter((task) => task.completed);
    return { activeTasks: active, completedTasks: completed };
  }, [tasks]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
        <TodoForm onSubmit={createTask} />
      </div>

      {tasks.length === 0 ? (
        <div className="border border-gray-200 rounded-lg p-12 text-center bg-white">
          <h3 className="text-sm font-medium text-gray-900 mb-1">
            No tasks yet
          </h3>
          <p className="text-sm text-gray-500">Add your first task to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Active Tasks */}
          {activeTasks.length > 0 && (
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
          )}

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div className="space-y-1.5">
              <h2 className="text-xs font-medium text-gray-500 px-1 mt-4">
                Completed · {completedTasks.length}
              </h2>
              {completedTasks.map((task) => (
                <TodoItem
                  key={task.id}
                  task={task}
                  onUpdate={updateTask}
                  onDelete={deleteTask}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
