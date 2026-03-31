import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useVideoStore } from "../store/videoStore";
import api from "../services/api";

export default function Player() {
    const { id } = useParams<{ id: string }>();
    const { currentVideo, fetchVideoById, isLoading } = useVideoStore();
    const videoRef = useRef<HTMLVideoElement>(null);
    const navigate = useNavigate();
    const [videoUrl, setVideoUrl] = useState<string | null>(null);

    useEffect(() => {
        if (id) fetchVideoById(id);
    }, [id]);

    useEffect(() => {
        if (currentVideo?.status === "safe" && id) {
            api
                .get(`/videos/${id}/stream`, { responseType: "blob" })
                .then((res) => {
                    const url = URL.createObjectURL(res.data);
                    setVideoUrl(url);
                })
                .catch(() => console.error("Failed to load video stream"));
        }

        return () => {
            if (videoUrl) URL.revokeObjectURL(videoUrl);
        };
    }, [currentVideo]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] text-gray-400">
                Loading...
            </div>
        );
    }

    if (!currentVideo) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] text-gray-400">
                Video not found
            </div>
        );
    }

    if (currentVideo.status !== "safe") {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
                <p className="text-4xl mb-3">🚫</p>
                <p>This video is not available for playback.</p>
                <p className="text-sm mt-1">Status: {currentVideo.status}</p>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 text-indigo-400 hover:underline text-sm"
                >
                    Go back
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-6 py-8">
            <button
                onClick={() => navigate(-1)}
                className="text-sm text-gray-400 hover:text-white mb-6 flex items-center gap-1"
            >
                Back
            </button>

            <div className="bg-black rounded-xl overflow-hidden mb-6">
                {videoUrl ? (
                    <video
                        ref={videoRef}
                        controls
                        className="w-full aspect-video"
                        src={videoUrl}
                    >
                        Your browser does not support the video tag.
                    </video>
                ) : (
                    <div className="w-full aspect-video flex items-center justify-center text-gray-400">
                        Loading video...
                    </div>
                )}
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-white">{currentVideo.title}</h1>
                        {currentVideo.description && (
                            <p className="text-gray-400 text-sm mt-2">{currentVideo.description}</p>
                        )}
                    </div>
                    <span className="bg-green-500/20 text-green-400 text-xs px-3 py-1 rounded-full">
                        Safe
                    </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-6 text-sm text-gray-400">
                    <div>
                        <p className="text-gray-500 text-xs">Uploaded by</p>
                        <p className="text-white mt-0.5">{currentVideo.uploadedBy?.name}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs">Size</p>
                        <p className="text-white mt-0.5">
                            {(currentVideo.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs">Sensitivity Score</p>
                        <p className="text-white mt-0.5">{currentVideo.sensitivityScore}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}