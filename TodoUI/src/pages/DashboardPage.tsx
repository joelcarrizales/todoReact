import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { todoApi, type Todo } from "../api/todos";
import "../styles/Dashboard.css";

export default function DashboardPage() {
    const { logout } = useAuth();
    const [todos, setTodos] = useState<Todo[]>([]);
    const [title, setTitle] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchTodos();
    }, []);

    const fetchTodos = async () => {
        try {
            setLoading(true);
            const data = await todoApi.getTodos();
            setTodos(data);
            setError("");
        } catch (err) {
            setError("Failed to load todos");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTodo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        try {
            const newTodo = await todoApi.createTodo(title.trim(), dueDate || undefined);
            setTodos([...todos, newTodo]);
            setTitle("");
            setDueDate("");
        } catch (err) {
            setError("Failed to add todo");
            console.error(err);
        }
    };

    const handleToggleTodo = async (todo: Todo) => {
        try {
            const updated = await todoApi.updateTodo(todo.id!, {
                ...todo,
                isCompleted: !todo.isCompleted,
            });
            setTodos(todos.map(t => t.id === updated.id ? updated : t));
        } catch (err) {
            setError("Failed to update todo");
            console.error(err);
        }
    };

    const handleDeleteTodo = async (id: number) => {
        try {
            await todoApi.deleteTodo(id);
            setTodos(todos.filter(t => t.id !== id));
        } catch (err) {
            setError("Failed to delete todo");
            console.error(err);
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Dashboard</h1>
                <button className="logout-btn" onClick={logout}>Logout</button>
            </div>

            <div className="dashboard-content">
                <div className="add-todo-section">
                    <h2>Add Todo</h2>
                    <form onSubmit={handleAddTodo} className="add-todo-form">
                        <input
                            type="text"
                            placeholder="Enter a new todo..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="todo-input"
                        />
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="todo-date-input"
                            title="Due date (optional)"
                        />
                        <button type="submit" className="add-btn">Add Todo</button>
                    </form>
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="todos-section">
                    <h2>Your Todos</h2>
                    {loading ? (
                        <p>Loading todos...</p>
                    ) : todos.length === 0 ? (
                        <p className="no-todos">No todos yet. Create one to get started!</p>
                    ) : (
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
                                {todos.map((todo) => (
                                    <tr key={todo.id} className={todo.isCompleted ? "completed" : ""}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={todo.isCompleted}
                                                onChange={() => handleToggleTodo(todo)}
                                                className="todo-checkbox"
                                            />
                                        </td>
                                        <td className="todo-title">{todo.title}</td>
                                        <td>{todo.createdAt ? new Date(todo.createdAt).toLocaleDateString() : "-"}</td>
                                        <td>{todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : "-"}</td>
                                        <td>
                                            <button
                                                className="delete-btn"
                                                onClick={() => handleDeleteTodo(todo.id!)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}