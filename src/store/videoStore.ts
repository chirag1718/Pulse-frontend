import { create } from "zustand";
import api from "../services/api";

interface Video {
    _id: string;
    title: string;
    description: string;
    filename: string;
    originalName: string;
    size: number;
    duration: number;
    status: "uploading" | "processing" | "safe" | "flagged";
    sensitivityScore: number;
    processingProgress: number;
    uploadedBy: { name: string; email: string };
    createdAt: string;
}

interface VideoState {
    videos: Video[];
    currentVideo: Video | null;
    isLoading: boolean;
    error: string | null;
    fetchVideos: (status?: string) => Promise<void>;
    fetchVideoById: (id: string) => Promise<void>;
    uploadVideo: (formData: FormData) => Promise<void>;
    deleteVideo: (id: string) => Promise<void>;
    updateVideoProgress: (videoId: string, progress: number) => void;
}

export const useVideoStore = create<VideoState>((set, get) => ({
    videos: [],
    currentVideo: null,
    isLoading: false,
    error: null,

    fetchVideos: async (status?) => {
        set({ isLoading: true, error: null });
        try {
            const params = status ? { status } : {};
            const res = await api.get("/videos", { params });
            set({ videos: res.data, isLoading: false });
        } catch (err: any) {
            set({
                error: err.response?.data?.message || "Failed to fetch videos",
                isLoading: false,
            });
        }
    },

    fetchVideoById: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.get(`/videos/${id}`);
            set({ currentVideo: res.data, isLoading: false });
        } catch (err: any) {
            set({
                error: err.response?.data?.message || "Failed to fetch video",
                isLoading: false,
            });
        }
    },

    uploadVideo: async (formData) => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.post("/videos/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            set((state) => ({
                videos: [res.data.video, ...state.videos],
                isLoading: false,
            }));
        } catch (err: any) {
            set({
                error: err.response?.data?.message || "Upload failed",
                isLoading: false,
            });
            throw err;
        }
    },

    deleteVideo: async (id) => {
        try {
            await api.delete(`/videos/${id}`);
            set((state) => ({
                videos: state.videos.filter((v) => v._id !== id),
            }));
        } catch (err: any) {
            set({ error: err.response?.data?.message || "Delete failed" });
        }
    },

    updateVideoProgress: (videoId, progress) => {
        set((state) => ({
            videos: state.videos.map((v) =>
                v._id === videoId
                    ? {
                          ...v,
                          processingProgress: progress,
                          status: progress === 100 ? v.status : "processing",
                      }
                    : v,
            ),
        }));
    },
}));
