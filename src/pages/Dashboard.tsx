import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useVideoStore } from "../store/videoStore";
import { connectSocket } from "../services/socket";
import UploadZone from "../components/UploadZone";
import VideoCard from "../components/VideoCard";

export default function Dashboard() {
    const { user } = useAuthStore();
    const { videos, fetchVideos, updateVideoProgress } = useVideoStore();
    const canUpload = user?.role === "editor" || user?.role === "admin";

    useEffect(() => {
        fetchVideos();
        const socket = connectSocket();

        return () => {
            socket.off();
        };
    }, []);

    useEffect(() => {
        const socket = connectSocket();
        videos.forEach((video) => {
            if (video.status === "processing" || video.status === "uploading") {
                socket.on(`progress:${video._id}`, ({ progress }: { progress: number }) => {
                    updateVideoProgress(video._id, progress);
                    if (progress === 100) {
                        fetchVideos();
                    }
                });
            }
        });

        return () => {
            videos.forEach((video) => {
                socket.off(`progress:${video._id}`);
            });
        };
    }, [videos]);

    const processingVideos = videos.filter(
        (v) => v.status === "processing" || v.status === "uploading"
    );

    return (
        <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <p className="text-gray-400 text-sm mt-1">
                    Welcome back, {user?.name}
                </p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                    <p className="text-gray-400 text-sm">Total Videos</p>
                    <p className="text-3xl font-bold text-white mt-1">{videos.length}</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                    <p className="text-gray-400 text-sm">Safe Videos</p>
                    <p className="text-3xl font-bold text-green-400 mt-1">
                        {videos.filter((v) => v.status === "safe").length}
                    </p>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                    <p className="text-gray-400 text-sm">Flagged Videos</p>
                    <p className="text-3xl font-bold text-red-400 mt-1">
                        {videos.filter((v) => v.status === "flagged").length}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-8">
                <div className="col-span-2 space-y-6">
                    {processingVideos.length > 0 && (
                        <div>
                            <h2 className="text-lg font-semibold text-white mb-4">
                                Processing ({processingVideos.length})
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                {processingVideos.map((video) => (
                                    <VideoCard key={video._id} video={video} />
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <h2 className="text-lg font-semibold text-white mb-4">
                            Recent Videos
                        </h2>
                        {videos.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <p className="text-4xl mb-3">🎬</p>
                                <p>No videos yet</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                {videos.slice(0, 6).map((video) => (
                                    <VideoCard key={video._id} video={video} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    {canUpload ? (
                        <UploadZone />
                    ) : (
                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center text-gray-400 text-sm">
                            <p className="text-2xl mb-2">👁</p>
                            <p>You have viewer access.</p>
                            <p className="mt-1">Contact an admin to upload videos.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}