import express from "express";
import multer from "multer";
import {protectRoute} from "../middleware/auth";
import {
    createAudioMessage,
    getMessages,
    getUsersForSidebar,
    markMessagesAsSeen,
    sendMessage
} from "../controllers/messageController.js";

const messageRouter = express.Router();
// multer limits + mime guard
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {fileSize: 15 * 1024 * 1024},
    fileFilter: (_req, file, cb) => {
        const ok = /^(audio\/webm|audio\/ogg|audio\/mpeg|audio\/mp4|audio\/m4a|video\/webm)$/i.test(file.mimetype);
        if (ok) cb(null, true);
        else cb(new Error('Unsupported audio format')); // no second arg
    },
});


messageRouter.get('/users', protectRoute, getUsersForSidebar);
messageRouter.get('/:id', protectRoute, getMessages);
messageRouter.put('/mark/:id', protectRoute, markMessagesAsSeen);
messageRouter.post('/send/:id', protectRoute, sendMessage);
messageRouter.post("/voice/:id", protectRoute, upload.single("file"), createAudioMessage);

export default messageRouter;