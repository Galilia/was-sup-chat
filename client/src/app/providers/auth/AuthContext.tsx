import {createContext, useContext, useEffect, useState} from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {io, type Socket} from "socket.io-client";
import type {Credentials, User} from "../../../entities/user/model/types/User";
import {getErrorMessage} from "../../../shared/lib/utils/common";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
axios.defaults.baseURL = backendUrl;

interface AuthContextType {
    axios: typeof axios;
    authUser: User | null;
    authLoading: boolean;
    onlineUsers: string[];
    socket: Socket | null;
    login: (state: string, credentials: Credentials) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (body: Partial<User>) => Promise<void>;
}

const defaultAuthContext: AuthContextType = {
    axios,
    authUser: null,
    authLoading: false,
    onlineUsers: [],
    socket: null,
    login: async () => {
    },
    logout: async () => {
    },
    updateProfile: async () => {
    },
};

export const AuthContext = createContext<AuthContextType>(defaultAuthContext);


export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({children}: any) => {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [authUser, setAuthUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const [socket, setSocket] = useState<Socket | null>(null);

    // Connect socket function to handle socket connection
    const connectSocket = (userData: User | null) => {
        if (!userData || socket?.connected) return;

        const newSocket = io(backendUrl, {
            query: {userId: userData._id}
        })
        newSocket.connect();
        setSocket(newSocket);

        newSocket.on("getOnlineUsers", (userIds: string[]) => {
            setOnlineUsers(userIds);
        })
    }

    // Check if user is authenticated
    const isAuthenticated = async () => {
        try {
            const {data} = await axios.get("/api/auth/check")
            if (data.success) {
                setAuthUser(data.user as User);
                connectSocket(data.user as User);
            }
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setAuthLoading(false);
        }
    }

    // Login function to handle user authentication and socket connection
    const login = async (state: string, credentials: Credentials) => {
        try {
            const {data} = await axios.post(`/api/auth/${state}`, credentials);
            if (data.success) {
                setAuthUser(data.userData as User);
                connectSocket(data.userData as User);
                axios.defaults.headers.common['token'] = data.token as string;
                setToken(data.token);
                localStorage.setItem("token", data.token as string);
                toast.success(data.message as string);
            } else {
                toast.error((data.message as string) ?? "Auth failed");
            }
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    }

    // Logout function to handle user logout and socket disconnection
    const logout = async () => {
        localStorage.removeItem("token");
        setToken(null);
        setAuthUser(null);
        setOnlineUsers([]);
        axios.defaults.headers.common['token'] = null;
        toast.success("Logged out successfully");
        socket?.disconnect();
    }

    // Update profile function to handle user profile updates
    const updateProfile = async (body: Partial<User>) => {
        try {
            const {data} = await axios.put("/api/auth/update-profile", body);
            if (data.success) {
                setAuthUser(data.user as User);
                toast.success('Profile updated successfully');
            }
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    }

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common["token"] = token;
        }

        isAuthenticated();
    }, [])

    return (
        <AuthContext.Provider value={{
            axios,
            authUser,
            authLoading,
            onlineUsers,
            socket,
            login,
            logout,
            updateProfile
        }}>
            {children}
        </AuthContext.Provider>
    )
}