import mongoose from "mongoose";

const FriendRequestSchema = new mongoose.Schema(
    {
        from: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true},
        to: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true},
        status: {
            type: String,
            enum: ['pending', 'accepted', 'declined', 'blocked'],
            default: 'pending',
            index: true,
        },
    },
    {timestamps: true}
);

// prohibition of duplicate pending requests
FriendRequestSchema.index(
    {from: 1, to: 1, status: 1},
    {unique: true, partialFilterExpression: {status: 'pending'}}
);

const FriendRequest = mongoose.model("FriendRequest", FriendRequestSchema);

export default FriendRequest;
