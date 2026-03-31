import { useEffect, useState } from "react";
import { useVideoStore } from "../store/videoStore";
import VideoCard from "../components/VideoCard";

const statusFilters = ["all", "safe", "flagged", "processing"];

type SortKey = "createdAt" | "size" | "duration";

export default function Library() {
    const { videos, fetchVideos, isLoading } = useVideoStore();
    const [activeFilter, setActiveFilter] = useState("all");
    const [sortBy, setSortBy] = useState<SortKey>("createdAt");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchVideos();
    }, []);

    const filtered = videos
        .filter((v) => {
            const matchesStatus = activeFilter === "all" || v.status === activeFilter;
            const matchesSearch = v.title.toLowerCase().includes(search.toLowerCase());
            return matchesStatus && matchesSearch;
        })
        .sort((a, b) => {
            let aVal: number;
            let bVal: number;

            if (sortBy === "createdAt") {
                aVal = new Date(a.createdAt).getTime();
                bVal = new Date(b.createdAt).getTime();
            } else {
                aVal = a[sortBy];
                bVal = b[sortBy];
            }

            return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
        });

    const toggleSort = (key: SortKey) => {
        if (sortBy === key) {
            setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortBy(key);
            setSortOrder("desc");
        }
    };

    const sortLabel = (key: SortKey) => {
        if (sortBy !== key) return "↕";
        return sortOrder === "asc" ? "↑" : "↓";
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">Video Library</h1>
                <p className="text-gray-400 text-sm mt-1">{videos.length} total videos</p>
            </div>

            <div className="flex flex-col gap-4 mb-6">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by title..."
                    className="w-full max-w-sm bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 text-sm"
                />

                <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-gray-500 text-xs uppercase tracking-wide">Status:</span>
                    {statusFilters.map((f) => (
                        <button
                            key={f}
                            onClick={() => setActiveFilter(f)}
                            className={`px-4 py-1.5 rounded-full text-sm capitalize transition ${activeFilter === f
                                ? "bg-indigo-600 text-white"
                                : "bg-gray-800 text-gray-400 hover:text-white"
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-gray-500 text-xs uppercase tracking-wide">Sort by:</span>
                    {(["createdAt", "size", "duration"] as SortKey[]).map((key) => (
                        <button
                            key={key}
                            onClick={() => toggleSort(key)}
                            className={`px-4 py-1.5 rounded-full text-sm transition flex items-center gap-1 ${sortBy === key
                                ? "bg-indigo-600 text-white"
                                : "bg-gray-800 text-gray-400 hover:text-white"
                                }`}
                        >
                            {key === "createdAt" ? "Date" : key.charAt(0).toUpperCase() + key.slice(1)}
                            <span className="text-xs">{sortLabel(key)}</span>
                        </button>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-12 text-gray-400">Loading...</div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <p className="text-4xl mb-3">🎬</p>
                    <p>No videos found</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filtered.map((video) => (
                        <VideoCard key={video._id} video={video} />
                    ))}
                </div>
            )}
        </div>
    );
}