import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { todoApi, type Todo } from "../api/todos";
import "../styles/Dashboard.css";
import TodosTable from "../components/TodosTable";

export default function DashboardPage() {
    const { logout } = useAuth();
    const [todos, setTodos] = useState<Todo[]>([]);
    const [displayArchive, setDisplayArchive] = useState(false);
    const [title, setTitle] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDueDate, setEditDueDate] = useState("");
    const tableTitle = displayArchive ? "Your Archived Todos" : "Your Current Todos";
    const buttonText = displayArchive ? "Show Current Todos" : "Show Archived Todos";

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

    const handleEditTodo = (todo: Todo) => {
        setEditingTodo(todo);
        setEditTitle(todo.title);
        setEditDueDate(todo.dueDate || "");
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTodo || !editTitle.trim()) return;

        try {
            const updated = await todoApi.updateTodo(editingTodo.id!, {
                ...editingTodo,
                title: editTitle.trim(),
                dueDate: editDueDate || null,
            });
            setTodos(todos.map(t => t.id === updated.id ? updated : t));
            setEditingTodo(null);
            setEditTitle("");
            setEditDueDate("");
        } catch (err) {
            setError("Failed to update todo");
            console.error(err);
        }
    };

    const handleCancelEdit = () => {
        setEditingTodo(null);
        setEditTitle("");
        setEditDueDate("");
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
                    <h2>{tableTitle}</h2>
                    <div className="toggle-button">
                        <button
                            className="toggle-btn"
                            onClick={() => setDisplayArchive(!displayArchive)}
                        >
                            {buttonText}
                        </button>
                    </div>
                    {loading ? (
                        <p>Loading todos...</p>
                    ) : todos.length === 0 ? (
                        <p className="no-todos">No todos yet. Create one to get started!</p>
                    ) : (
                        <TodosTable
                            todos={todos}
                            onToggle={handleToggleTodo}
                            onDelete={handleDeleteTodo}
                            onEdit={handleEditTodo}
                            displayArchive={displayArchive}
                        />
                    )}
                </div>
            </div>

            {editingTodo && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Edit Todo</h2>
                        <form onSubmit={handleSaveEdit} className="edit-todo-form">
                            <div className="form-group">
                                <label htmlFor="edit-title">Title</label>
                                <input
                                    id="edit-title"
                                    type="text"
                                    placeholder="Todo title"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="todo-input"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="edit-due-date">Due Date</label>
                                <input
                                    id="edit-due-date"
                                    type="date"
                                    value={editDueDate}
                                    onChange={(e) => setEditDueDate(e.target.value)}
                                    className="todo-date-input"
                                />
                            </div>
                            <div className="modal-buttons">
                                <button type="submit" className="save-btn">Save Changes</button>
                                <button type="button" className="cancel-btn" onClick={handleCancelEdit}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}