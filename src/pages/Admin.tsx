import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    tenantId: string;
    createdAt: string;
}

const roleColors: Record<string, string> = {
    admin: "bg-purple-500/20 text-purple-400",
    editor: "bg-blue-500/20 text-blue-400",
    viewer: "bg-gray-500/20 text-gray-400",
};

export default function Admin() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user?.role !== "admin") {
            navigate("/");
            return;
        }
        fetchUsers();
    }, [user]);

    const fetchUsers = async () => {
        try {
            const res = await api.get("/auth/users");
            setUsers(res.data);
        } catch {
            toast.error("Failed to fetch users");
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });

    return (
        <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
                <p className="text-gray-400 text-sm mt-1">
                    Manage all users in the system
                </p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                    <p className="text-gray-400 text-sm">Total Users</p>
                    <p className="text-3xl font-bold text-white mt-1">{users.length}</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                    <p className="text-gray-400 text-sm">Editors</p>
                    <p className="text-3xl font-bold text-blue-400 mt-1">
                        {users.filter((u) => u.role === "editor").length}
                    </p>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                    <p className="text-gray-400 text-sm">Viewers</p>
                    <p className="text-3xl font-bold text-gray-400 mt-1">
                        {users.filter((u) => u.role === "viewer").length}
                    </p>
                </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-800">
                    <h2 className="text-lg font-semibold text-white">All Users</h2>
                </div>

                {isLoading ? (
                    <div className="text-center py-12 text-gray-400">Loading...</div>
                ) : users.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">No users found</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-800 text-gray-400 text-left">
                                <th className="px-6 py-3 font-medium">Name</th>
                                <th className="px-6 py-3 font-medium">Email</th>
                                <th className="px-6 py-3 font-medium">Role</th>
                                <th className="px-6 py-3 font-medium">Tenant ID</th>
                                <th className="px-6 py-3 font-medium">Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr
                                    key={u._id}
                                    className="border-b border-gray-800/50 hover:bg-gray-800/30 transition"
                                >
                                    <td className="px-6 py-4 text-white font-medium">{u.name}</td>
                                    <td className="px-6 py-4 text-gray-400">{u.email}</td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs capitalize ${roleColors[u.role]}`}
                                        >
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                                        {u.tenantId.slice(0, 8)}...
                                    </td>
                                    <td className="px-6 py-4 text-gray-400">{formatDate(u.createdAt)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}