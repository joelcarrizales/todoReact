import { describe, it, expect, beforeEach, vi } from 'vitest';
import { todoApi, type Todo } from '../src/api/todos';

// Mock fetch
global.fetch = vi.fn();

const mockFetch = global.fetch as any;

describe('todoApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockFetch.mockClear();
  });

  describe('getTodos', () => {
    it('should fetch todos with authorization header', async () => {
      // Arrange
      const mockTodos: Todo[] = [
        { id: 1, title: 'Test Todo 1', isCompleted: false },
        { id: 2, title: 'Test Todo 2', isCompleted: true },
      ];

      localStorage.getItem = vi.fn().mockReturnValue('test-token');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTodos,
      });

      // Act
      const result = await todoApi.getTodos();

      // Assert
      expect(result).toEqual(mockTodos);
      expect(mockFetch).toHaveBeenCalledWith('/api/todos', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
      });
    });

    it('should fetch todos without token if not available', async () => {
      // Arrange
      const mockTodos: Todo[] = [];

      localStorage.getItem = vi.fn().mockReturnValue(null);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTodos,
      });

      // Act
      const result = await todoApi.getTodos();

      // Assert
      expect(result).toEqual(mockTodos);
      expect(mockFetch).toHaveBeenCalledWith('/api/todos', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should throw error on failed response', async () => {
      // Arrange
      localStorage.getItem = vi.fn().mockReturnValue('test-token');
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      // Act & Assert
      await expect(todoApi.getTodos()).rejects.toThrow('Failed to fetch todos');
    });
  });

  describe('createTodo', () => {
    it('should create a todo with title only', async () => {
      // Arrange
      const newTodo: Todo = {
        id: 1,
        title: 'New Todo',
        isCompleted: false,
        createdAt: new Date().toISOString(),
      };

      localStorage.getItem = vi.fn().mockReturnValue('test-token');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => newTodo,
      });

      // Act
      const result = await todoApi.createTodo('New Todo');

      // Assert
      expect(result).toEqual(newTodo);
      expect(mockFetch).toHaveBeenCalledWith('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify({ title: 'New Todo' }),
      });
    });

    it('should create a todo with title and due date', async () => {
      // Arrange
      const dueDate = '2024-12-31';
      const newTodo: Todo = {
        id: 1,
        title: 'Todo with date',
        isCompleted: false,
        dueDate,
        createdAt: new Date().toISOString(),
      };

      localStorage.getItem = vi.fn().mockReturnValue('test-token');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => newTodo,
      });

      // Act
      const result = await todoApi.createTodo('Todo with date', dueDate);

      // Assert
      expect(result).toEqual(newTodo);
      expect(mockFetch).toHaveBeenCalledWith('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify({ title: 'Todo with date', dueDate }),
      });
    });

    it('should throw error on failed creation', async () => {
      // Arrange
      localStorage.getItem = vi.fn().mockReturnValue('test-token');
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      // Act & Assert
      await expect(todoApi.createTodo('Test')).rejects.toThrow('Failed to create todo');
    });
  });

  describe('updateTodo', () => {
    it('should update a todo', async () => {
      // Arrange
      const todoId = 1;
      const updatedTodo: Todo = {
        id: todoId,
        title: 'Updated Todo',
        isCompleted: true,
        createdAt: new Date().toISOString(),
      };

      localStorage.getItem = vi.fn().mockReturnValue('test-token');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updatedTodo,
      });

      // Act
      const result = await todoApi.updateTodo(todoId, updatedTodo);

      // Assert
      expect(result).toEqual(updatedTodo);
      expect(mockFetch).toHaveBeenCalledWith(`/api/todos/${todoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify(updatedTodo),
      });
    });

    it('should throw error on failed update', async () => {
      // Arrange
      const todoId = 1;
      const todo: Todo = { title: 'Test', isCompleted: false };

      localStorage.getItem = vi.fn().mockReturnValue('test-token');
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      // Act & Assert
      await expect(todoApi.updateTodo(todoId, todo)).rejects.toThrow('Failed to update todo');
    });
  });

  describe('deleteTodo', () => {
    it('should delete a todo', async () => {
      // Arrange
      const todoId = 1;

      localStorage.getItem = vi.fn().mockReturnValue('test-token');
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      // Act
      await todoApi.deleteTodo(todoId);

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(`/api/todos/${todoId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
      });
    });

    it('should throw error on failed deletion', async () => {
      // Arrange
      const todoId = 1;

      localStorage.getItem = vi.fn().mockReturnValue('test-token');
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      // Act & Assert
      await expect(todoApi.deleteTodo(todoId)).rejects.toThrow('Failed to delete todo');
    });
  });
});
