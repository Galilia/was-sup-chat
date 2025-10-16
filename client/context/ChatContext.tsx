import {createContext, useCallback, useContext, useEffect, useState} from "react";
import {useAuth} from "./AuthContext";
import toast from "react-hot-toast";
import {type User} from "../src/entities/user/User";
import type {Message, SendMessage} from "../src/entities/message/Message";
import {getErrorMessage} from "../src/shared/lib/utils";

interface ChatContextType {
    messages: Message[];
    users: User[];
    usersLoading: boolean;
    selectedUser: User | null;
    setSelectedUser: (user: User | null) => void;
    unseenMessages: Record<string, number>;
    setUnseenMessages: (unseen: Record<string, number>) => void;
    getUsers: () => Promise<void>;
    getMessages: (userId: string) => Promise<void>;
    sendMessage: (messageData: SendMessage) => Promise<void>;
}

const defaultChatContext: ChatContextType = {
    messages: [],
    users: [],
    usersLoading: false,
    selectedUser: null,
    setSelectedUser: () => {
    },
    unseenMessages: {},
    setUnseenMessages: () => {
    },
    getUsers: async () => {
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
    const [users, setUsers] = useState<User[]>([]);
    const [usersLoading, setUsersLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [unseenMessages, setUnseenMessages] = useState<Record<string, number>>({});

    // functions to get all users for sidebar
    const getUsers = useCallback(async () => {
        try {
            setUsersLoading(true);
            const {data} = await axios.get('/api/messages/users');
            if (data.success) {
                setUsers(data.filteredUsers);
                setUnseenMessages(data.unseenMessages);
            }
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setUsersLoading(false);
        }
    }, []);

    // function to get all messages for selected user
    const getMessages = async (userId: string) => {
        try {
            const {data} = await axios.get(`/api/messages/${userId}`);
            if (data.success) {
                setMessages(data.messages);
            }
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    }

    // function to send message to selected user
    const sendMessage = async ({text, image}: SendMessage) => {
        try {
            if (!selectedUser?._id) {
                toast.error("No user selected");
                return;
            }

            const {data} = await axios.post(`/api/messages/send/${selectedUser._id}`, {text, image});
            if (data.success) {
                setMessages(prev => [...prev, data.newMessage]);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    }

    // function to subscribe to messages for selected user
    const subscribeToMessages = () => {
        if (!socket) return;

        socket.on("newMessage", (newMessage) => {
            if (selectedUser && newMessage.senderId === selectedUser._id) {
                newMessage.seen = true;
                setMessages(prev => [...prev, newMessage]);
                axios.put(`/api/messages/mark/${newMessage._id}`);
            } else {
                setUnseenMessages((prev) => ({
                    ...prev,
                    [newMessage.senderId]: prev[newMessage.senderId]
                        ? prev[newMessage.senderId] + 1
                        : 1,
                }))
            }
        })
    }

    // function to unsubscribe from messages
    const unsubscribeFromMessages = () => {
        if (socket) socket.off("newMessage");
    }

    useEffect(() => {
        subscribeToMessages();
        return () => unsubscribeFromMessages();
    }, [socket, selectedUser]);

    return (
        <ChatContext.Provider value={{
            messages,
            users,
            usersLoading,
            selectedUser,
            setSelectedUser,
            unseenMessages,
            setUnseenMessages,
            getUsers,
            getMessages,
            sendMessage,
        }}>
            {children}
        </ChatContext.Provider>
    )
}