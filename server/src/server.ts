import "dotenv/config";
import http from 'http';
import {connectDB} from "./lib/db.js";
import {Server} from 'socket.io';
import app from "./app.js";

// Create Express app and HTTP server
const server = http.createServer(app);

// Initialize Socket.io
export const io = new Server(server, {cors: {origin: '*'}})

// Store online users
export const userSocketMap: { [key: string]: string } = {};
// Socket.io connection handler
io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    console.log('User Connected: ', userId);

    if (userId) userSocketMap[String(userId)] = socket.id;

    // Emit online users to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on('disconnect', () => {
        console.log('User Disconnected', userId);
        delete userSocketMap[String(userId)];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    })
})


// Connect to MongoDB
await connectDB();

if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`Server is running on PORT: ${PORT}`));
}

// Export server for Vercel
export default server;