import {User} from "@/entities/user";

export type Contact = Pick<User, "_id" | "fullName" | "profilePic">;
export type ContactRequestStatus = "pending" | "accepted" | "declined" | "blocked";
export type ContactRequest = {
    _id: string;
    from?: Contact;
    to?: Contact;
    status: ContactRequestStatus;
    createdAt: string;
};