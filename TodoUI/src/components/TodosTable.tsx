import React, { useState } from "react";
import { type Todo } from "../api/todos";

interface TodosTableProps {
    todos: Todo[];
    onToggle: (todo: Todo) => void;
    onDelete: (id: number) => void;
    onEdit: (todo: Todo) => void;
    displayArchive: boolean;
    itemsPerPage?: number;
}

const TodosTable: React.FC<TodosTableProps> = ({ todos, onToggle, onDelete, onEdit, displayArchive, itemsPerPage = 10 }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const today = new Date();

    // Filter todos based on archive display
    const filteredTodos = todos.filter(todo => displayArchive ? todo.isCompleted : !todo.isCompleted);

    // Calculate pagination
    const totalPages = Math.ceil(filteredTodos.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedTodos = filteredTodos.slice(startIndex, endIndex);

    // Reset page to 1 if current page is out of bounds
    if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(1);
    }

    const handlePreviousPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    return (
        <div className="todos-table-container">
            <table className="todos-table">
                <thead>
                    <tr>
                        <th>Status</th>
                        <th>Title</th>
                        <th>Created</th>
                        <th>Due Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedTodos.map((todo) => {
                    const dueDate = todo.dueDate ? new Date(todo.dueDate + "T00:00:00") : null;

                    // Reset hours for comparison
                    today.setHours(0, 0, 0, 0);
                    if (dueDate) dueDate.setHours(0, 0, 0, 0);

                    let rowClass = "";
                    if (displayArchive) {
                        rowClass = "archived"; // greyed out
                    } else {
                        if (dueDate) {
                            if (dueDate < today) {
                                rowClass = "overdue";
                            } else if (
                                dueDate.getTime() === today.getTime() ||
                                dueDate.getTime() === new Date(today.getTime() + 86400000).getTime()
                            ) {
                                rowClass = "due-soon";
                            }
                        }
                    }

                    return (
                        <tr key={todo.id} className={`${todo.isCompleted ? "completed" : ""} ${rowClass}`}>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={todo.isCompleted}
                                    onChange={() => onToggle(todo)}
                                    className="todo-checkbox"
                                />
                            </td>
                            <td className="todo-title">{todo.title}</td>
                            <td>{todo.createdAt ? new Date(todo.createdAt + "T00:00:00").toLocaleDateString() : "-"}</td>
                            <td>{todo.dueDate ? new Date(todo.dueDate + "T00:00:00").toLocaleDateString() : "-"}</td>
                            <td>
                                {!todo.isCompleted && (
                                    <button className="edit-btn" onClick={() => onEdit(todo)}>
                                        Edit
                                    </button>
                                )}
                                <button className="delete-btn" onClick={() => onDelete(todo.id!)}>
                                    Delete
                                </button>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
            </table>

            {totalPages > 1 && (
                <div className="pagination-controls">
                    <button 
                        className="pagination-btn" 
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                        aria-label="Previous page"
                    >
                        Previous
                    </button>
                    <span className="pagination-info">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button 
                        className="pagination-btn" 
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        aria-label="Next page"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default TodosTable;