const API_BASE = "/api/auth";

export interface AuthResponse {
    success: boolean;
    token?: string;
    errors?: string[];
}

async function request(path: string, body: object): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    if (response.status === 401) {
        return { success: false, errors: ["Unauthorized"] };
    }

    return response.json();
}

export const authApi = {
    register: (email: string, password: string) => request("/register", { email, password }),
    login: (email: string, password: string) => request("/login", { email, password }),
    forgotPassword: (email: string) => request("/forgot-password", { email }),
    resetPassword: (email: string, token: string, newPassword: string) => request("/reset-password", { email, token, newPassword }),
}