import { useNavigate } from "react-router-dom";
import { useVideoStore } from "../store/videoStore";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";

interface Video {
    _id: string;
    title: string;
    description: string;
    originalName: string;
    size: number;
    duration: number;
    status: string;
    sensitivityScore: number;
    processingProgress: number;
    uploadedBy: { name: string; email: string };
    createdAt: string;
}

interface Props {
    video: Video;
}

const statusConfig: Record<string, { label: string; color: string }> = {
    uploading: { label: "Uploading", color: "bg-blue-500/20 text-blue-400" },
    processing: { label: "Processing", color: "bg-yellow-500/20 text-yellow-400" },
    safe: { label: "Safe", color: "bg-green-500/20 text-green-400" },
    flagged: { label: "Flagged", color: "bg-red-500/20 text-red-400" },
};

export default function VideoCard({ video }: Props) {
    const navigate = useNavigate();
    const { deleteVideo } = useVideoStore();
    const { user } = useAuthStore();
    const status = statusConfig[video.status] || statusConfig.processing;
    const canEdit = user?.role === "editor" || user?.role === "admin";

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Delete this video?")) return;
        await deleteVideo(video._id);
        toast.success("Video deleted");
    };

    const formatSize = (bytes: number) =>
        (bytes / (1024 * 1024)).toFixed(2) + " MB";

    const formatDuration = (seconds: number) => {
        if (!seconds) return "N/A";
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    return (
        <div
            className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-600 transition cursor-pointer"
            onClick={() => video.status === "safe" && navigate(`/player/${video._id}`)}
        >
            <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="font-medium text-white text-sm leading-snug line-clamp-2">
                    {video.title}
                </h3>
                <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${status.color}`}>
                    {status.label}
                </span>
            </div>

            {(video.status === "processing" || video.status === "uploading") && (
                <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Processing</span>
                        <span>{video.processingProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1.5">
                        <div
                            className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${video.processingProgress}%` }}
                        />
                    </div>
                </div>
            )}

            <div className="text-xs text-gray-500 space-y-1">
                <p>Size: {formatSize(video.size)}</p>
                <p>Duration: {formatDuration(video.duration)}</p>
                {video.status === "safe" || video.status === "flagged" ? (
                    <p>Score: {video.sensitivityScore}</p>
                ) : null}
                <p>By: {video.uploadedBy?.name || "Unknown"}</p>
            </div>

            {video.status === "safe" && (
                <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/player/${video._id}`); }}
                    className="mt-3 w-full text-xs bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 rounded-lg transition"
                >
                    Watch
                </button>
            )}

            {canEdit && (
                <button
                    onClick={handleDelete}
                    className="mt-2 w-full text-xs bg-red-600/20 hover:bg-red-600/40 text-red-400 py-1.5 rounded-lg transition"
                >
                    Delete
                </button>
            )}
        </div>
    );
}