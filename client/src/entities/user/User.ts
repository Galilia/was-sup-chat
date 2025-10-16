export type User = {
    _id: string;
    fullName: string;
    gender?: string;
    profilePic?: string;
}

export type Credentials = Record<string, unknown>;