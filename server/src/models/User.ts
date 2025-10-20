import {model, type Model, Schema} from "mongoose";

export interface IUser {
    _id: string;
    email: string;
    fullName: string;
    password: string;
    gender?: string;
    profilePic?: string;
    bio?: string | null | undefined;
    createdAt: Date;
    updatedAt: Date;
}

export type AuthUser = Omit<IUser, "password">;

const userSchema = new Schema<IUser>({
    email: {type: String, required: true, unique: true},
    fullName: {type: String, required: true},
    gender: {type: String, default: 'male'},
    password: {type: String, required: true, minlength: 6},
    profilePic: {type: String, default: ''},
    bio: {type: String},
}, {timestamps: true});

const User: Model<IUser> = model("User", userSchema);
export default User;
