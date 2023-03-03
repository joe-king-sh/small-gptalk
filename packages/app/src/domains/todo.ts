import { ValueOf } from "type-fest";

export type Todo = {
  todoId: string;
  content: string;
  status: TodoStatusType;
};

export const TodoStatus = {
  WAITING: "waiting",
  IN_PROGRESS: "in_progress",
  DONE: "done",
  PENDING: "pending",
} as const;

export type TodoStatusType = ValueOf<typeof TodoStatus>;

export type GetTodosResponseResponse = {
  todos: Todo[] | undefined;
};
export type ITodoRepository = {
  save: (options: { todo: Todo }) => Promise<void>;
  getTodos: () => Promise<GetTodosResponseResponse>;
};
