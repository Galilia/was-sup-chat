import {createContext, useCallback, useContext, useEffect, useState} from "react";
import {useAuth} from "./AuthContext";
import toast from "react-hot-toast";
import {User} from "../src/types/User";
import {Message} from "../src/types/Message";

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
    sendMessage: (messageData: any) => Promise<void>;
}

export const ChatContext = createContext<ChatContextType | null>(null);

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({children}) => {
    const {socket, axios} = useAuth();
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({});

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
            toast.error(error.message);
        } finally {
            setUsersLoading(false);
        }
    }, []);

    // function to get all messages for selected user
    const getMessages = async (userId) => {
        try {
            const {data} = await axios.get(`/api/messages/${userId}`);
            if (data.success) {
                setMessages(data.messages);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    // function to send message to selected user
    const sendMessage = async (messageData) => {
        try {
            const {data} = await axios.post(`/api/messages/send/${selectedUser._id}`, {messageData});
            if (data.success) {
                setMessages(prev => [...prev, data.newMessage]);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
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