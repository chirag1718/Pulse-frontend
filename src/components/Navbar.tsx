import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function Navbar() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-6">
                <Link to="/" className="text-xl font-bold text-indigo-400">
                    VideoApp
                </Link>
                <Link to="/" className="text-sm text-gray-300 hover:text-white transition">
                    Dashboard
                </Link>
                <Link to="/library" className="text-sm text-gray-300 hover:text-white transition">
                    Library
                </Link>
                {user?.role === "admin" && (
                    <Link to="/admin" className="text-sm text-gray-300 hover:text-white transition">
                        Admin
                    </Link>
                )}
            </div>
            <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">
                    {user?.name} ({user?.role})
                </span>
                <button
                    onClick={handleLogout}
                    className="text-sm bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded transition"
                >
                    Logout
                </button>
            </div>
        </nav>
    );
}