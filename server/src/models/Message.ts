import {model, type Model, Schema, type Types} from "mongoose";

export interface IMessage {
    senderId: Types.ObjectId;
    receiverId: Types.ObjectId;
    text?: string;
    image?: string;
    seen: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
    {
        senderId: {type: Schema.Types.ObjectId, ref: "User", required: true},
        receiverId: {type: Schema.Types.ObjectId, ref: "User", required: true},
        text: String,
        image: String,
        seen: {type: Boolean, default: false},
    },
    {timestamps: true}
);

const Message: Model<IMessage> = model("Message", messageSchema);
export default Message;
