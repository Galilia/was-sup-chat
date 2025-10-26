export type MessageType = 'text' | 'image' | 'audio';

export type Message = {
    id?: string;
    senderId: string;
    receiverId?: string;
    type: MessageType;

    text: string;
    image?: string;

    audioUrl?: string;
    mime?: string;
    duration?: number;

    seen?: boolean;

    createdAt: string;
};

export type SendMessage = { text?: string; image?: string; }

export type VoiceMessage = {
    audioUrl: string;
    mime: string;
    duration: number;
}