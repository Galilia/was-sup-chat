import FriendRequest from '../models/FriendRequest'
import {Response} from "express";
import {AuthRequest} from "../lib/types";
import {handleErrorResponse} from "../lib/utils";
import Friendship from "../models/Friendship";
import User from "../models/User";
import {Types} from "mongoose";

const normPair = (u1: string | number, u2: string | number) => {
    const s1 = String(u1), s2 = String(u2);
    return s1 < s2 ? {a: u1, b: u2} : {a: u2, b: u1};
};

// GET /api/contacts
export const getContacts = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!._id;
        const me = new Types.ObjectId(userId);

        const list = await Friendship.aggregate([
            {$match: {$or: [{a: me}, {b: me}]}},                              // ← use a/b
            {$project: {friendId: {$cond: [{$eq: ["$a", me]}, "$b", "$a"]}}}, // compare with ObjectId
            {$lookup: {from: "users", localField: "friendId", foreignField: "_id", as: "friend"}},
            {$unwind: "$friend"},
            {$project: {_id: "$friend._id", fullName: "$friend.fullName", profilePic: "$friend.profilePic"}}
        ]);

        res.json({success: true, contacts: list});
    } catch (error) {
        handleErrorResponse(res, error);
    }
};

// GET /api/contacts/requests (входящие + исходящие)
export const getRequests = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?._id;
        const incoming = await FriendRequest.find({to: userId, status: 'pending'})
            .populate('from', 'fullName profilePic');
        const outgoing = await FriendRequest.find({from: userId, status: 'pending'})
            .populate('to', 'fullName profilePic');
        res.json({success: true, incoming, outgoing});
    } catch (error) {
        handleErrorResponse(res, error);
    }
};

// POST /api/contacts/request/:targetId
export const createRequest = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?._id;
        const {targetId} = req.params;

        if (!userId || !targetId) {
            return res.status(400).json({success: false, error: "Missing userId or targetId"});
        }
        if (String(userId) === String(targetId))
            return res.status(400).json({success: false, message: 'Cannot add yourself'});

        const existsFriend = await Friendship.findOne(normPair(userId, targetId));
        if (existsFriend) return res.json({success: true, message: 'Already friends'});

        const existsPending = await FriendRequest.findOne({from: userId, to: targetId, status: 'pending'});
        if (existsPending) return res.json({success: true, message: 'Request already sent'});

        const fr = await FriendRequest.create({from: userId, to: targetId, status: 'pending'});
        // TODO: socket.io notify the recipient (to)
        res.json({success: true, request: fr, message: 'Request sent'});
    } catch (error) {
        handleErrorResponse(res, error);
    }
};

// POST /api/contacts/respond  body: { requestId, action: 'accept'|'decline'|'block' }
export const respondRequest = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?._id;
        const {requestId, action} = req.body;

        const fr = await FriendRequest.findById(requestId);
        if (!fr || String(fr.to) !== String(userId) || fr.status !== 'pending') {
            return res.status(400).json({success: false, message: 'Invalid request'});
        }

        if (action === 'accept') {
            const p = normPair(String(fr.from), String(fr.to));
            await Friendship.updateOne(p, {$setOnInsert: {...p}}, {upsert: true});
            fr.status = 'accepted';
            await fr.save();
            // TODO: socket notify both
            return res.json({success: true, message: 'Friend added'});
        }

        if (action === 'decline') {
            fr.status = 'declined';
            await fr.save();
            return res.json({success: true, message: 'Request declined'});
        }

        if (action === 'block') {
            fr.status = 'blocked';
            await fr.save();
            return res.json({success: true, message: 'User blocked'});
        }

        res.status(400).json({success: false, message: 'Unknown action'});
    } catch (error) {
        handleErrorResponse(res, error);
    }
};

// DELETE /api/contacts/:friendId
export const removeContact = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?._id;
        const {friendId} = req.params;

        if (!userId || !friendId) {
            return res.status(400).json({success: false, error: "Missing userId or friendId"});
        }

        const p = normPair(userId, friendId);
        await Friendship.deleteOne(p);
        // TODO: socket notify both
        res.json({success: true});
    } catch (error) {
        handleErrorResponse(res, error);
    }
};

export const searchUsers = async (req: AuthRequest, res: Response) => {
    try {
        const q = (req.query.q as string | undefined)?.trim() ?? "";
        if (q.length <= 1) return res.json({success: true, users: []});

        const meId = req.user!._id;
        const me = new Types.ObjectId(meId);

        const friendEdges = await Friendship.find({$or: [{a: me}, {b: me}]}) // ← a/b
            .select("a b")
            .lean();

        const friendIds = new Set<string>(
            friendEdges.map(e => String(String(e.a) === String(me) ? e.b : e.a))
        );

        const pending = await FriendRequest.find({
            $or: [{from: me}, {to: me}],
            status: "pending"
        }).select("from to").lean();

        const pendingIds = new Set<string>();
        for (const r of pending) {
            if (String(r.from) !== meId) pendingIds.add(String(r.from));
            if (String(r.to) !== meId) pendingIds.add(String(r.to));
        }

        const users = await User.find({
            _id: {$ne: me},
            fullName: {$regex: q, $options: "i"}
        })
            .select("_id fullName profilePic")
            .limit(20)
            .lean();

        const filtered = users.filter(u => !friendIds.has(String(u._id)) && !pendingIds.has(String(u._id)));
        return res.json({success: true, users: filtered});
    } catch (e: any) {
        return res.status(500).json({success: false, message: e.message ?? "Search failed"});
    }
};
