import {createContext, useContext, useEffect, useState} from "react";
import {useAuth} from "../../../../app/providers/auth/AuthContext";
import toast from "react-hot-toast";
import {type User} from "../../../user/model/types/User";
import type {Message, SendMessage} from "../types/Message";
import {getErrorMessage} from "../../../../shared/lib/utils/common";

interface ChatContextType {
    messages: Message[];
    selectedUser: User | null;
    setSelectedUser: (user: User | null) => void;
    unseenMessages: Record<string, number>;
    setUnseenMessages: (unseen: Record<string, number>) => void;
    getMessages: (userId: string) => Promise<void>;
    sendMessage: (messageData: SendMessage) => Promise<void>;
}

const defaultChatContext: ChatContextType = {
    messages: [],
    selectedUser: null,
    setSelectedUser: () => {
    },
    unseenMessages: {},
    setUnseenMessages: () => {
    },
    getMessages: async () => {
    },
    sendMessage: async () => {
    },
};

export const ChatContext = createContext<ChatContextType>(defaultChatContext);

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({children}: any) => {
    const {socket, axios} = useAuth();

    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [unseenMessages, setUnseenMessages] = useState<Record<string, number>>({});

    const getMessages = async (userId: string) => {
        try {
            const {data} = await axios.get(`/api/messages/${userId}`);
            if (data.success) setMessages(data.messages as Message[]);
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    const sendMessage = async ({text, image}: SendMessage) => {
        try {
            if (!selectedUser?._id) {
                toast.error("No user selected");
                return;
            }
            const {data} = await axios.post(`/api/messages/send/${selectedUser._id}`, {text, image});
            if (data.success) setMessages((prev) => [...prev, data.newMessage as Message]);
            else toast.error(data.message);
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    useEffect(() => {
        if (!socket) return;

        const onNew = (newMessage: Message & { senderId: string; _id: string }) => {
            if (selectedUser && newMessage.senderId === selectedUser._id) {
                (newMessage as any).seen = true;
                setMessages((prev) => [...prev, newMessage]);
                axios.put(`/api/messages/mark/${newMessage._id}`).catch(() => void 0);
            } else {
                setUnseenMessages((prev) => ({
                    ...prev,
                    [newMessage.senderId]: (prev[newMessage.senderId] ?? 0) + 1,
                }));
            }
        };
        socket.on("newMessage", onNew);

        return () => {
            socket.off("newMessage", onNew);
        };
    }, [socket, selectedUser, axios]);


    return (
        <ChatContext.Provider
            value={{
                messages,
                selectedUser,
                setSelectedUser,
                unseenMessages,
                setUnseenMessages,
                getMessages,
                sendMessage,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};
