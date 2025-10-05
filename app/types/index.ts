export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

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
  tags: { tag: Tag }[];
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  tagIds?: string[];
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  completed?: boolean;
  archived?: boolean;
  position?: number;
  tagIds?: string[];
}

export interface CreateTagInput {
  name: string;
  color: string;
}
