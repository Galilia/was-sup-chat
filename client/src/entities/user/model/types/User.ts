export type User = {
    _id: string;
    fullName: string;
    gender?: string;
    profilePic?: string;
    bio?: string;
}

export type Credentials = Record<string, unknown>;