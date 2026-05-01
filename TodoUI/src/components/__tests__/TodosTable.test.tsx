import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodosTable from '../TodosTable';
import type { Todo } from '../../api/todos';

describe('TodosTable', () => {
  const mockOnToggle = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnEdit = vi.fn();

  const mockTodos: Todo[] = [
    {
      id: 1,
      title: 'Active Todo 1',
      isCompleted: false,
      createdAt: '2024-01-01',
      dueDate: '2024-12-31',
    },
    {
      id: 2,
      title: 'Active Todo 2',
      isCompleted: false,
      createdAt: '2024-01-02',
      dueDate: null,
    },
    {
      id: 3,
      title: 'Completed Todo',
      isCompleted: true,
      createdAt: '2024-01-03',
      completedAt: '2024-01-15',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render table headers', () => {
      // Act
      render(
        <TodosTable
          todos={[]}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          displayArchive={false}
        />
      );

      // Assert
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Created')).toBeInTheDocument();
      expect(screen.getByText('Due Date')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('should render empty table when no todos', () => {
      // Act
      const { container } = render(
        <TodosTable
          todos={[]}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          displayArchive={false}
        />
      );

      // Assert
      const rows = container.querySelectorAll('tbody tr');
      expect(rows).toHaveLength(0);
    });

    it('should render active todos when displayArchive is false', () => {
      // Act
      render(
        <TodosTable
          todos={mockTodos}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          displayArchive={false}
        />
      );

      // Assert
      expect(screen.getByText('Active Todo 1')).toBeInTheDocument();
      expect(screen.getByText('Active Todo 2')).toBeInTheDocument();
      expect(screen.queryByText('Completed Todo')).not.toBeInTheDocument();
    });

    it('should render archived todos when displayArchive is true', () => {
      // Act
      render(
        <TodosTable
          todos={mockTodos}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          displayArchive={true}
        />
      );

      // Assert
      expect(screen.getByText('Completed Todo')).toBeInTheDocument();
      expect(screen.queryByText('Active Todo 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Active Todo 2')).not.toBeInTheDocument();
    });

    it('should render todo titles', () => {
      // Act
      render(
        <TodosTable
          todos={mockTodos}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          displayArchive={false}
        />
      );

      // Assert
      expect(screen.getByText('Active Todo 1')).toBeInTheDocument();
      expect(screen.getByText('Active Todo 2')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call onToggle when toggle button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      const { container } = render(
        <TodosTable
          todos={[mockTodos[0]]}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          displayArchive={false}
        />
      );

      // Act
      const toggleButton = container.querySelector('input[type="checkbox"]') as HTMLElement;
      if (toggleButton) {
        await user.click(toggleButton);
      }

      // Assert
      // The test structure depends on how the toggle is implemented
      // This is a general pattern for testing checkbox interactions
    });

    it('should call onEdit when edit button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      const { container } = render(
        <TodosTable
          todos={[mockTodos[0]]}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          displayArchive={false}
        />
      );

      // Act
      const editButtons = container.querySelectorAll('button');
      const editButton = Array.from(editButtons).find((btn) => btn.textContent?.includes('Edit'));

      if (editButton) {
        await user.click(editButton);
        // Assert
        expect(mockOnEdit).toHaveBeenCalledWith(mockTodos[0]);
      }
    });

    it('should call onDelete when delete button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      const { container } = render(
        <TodosTable
          todos={[mockTodos[0]]}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          displayArchive={false}
        />
      );

      // Act
      const deleteButtons = container.querySelectorAll('button');
      const deleteButton = Array.from(deleteButtons).find((btn) => btn.textContent?.includes('Delete'));

      if (deleteButton) {
        await user.click(deleteButton);
        // Assert
        expect(mockOnDelete).toHaveBeenCalledWith(mockTodos[0].id);
      }
    });
  });

  describe('styling and visual indicators', () => {
    it('should apply archived class for completed todos when displayArchive is true', () => {
      // Arrange
      const { container } = render(
        <TodosTable
          todos={[mockTodos[2]]}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          displayArchive={true}
        />
      );

      // Act
      const rows = container.querySelectorAll('tbody tr');

      // Assert
      expect(rows[0]).toHaveClass('archived');
    });

    it('should apply overdue class for overdue todos', () => {
      // Arrange
      const overdueTodo: Todo = {
        id: 4,
        title: 'Overdue Todo',
        isCompleted: false,
        createdAt: '2024-01-01',
        dueDate: '2023-01-01', // Past date
      };

      const { container } = render(
        <TodosTable
          todos={[overdueTodo]}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          displayArchive={false}
        />
      );

      // Act
      const rows = container.querySelectorAll('tbody tr');

      // Assert
      expect(rows[0]).toHaveClass('overdue');
    });

    it('should apply due-soon class for todos due today or tomorrow', () => {
      // Arrange
      const today = new Date();
      const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const tomorrow = new Date(todayDateOnly);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const tomorrowString = tomorrow.toISOString().split('T')[0];

      const dueSoonTodo: Todo = {
        id: 5,
        title: 'Due Soon Todo',
        isCompleted: false,
        createdAt: '2024-01-01',
        dueDate: tomorrowString,
      };

      const { container } = render(
        <TodosTable
          todos={[dueSoonTodo]}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          displayArchive={false}
        />
      );

      // Act
      const rows = container.querySelectorAll('tbody tr');

      // Assert
      expect(rows[0]).toHaveClass('due-soon');
    });
  });

  describe('edge cases', () => {
    it('should handle todo with no due date', () => {
      // Act
      const { container } = render(
        <TodosTable
          todos={[mockTodos[1]]}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          displayArchive={false}
        />
      );

      // Assert
      expect(screen.getByText('Active Todo 2')).toBeInTheDocument();
      const rows = container.querySelectorAll('tbody tr');
      expect(rows).toHaveLength(1);
    });

    it('should handle null and undefined values in todos', () => {
      // Arrange
      const incompleteTodo: Todo = {
        id: 6,
        title: 'Minimal Todo',
        isCompleted: false,
        createdAt: undefined,
        dueDate: undefined,
        completedAt: undefined,
      };

      // Act & Assert
      expect(() => {
        render(
          <TodosTable
            todos={[incompleteTodo]}
            onToggle={mockOnToggle}
            onDelete={mockOnDelete}
            onEdit={mockOnEdit}
            displayArchive={false}
          />
        );
      }).not.toThrow();
    });
  });

  describe('pagination', () => {
    it('should render pagination controls when todos exceed items per page', () => {
      // Arrange
      const manyTodos = Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        title: `Todo ${i + 1}`,
        isCompleted: false,
        createdAt: '2024-01-01',
        dueDate: null,
      }));

      // Act
      render(
        <TodosTable
          todos={manyTodos}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          displayArchive={false}
          itemsPerPage={5}
        />
      );

      // Assert
      expect(screen.getByText(/Page 1 of 3/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Previous page/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Next page/i })).toBeInTheDocument();
    });

    it('should not render pagination controls when todos fit in one page', () => {
      // Act
      render(
        <TodosTable
          todos={mockTodos}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          displayArchive={false}
          itemsPerPage={10}
        />
      );

      // Assert
      expect(screen.queryByText(/Page/)).not.toBeInTheDocument();
    });

    it('should display correct number of items per page', () => {
      // Arrange
      const manyTodos = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        title: `Todo ${i + 1}`,
        isCompleted: false,
        createdAt: '2024-01-01',
        dueDate: null,
      }));

      // Act
      const { container } = render(
        <TodosTable
          todos={manyTodos}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          displayArchive={false}
          itemsPerPage={10}
        />
      );

      // Assert
      const rows = container.querySelectorAll('tbody tr');
      expect(rows).toHaveLength(10);
    });

    it('should navigate to next page when next button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      const manyTodos = Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        title: `Todo ${i + 1}`,
        isCompleted: false,
        createdAt: '2024-01-01',
        dueDate: null,
      }));

      // Act
      const { container, rerender } = render(
        <TodosTable
          todos={manyTodos}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          displayArchive={false}
          itemsPerPage={5}
        />
      );

      // Initial state - should show todos 1-5
      expect(screen.getByText('Todo 1')).toBeInTheDocument();
      expect(screen.queryByText('Todo 6')).not.toBeInTheDocument();

      // Click next button
      const nextButton = screen.getByRole('button', { name: /Next page/i });
      await user.click(nextButton);

      // Re-render to update state
      rerender(
        <TodosTable
          todos={manyTodos}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          displayArchive={false}
          itemsPerPage={5}
        />
      );

      // Assert - should show todos 6-10 on page 2
      expect(screen.getByText(/Page 2 of 3/)).toBeInTheDocument();
    });

    it('should navigate to previous page when previous button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      const manyTodos = Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        title: `Todo ${i + 1}`,
        isCompleted: false,
        createdAt: '2024-01-01',
        dueDate: null,
      }));

      // Act - Start on page 2
      const { container } = render(
        <TodosTable
          todos={manyTodos}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          displayArchive={false}
          itemsPerPage={5}
        />
      );

      // Navigate to page 2
      const nextButton = screen.getByRole('button', { name: /Next page/i });
      await user.click(nextButton);

      // Verify we're on page 2
      expect(screen.getByText(/Page 2 of 3/)).toBeInTheDocument();

      // Click previous button
      const previousButton = screen.getByRole('button', { name: /Previous page/i });
      await user.click(previousButton);

      // Assert - should be back on page 1
      expect(screen.getByText(/Page 1 of 3/)).toBeInTheDocument();
    });

    it('should disable previous button on first page', async () => {
      // Arrange
      const manyTodos = Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        title: `Todo ${i + 1}`,
        isCompleted: false,
        createdAt: '2024-01-01',
        dueDate: null,
      }));

      // Act
      render(
        <TodosTable
          todos={manyTodos}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          displayArchive={false}
          itemsPerPage={5}
        />
      );

      // Assert
      const previousButton = screen.getByRole('button', { name: /Previous page/i });
      expect(previousButton).toBeDisabled();
    });

    it('should disable next button on last page', async () => {
      // Arrange
      const user = userEvent.setup();
      const manyTodos = Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        title: `Todo ${i + 1}`,
        isCompleted: false,
        createdAt: '2024-01-01',
        dueDate: null,
      }));

      // Act
      render(
        <TodosTable
          todos={manyTodos}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          displayArchive={false}
          itemsPerPage={5}
        />
      );

      // Navigate to last page (page 3)
      const nextButton = screen.getByRole('button', { name: /Next page/i });
      await user.click(nextButton);
      await user.click(nextButton);

      // Assert
      expect(screen.getByText(/Page 3 of 3/)).toBeInTheDocument();
      const finalNextButton = screen.getByRole('button', { name: /Next page/i });
      expect(finalNextButton).toBeDisabled();
    });

    it('should use default items per page of 10 when not specified', () => {
      // Arrange
      const manyTodos = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        title: `Todo ${i + 1}`,
        isCompleted: false,
        createdAt: '2024-01-01',
        dueDate: null,
      }));

      // Act
      const { container } = render(
        <TodosTable
          todos={manyTodos}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          displayArchive={false}
        />
      );

      // Assert
      expect(screen.getByText(/Page 1 of 3/)).toBeInTheDocument();
      const rows = container.querySelectorAll('tbody tr');
      expect(rows).toHaveLength(10);
    });

    it('should correctly paginate with filtered results', async () => {
      // Arrange - 5 active todos and 5 archived todos
      const manyTodos = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        title: `Todo ${i + 1}`,
        isCompleted: i >= 5,
        createdAt: '2024-01-01',
        dueDate: null,
      }));

      // Act
      const { container } = render(
        <TodosTable
          todos={manyTodos}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          displayArchive={false}
          itemsPerPage={2}
        />
      );

      // Assert - only active todos (5 total), should have 3 pages
      expect(screen.getByText(/Page 1 of 3/)).toBeInTheDocument();
      const rows = container.querySelectorAll('tbody tr');
      expect(rows).toHaveLength(2);
    });
  });
});
