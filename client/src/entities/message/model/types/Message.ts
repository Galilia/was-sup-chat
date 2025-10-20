export type Message = {
    senderId: string;
    text: string;
    image?: string;
    createdAt: string;
};

export type SendMessage = {
    text?: string;
    image?: string;
}

export type VoiceMessage = {
    audioUrl: string;
    mime: string;
    duration: number;
}