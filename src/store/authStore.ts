import { create } from "zustand";
import api from "../services/api";

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    tenantId: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (
        name: string,
        email: string,
        password: string,
        role: string,
    ) => Promise<void>;
    logout: () => void;
    loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: localStorage.getItem("token"),
    isLoading: false,
    error: null,

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.post("/auth/login", { email, password });
            localStorage.setItem("token", res.data.token);
            set({
                user: res.data.user,
                token: res.data.token,
                isLoading: false,
            });
        } catch (err: any) {
            set({
                error: err.response?.data?.message || "Login failed",
                isLoading: false,
            });
        }
    },

    register: async (name, email, password, role) => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.post("/auth/register", {
                name,
                email,
                password,
                role,
            });
            localStorage.setItem("token", res.data.token);
            set({
                user: res.data.user,
                token: res.data.token,
                isLoading: false,
            });
        } catch (err: any) {
            set({
                error: err.response?.data?.message || "Registration failed",
                isLoading: false,
            });
        }
    },

    logout: () => {
        localStorage.removeItem("token");
        set({ user: null, token: null });
    },

    loadUser: async () => {
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
            const res = await api.get("/auth/me");
            set({ user: res.data });
        } catch {
            localStorage.removeItem("token");
            set({ user: null, token: null });
        }
    },
}));
