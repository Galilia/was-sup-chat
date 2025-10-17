import mongoose from "mongoose";

const FriendshipSchema = new mongoose.Schema(
    {
        a: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true},
        b: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true},
    },
    {timestamps: true}
);

// store the pair (a,b) in sorted form and prevent duplicates
FriendshipSchema.index({a: 1, b: 1}, {unique: true});

const Friendship = mongoose.model("Friendship", FriendshipSchema);

export default Friendship
