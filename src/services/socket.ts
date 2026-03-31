import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";

let socket: Socket | null = null;

export const connectSocket = (): Socket => {
    if (!socket) {
        socket = io(import.meta.env.VITE_SOCKET_URL);
    }
    return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = (): void => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
