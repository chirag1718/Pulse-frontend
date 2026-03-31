import { useEffect, useState } from "react";
import { useVideoStore } from "../store/videoStore";
import VideoCard from "../components/VideoCard";

const filters = ["all", "safe", "flagged", "processing"];

export default function Library() {
    const { videos, fetchVideos, isLoading } = useVideoStore();
    const [activeFilter, setActiveFilter] = useState("all");

    useEffect(() => {
        fetchVideos();
    }, []);

    const filtered =
        activeFilter === "all"
            ? videos
            : videos.filter((v) => v.status === activeFilter);

    return (
        <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">Video Library</h1>
                <p className="text-gray-400 text-sm mt-1">
                    {videos.length} total videos
                </p>
            </div>

            <div className="flex gap-2 mb-6">
                {filters.map((f) => (
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