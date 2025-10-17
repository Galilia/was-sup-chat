import FriendRequest from '../models/FriendRequest.js'

const normPair = (u1, u2) => {
    const s1 = String(u1), s2 = String(u2);
    return s1 < s2 ? {a: u1, b: u2} : {a: u2, b: u1};
};

// GET /api/contacts
export const getContacts = async (req, res) => {
    try {
        const userId = req.user._id;
        const list = await Friendship.aggregate([
            {$match: {$or: [{a: userId}, {b: userId}]}},
            {$project: {friendId: {$cond: [{$eq: ['$a', userId]}, '$b', '$a']}}},
            {$lookup: {from: 'users', localField: 'friendId', foreignField: '_id', as: 'friend'}},
            {$unwind: '$friend'},
            {$project: {_id: '$friend._id', fullName: '$friend.fullName', profilePic: '$friend.profilePic'}}
        ]);
        res.json({success: true, contacts: list});
    } catch (e) {
        res.status(500).json({success: false, message: e.message});
    }
};

// GET /api/contacts/requests (входящие + исходящие)
export const getRequests = async (req, res) => {
    try {
        const userId = req.user._id;
        const incoming = await FriendRequest.find({to: userId, status: 'pending'})
            .populate('from', 'fullName profilePic');
        const outgoing = await FriendRequest.find({from: userId, status: 'pending'})
            .populate('to', 'fullName profilePic');
        res.json({success: true, incoming, outgoing});
    } catch (e) {
        res.status(500).json({success: false, message: e.message});
    }
};

// POST /api/contacts/request/:targetId
export const createRequest = async (req, res) => {
    try {
        const userId = req.user._id;
        const {targetId} = req.params;

        if (String(userId) === String(targetId))
            return res.status(400).json({success: false, message: 'Cannot add yourself'});

        const existsFriend = await Friendship.findOne(normPair(userId, targetId));
        if (existsFriend) return res.json({success: true, message: 'Already friends'});

        const existsPending = await FriendRequest.findOne({from: userId, to: targetId, status: 'pending'});
        if (existsPending) return res.json({success: true, message: 'Request already sent'});

        const fr = await FriendRequest.create({from: userId, to: targetId, status: 'pending'});
        // TODO: socket.io notify the recipient (to)
        res.json({success: true, request: fr, message: 'Request sent'});
    } catch (e) {
        res.status(500).json({success: false, message: e.message});
    }
};

// POST /api/contacts/respond  body: { requestId, action: 'accept'|'decline'|'block' }
export const respondRequest = async (req, res) => {
    try {
        const userId = req.user._id;
        const {requestId, action} = req.body;

        const fr = await FriendRequest.findById(requestId);
        if (!fr || String(fr.to) !== String(userId) || fr.status !== 'pending') {
            return res.status(400).json({success: false, message: 'Invalid request'});
        }

        if (action === 'accept') {
            const p = normPair(fr.from, fr.to);
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
    } catch (e) {
        res.status(500).json({success: false, message: e.message});
    }
};

// DELETE /api/contacts/:friendId
export const removeContact = async (req, res) => {
    try {
        const userId = req.user._id;
        const {friendId} = req.params;
        const p = normPair(userId, friendId);
        await Friendship.deleteOne(p);
        // TODO: socket notify both
        res.json({success: true});
    } catch (e) {
        res.status(500).json({success: false, message: e.message});
    }
};
