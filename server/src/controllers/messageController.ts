// Get all users except the logged user

import User from "../models/User";
import Message from "../models/Message";
import cloudinary from "../lib/cloudinary";
import {io, userSocketMap} from "../server";
import {Response} from "express";
import {handleErrorResponse} from "../lib/utils";
import {AuthRequest} from "../lib/types";
import {NEW_MESSAGE_EVENT} from "../lib/constants";

export const getUsersForSidebar = async (req: AuthRequest, res: Response) => {
    try {
        const currentUserId = req.user?._id;

        const filteredUsers = await User.find({_id: {$ne: currentUserId}}).select("-password");

        // Count number of messages not seen
        const unseenMessages: { [key: string]: number } = {};
        const promises = filteredUsers?.map(async (user) => {
            const messages = await Message.find({
                senderId: user._id,
                receiverId: currentUserId,
                seen: false
            });

            if (messages.length > 0) {
                unseenMessages[String(user._id)] = messages.length;
            }
        });

        await Promise.all(promises);
        res.json({success: true, filteredUsers, unseenMessages});
    } catch (error) {
        handleErrorResponse(res, error);
    }
}

// Get all messages for selected user
export const getMessages = async (req: AuthRequest, res: Response) => {
    try {
        const {id: selectedUserId} = req.params;
        const currentUserId = req.user?._id;

        const messages = await Message.find({
            $or: [
                {senderId: currentUserId, receiverId: selectedUserId},
                {senderId: selectedUserId, receiverId: currentUserId}
            ]
        }).sort({createdAt: 1});

        await Message.updateMany({senderId: selectedUserId, receiverId: currentUserId}, {seen: true})

        res.json({success: true, messages});
    } catch (error) {
        handleErrorResponse(res, error);
    }
}

// api to mark messages as seen
export const markMessagesAsSeen = async (req: AuthRequest, res: Response) => {
    try {
        const {id} = req.params;
        const currentUserId = req.user?._id;

        await Message.findByIdAndUpdate(id, {seen: true});
        await Message.updateMany({senderId: id, receiverId: currentUserId}, {seen: true})
        res.json({success: true, message: "Messages marked as seen"});
    } catch (error) {
        handleErrorResponse(res, error);
    }
}

// Send message to selected user
export const sendMessage = async (req: AuthRequest, res: Response) => {
    try {
        const {text, image} = req.body;
        const receiverId = req.params.id;
        const senderId = req.user?._id;

        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }
        const newMessage = await Message.create({
            senderId, receiverId, text, image: imageUrl
        })

        // Emit the new message to the receiver if online
        const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit(NEW_MESSAGE_EVENT, newMessage);
        }

        res.json({success: true, newMessage});
    } catch (error) {
        handleErrorResponse(res, error);
    }
}

// Send audio message to selected user
export const createAudioMessage = async (req: AuthRequest, res: Response) => {
    try {
        const receiverId = req.params.id;
        const senderId = req.user?._id;
        const file = req.file;
        const rawDur = Number(req.body.duration);
        const duration = Number.isFinite(rawDur) && rawDur >= 0 ? rawDur : null;

        if (!file) return res.status(400).json({error: "No file"});

        const b64 = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
        const up = await cloudinary.uploader.upload(b64, {
            resource_type: "video",
            folder: `voice/${senderId}-${receiverId}`,
            public_id: `voice-${Date.now()}`,
            use_filename: true,
            unique_filename: false,
            overwrite: false,
        });

        const newMessage = await Message.create({
            senderId: senderId,
            receiverId: receiverId,
            type: "audio",
            audioUrl: up.secure_url,
            mime: file.mimetype,
            duration,
        });

        // Emit the new message to the receiver if online
        const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit(NEW_MESSAGE_EVENT, newMessage);
        }

        return res.json({success: true, newMessage});
    } catch (error) {
        handleErrorResponse(res, error);
    }
};
