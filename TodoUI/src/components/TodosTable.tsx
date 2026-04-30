import React from "react";
import { type Todo } from "../api/todos";

interface TodosTableProps {
    todos: Todo[];
    onToggle: (todo: Todo) => void;
    onDelete: (id: number) => void;
    displayArchive: boolean;
}

const TodosTable: React.FC<TodosTableProps> = ({ todos, onToggle, onDelete, displayArchive }) => {
    const today = new Date();

    return (
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
                {todos.filter(todo => displayArchive ? todo.isCompleted : !todo.isCompleted).map((todo) => {
                    const dueDate = todo.dueDate ? new Date(todo.dueDate) : null;

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
                            <td>{todo.createdAt ? new Date(todo.createdAt).toLocaleDateString() : "-"}</td>
                            <td>{todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : "-"}</td>
                            <td>
                                <button className="delete-btn" onClick={() => onDelete(todo.id!)}>
                                    Delete
                                </button>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
};

export default TodosTable;