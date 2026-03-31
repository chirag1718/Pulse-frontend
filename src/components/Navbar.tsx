import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function Navbar() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <Link to="/" className="text-xl font-bold text-indigo-400">
                        VideoApp
                    </Link>
                    <div className="hidden md:flex items-center gap-6">
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
                </div>

                {/* Desktop right side */}
                <div className="hidden md:flex items-center gap-4">
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

                {/* Mobile hamburger */}
                <button
                    className="md:hidden text-gray-400 hover:text-white"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    {menuOpen ? "✕" : "☰"}
                </button>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <div className="md:hidden mt-4 border-t border-gray-800 pt-4 space-y-3">
                    <Link
                        to="/"
                        onClick={() => setMenuOpen(false)}
                        className="block text-sm text-gray-300 hover:text-white"
                    >
                        Dashboard
                    </Link>
                    <Link
                        to="/library"
                        onClick={() => setMenuOpen(false)}
                        className="block text-sm text-gray-300 hover:text-white"
                    >
                        Library
                    </Link>
                    {user?.role === "admin" && (
                        <Link
                            to="/admin"
                            onClick={() => setMenuOpen(false)}
                            className="block text-sm text-gray-300 hover:text-white"
                        >
                            Admin
                        </Link>
                    )}
                    <div className="pt-2 border-t border-gray-800">
                        <p className="text-xs text-gray-500 mb-2">
                            {user?.name} ({user?.role})
                        </p>
                        <button
                            onClick={handleLogout}
                            className="text-sm bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded transition"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
}