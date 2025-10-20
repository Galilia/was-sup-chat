import {model, type Model, Schema, type Types} from "mongoose";

const MESSAGE_TYPES = ['text', 'image', 'audio'] as const;
export type MessageType = typeof MESSAGE_TYPES[number];

export interface IMessage {
    senderId: Types.ObjectId;
    receiverId: Types.ObjectId;
    type: MessageType;

    text?: string;
    image?: string;

    // audio
    audioUrl?: string;
    mime?: string;
    duration?: number;

    seen: boolean;

    createdAt: Date;
    updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
    {
        senderId: {type: Schema.Types.ObjectId, ref: "User", required: true},
        receiverId: {type: Schema.Types.ObjectId, ref: "User", required: true},

        type: {type: String, enum: MESSAGE_TYPES, default: 'text', index: true},

        text: String,
        image: String,

        // audio fields
        audioUrl: String,
        mime: String,
        duration: Number,

        seen: {type: Boolean, default: false},
    },
    {timestamps: true}
);

// At least one payload must exist based on type
messageSchema.path('type').validate(function (this: any) {
    if (this.type === 'text') return !!this.text;
    if (this.type === 'image') return !!this.image;
    if (this.type === 'audio') return !!this.audioUrl;
    return false;
}, 'Invalid message payload');

// Useful index for conversation queries (and sort by time)
messageSchema.index({senderId: 1, receiverId: 1, createdAt: -1});
messageSchema.index({receiverId: 1, senderId: 1, createdAt: -1});

const Message: Model<IMessage> = model("Message", messageSchema);
export default Message;
