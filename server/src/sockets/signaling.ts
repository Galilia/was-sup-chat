// src/sockets/signaling.ts
import {Server} from "socket.io";

export function attachSignaling(io: Server) {
    io.on("connection", (socket) => {
        const userId = socket.handshake.query.userId as string | undefined;

        // ---- AUDIO/VIDEO CALL SIGNALING EVENTS ----

        socket.on("call:request", ({toUserId}) => {
            io.to(toUserId).emit("call:ringing", {fromUserId: userId});
        });

        socket.on("call:reject", ({toUserId}) => {
            io.to(toUserId).emit("call:rejected", {fromUserId: userId});
        });

        socket.on("call:accept", ({toUserId}) => {
            io.to(toUserId).emit("call:accepted", {fromUserId: userId});
        });

        socket.on("webrtc:offer", ({toUserId, sdp}) => {
            io.to(toUserId).emit("webrtc:offer", {fromUserId: userId, sdp});
        });

        socket.on("webrtc:answer", ({toUserId, sdp}) => {
            io.to(toUserId).emit("webrtc:answer", {fromUserId: userId, sdp});
        });

        socket.on("webrtc:ice-candidate", ({toUserId, candidate}) => {
            io.to(toUserId).emit("webrtc:ice-candidate", {fromUserId: userId, candidate});
        });

        socket.on("call:end", ({toUserId}) => {
            io.to(toUserId).emit("call:ended", {fromUserId: userId});
        });
    });
}
