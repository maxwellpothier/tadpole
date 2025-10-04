export interface Task {
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

export interface CreateTaskInput {
  title: string;
  description?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  completed?: boolean;
  archived?: boolean;
  position?: number;
}
