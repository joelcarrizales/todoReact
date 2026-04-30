const API_BASE = "/api/todos";

export interface Todo {
    id?: number;
    title: string;
    userEmail?: string;
    isCompleted: boolean;
    createdAt?: string;
    dueDate?: string | null;
    completedAt?: string | null;
}

async function getAuthHeaders(): Promise<HeadersInit> {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
    };
}

export const todoApi = {
    getTodos: async (): Promise<Todo[]> => {
        const headers = await getAuthHeaders();
        const response = await fetch(API_BASE, { headers });
        if (!response.ok) throw new Error("Failed to fetch todos");
        return response.json();
    },

    createTodo: async (title: string, dueDate?: string): Promise<Todo> => {
        const headers = await getAuthHeaders();
        const body: any = { title };
        if (dueDate) {
            body.dueDate = dueDate;
        }
        const response = await fetch(API_BASE, {
            method: "POST",
            headers,
            body: JSON.stringify(body),
        });
        if (!response.ok) throw new Error("Failed to create todo");
        return response.json();
    },

    updateTodo: async (id: number, todo: Todo): Promise<Todo> => {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE}/${id}`, {
            method: "PUT",
            headers,
            body: JSON.stringify(todo),
        });
        if (!response.ok) throw new Error("Failed to update todo");
        return response.json();
    },

    deleteTodo: async (id: number): Promise<void> => {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE}/${id}`, {
            method: "DELETE",
            headers,
        });
        if (!response.ok) throw new Error("Failed to delete todo");
    },
};
