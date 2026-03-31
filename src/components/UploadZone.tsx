import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useVideoStore } from "../store/videoStore";
import toast from "react-hot-toast";

export default function UploadZone() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const { uploadVideo } = useVideoStore();

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setSelectedFile(acceptedFiles[0]);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "video/*": [".mp4", ".mkv", ".webm", ".avi", ".mov"] },
        maxFiles: 1,
        maxSize: 500 * 1024 * 1024,
    });

    const handleUpload = async () => {
        if (!selectedFile) return toast.error("Please select a video file");
        if (!title.trim()) return toast.error("Please enter a title");

        const formData = new FormData();
        formData.append("video", selectedFile);
        formData.append("title", title);
        formData.append("description", description);

        setUploading(true);
        try {
            await uploadVideo(formData);
            toast.success("Video uploaded successfully");
            setTitle("");
            setDescription("");
            setSelectedFile(null);
        } catch {
            toast.error("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Upload Video</h2>

            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${isDragActive
                    ? "border-indigo-500 bg-indigo-500/10"
                    : "border-gray-700 hover:border-gray-500"
                    }`}
            >
                <input {...getInputProps()} />
                {selectedFile ? (
                    <div className="text-sm text-gray-300">
                        <p className="font-medium text-white">{selectedFile.name}</p>
                        <p className="text-gray-400 mt-1">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                        <button
                            onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                            className="mt-2 text-red-400 hover:text-red-300 text-xs"
                        >
                            Remove
                        </button>
                    </div>
                ) : (
                    <div className="text-gray-400">
                        <p className="text-2xl mb-2">📁</p>
                        <p className="text-sm">
                            {isDragActive ? "Drop the video here" : "Drag and drop a video or click to browse"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">MP4, MKV, WebM, AVI, MOV up to 500MB</p>
                    </div>
                )}
            </div>

            <div>
                <label className="block text-sm text-gray-300 mb-1">Title *</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                    placeholder="Enter video title"
                />
            </div>

            <div>
                <label className="block text-sm text-gray-300 mb-1">Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none"
                    placeholder="Optional description"
                    rows={3}
                />
            </div>

            <button
                onClick={handleUpload}
                disabled={uploading || !selectedFile || !title.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition"
            >
                {uploading ? "Uploading..." : "Upload Video"}
            </button>
        </div>
    );
}