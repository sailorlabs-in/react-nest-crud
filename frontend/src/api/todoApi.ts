import { apiClient } from './apiClient';
import type { CreateTodoPayload, Todo, UpdateTodoPayload } from '../types';

export async function getTodos() {
  const response = await apiClient.get<Todo[]>('/todos');
  return response.data;
}

export async function createTodo(payload: CreateTodoPayload) {
  const response = await apiClient.post<Todo>('/todos', payload);
  return response.data;
}

export async function updateTodo(id: number, payload: UpdateTodoPayload) {
  const response = await apiClient.patch<Todo>(`/todos/${id}`, payload);
  return response.data;
}

export async function deleteTodo(id: number) {
  await apiClient.delete(`/todos/${id}`);
}
