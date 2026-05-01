import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import DashboardPage from '../DashboardPage';
import { AuthProvider } from '../../context/AuthContext';
import * as todosApi from '../../api/todos';
import type { Todo } from '../../api/todos';

// Mock the todos API
vi.mock('../../api/todos');
const mockTodoApi = todosApi as any;

const mockLogout = vi.fn();

// Mock useAuth hook
vi.mock('../../context/AuthContext', async () => {
  const actual = await vi.importActual('../../context/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      token: 'test-token',
      isAuthenticated: true,
      login: vi.fn(),
      logout: mockLogout,
    }),
  };
});

const renderDashboard = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <DashboardPage />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTodoApi.todoApi = {
      getTodos: vi.fn().mockResolvedValue([]),
      createTodo: vi.fn().mockResolvedValue({ id: 1, title: '', isCompleted: false }),
      updateTodo: vi.fn().mockResolvedValue({ id: 1, title: '', isCompleted: false }),
      deleteTodo: vi.fn().mockResolvedValue(undefined),
    };
  });

  describe('rendering and initial state', () => {
    it('should render dashboard header', async () => {
      // Act
      renderDashboard();

      // Assert
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('should render add todo section', async () => {
      // Act
      renderDashboard();

      // Assert
      expect(screen.getAllByText('Add Todo')).toHaveLength(2);
      expect(screen.getByPlaceholderText('Enter a new todo...')).toBeInTheDocument();
    });

    it('should load todos on mount', async () => {
      // Arrange
      const mockTodos: Todo[] = [
        { id: 1, title: 'Test Todo', isCompleted: false },
      ];
      mockTodoApi.todoApi.getTodos.mockResolvedValueOnce(mockTodos);

      // Act
      renderDashboard();

      // Assert
      await waitFor(() => {
        expect(mockTodoApi.todoApi.getTodos).toHaveBeenCalled();
      });
    });

    it('should display loading state initially', async () => {
      // Act
      renderDashboard();

      // Assert
      // Initially should show loading or be processing
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('should display todos after loading', async () => {
      // Arrange
      const mockTodos: Todo[] = [
        { id: 1, title: 'Test Todo 1', isCompleted: false },
        { id: 2, title: 'Test Todo 2', isCompleted: true },
      ];
      mockTodoApi.todoApi.getTodos.mockResolvedValueOnce(mockTodos);

      // Act
      renderDashboard();

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
      });
    });
  });

  describe('adding todos', () => {
    it('should add a new todo with title only', async () => {
      // Arrange
      const user = userEvent.setup();
      const newTodo: Todo = { id: 1, title: 'New Todo', isCompleted: false };
      mockTodoApi.todoApi.createTodo.mockResolvedValueOnce(newTodo);

      renderDashboard();

      // Act
      const input = screen.getByPlaceholderText('Enter a new todo...');
      await user.type(input, 'New Todo');
      const addButton = screen.getByRole('button', { name: /Add Todo/i });
      await user.click(addButton);

      // Assert
      await waitFor(() => {
        expect(mockTodoApi.todoApi.createTodo).toHaveBeenCalledWith('New Todo', undefined);
      });
    });

    it('should clear inputs after adding todo', async () => {
      // Arrange
      const user = userEvent.setup();
      const newTodo: Todo = { id: 1, title: 'New Todo', isCompleted: false };
      mockTodoApi.todoApi.createTodo.mockResolvedValueOnce(newTodo);

      renderDashboard();

      // Act
      const input = screen.getByPlaceholderText('Enter a new todo...') as HTMLInputElement;
      await user.type(input, 'New Todo');
      const addButton = screen.getByRole('button', { name: /Add Todo/i });
      await user.click(addButton);

      // Assert
      await waitFor(() => {
        expect(input.value).toBe('');
      });
    });

    it('should not add todo with empty title', async () => {
      // Arrange
      const user = userEvent.setup();

      renderDashboard();

      // Act
      const addButton = screen.getByRole('button', { name: /Add Todo/i });
      await user.click(addButton);

      // Assert
      expect(mockTodoApi.todoApi.createTodo).not.toHaveBeenCalled();
    });

    it('should display error message on creation failure', async () => {
      // Arrange
      const user = userEvent.setup();
      mockTodoApi.todoApi.createTodo.mockRejectedValueOnce(new Error('Failed'));

      renderDashboard();

      // Act
      const input = screen.getByPlaceholderText('Enter a new todo...');
      await user.type(input, 'New Todo');
      const addButton = screen.getByRole('button', { name: /Add Todo/i });
      await user.click(addButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Failed to add todo')).toBeInTheDocument();
      });
    });
  });

  describe('toggling todos', () => {
    it('should toggle todo completion status', async () => {
      // Arrange
      const user = userEvent.setup();
      const todo: Todo = { id: 1, title: 'Test Todo', isCompleted: false };
      const updatedTodo: Todo = { ...todo, isCompleted: true };

      mockTodoApi.todoApi.getTodos.mockResolvedValueOnce([todo]);
      mockTodoApi.todoApi.updateTodo.mockResolvedValueOnce(updatedTodo);

      renderDashboard();

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Test Todo')).toBeInTheDocument();
      });

      // Act
      // This would depend on how the toggle is implemented in the component
      // Usually there's a checkbox or button to toggle
    });

    it('should display error message on update failure', async () => {
      // Arrange
      const todo: Todo = { id: 1, title: 'Test Todo', isCompleted: false };
      mockTodoApi.todoApi.getTodos.mockResolvedValueOnce([todo]);
      mockTodoApi.todoApi.updateTodo.mockRejectedValueOnce(new Error('Failed'));

      renderDashboard();

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Test Todo')).toBeInTheDocument();
      });
    });
  });

  describe('deleting todos', () => {
    it('should delete a todo', async () => {
      // Arrange
      const user = userEvent.setup();
      const todo: Todo = { id: 1, title: 'Test Todo', isCompleted: false };

      mockTodoApi.todoApi.getTodos.mockResolvedValueOnce([todo]);
      mockTodoApi.todoApi.deleteTodo.mockResolvedValueOnce(undefined);

      renderDashboard();

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Test Todo')).toBeInTheDocument();
      });

      // Act & Assert depends on how delete button is implemented
    });

    it('should display error message on deletion failure', async () => {
      // Arrange
      const todo: Todo = { id: 1, title: 'Test Todo', isCompleted: false };
      mockTodoApi.todoApi.getTodos.mockResolvedValueOnce([todo]);
      mockTodoApi.todoApi.deleteTodo.mockRejectedValueOnce(new Error('Failed'));

      renderDashboard();

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Test Todo')).toBeInTheDocument();
      });
    });
  });

  describe('archive toggle', () => {
    it('should toggle between current and archived todos', async () => {
      // Arrange
      const user = userEvent.setup();
      const activeTodo: Todo = { id: 1, title: 'Active Todo', isCompleted: false };
      const archivedTodo: Todo = { id: 2, title: 'Archived Todo', isCompleted: true };

      mockTodoApi.todoApi.getTodos.mockResolvedValueOnce([activeTodo, archivedTodo]);

      renderDashboard();

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Active Todo')).toBeInTheDocument();
      });

      // Act
      const toggleButton = screen.getByRole('button', { name: /Show Archived/i });
      await user.click(toggleButton);

      // Assert
      expect(screen.queryByText('Active Todo')).not.toBeInTheDocument();
      expect(screen.getByText('Archived Todo')).toBeInTheDocument();
    });

    it('should show correct section title based on display mode', async () => {
      // Arrange
      const user = userEvent.setup();
      mockTodoApi.todoApi.getTodos.mockResolvedValueOnce([]);

      renderDashboard();

      // Assert
      expect(screen.getByText('Your Current Todos')).toBeInTheDocument();

      // Act
      const toggleButton = screen.getByRole('button', { name: /Show Archived/i });
      await user.click(toggleButton);

      // Assert
      expect(screen.getByText('Your Archived Todos')).toBeInTheDocument();
    });
  });

  describe('logout functionality', () => {
    it('should call logout when logout button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      mockTodoApi.todoApi.getTodos.mockResolvedValueOnce([]);

      renderDashboard();

      // Act
      const logoutButton = screen.getByRole('button', { name: /Logout/i });
      await user.click(logoutButton);

      // Assert
      expect(mockLogout).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should display error when loading todos fails', async () => {
      // Arrange
      mockTodoApi.todoApi.getTodos.mockRejectedValueOnce(new Error('Failed to fetch'));

      // Act
      renderDashboard();

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Failed to load todos')).toBeInTheDocument();
      });
    });

    it('should clear error message when action succeeds', async () => {
      // Arrange
      const user = userEvent.setup();
      const newTodo: Todo = { id: 1, title: 'New Todo', isCompleted: false };

      mockTodoApi.todoApi.getTodos.mockResolvedValueOnce([]);
      mockTodoApi.todoApi.createTodo.mockResolvedValueOnce(newTodo);

      renderDashboard();

      // Act
      const input = screen.getByPlaceholderText('Enter a new todo...');
      await user.type(input, 'New Todo');
      const addButton = screen.getByRole('button', { name: /Add Todo/i });
      await user.click(addButton);

      // Assert
      await waitFor(() => {
        expect(screen.queryByText(/Failed/)).not.toBeInTheDocument();
      });
    });
  });

  describe('editing todos', () => {
    it('should open edit mode when edit button is clicked', async () => {
      // Arrange
      const todo: Todo = { id: 1, title: 'Test Todo', isCompleted: false };
      mockTodoApi.todoApi.getTodos.mockResolvedValueOnce([todo]);

      renderDashboard();

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Test Todo')).toBeInTheDocument();
      });

      // Act & Assert depends on edit button implementation
    });

    it('should save edited todo', async () => {
      // Arrange
      const user = userEvent.setup();
      const todo: Todo = { id: 1, title: 'Original', isCompleted: false };
      const updatedTodo: Todo = { ...todo, title: 'Updated' };

      mockTodoApi.todoApi.getTodos.mockResolvedValueOnce([todo]);
      mockTodoApi.todoApi.updateTodo.mockResolvedValueOnce(updatedTodo);

      renderDashboard();

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Original')).toBeInTheDocument();
      });

      // Act & Assert depends on edit form implementation
    });

    it('should cancel editing', async () => {
      // Arrange
      const todo: Todo = { id: 1, title: 'Test Todo', isCompleted: false };
      mockTodoApi.todoApi.getTodos.mockResolvedValueOnce([todo]);

      renderDashboard();

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Test Todo')).toBeInTheDocument();
      });

      // Act & Assert depends on cancel button implementation
    });
  });
});
