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
                            displayArchive={displayArchive}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}