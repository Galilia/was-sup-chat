import {createContext, useContext, useEffect, useState} from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {io, type Socket} from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
axios.defaults.baseURL = backendUrl;

interface AuthContextType {
    axios: typeof axios;
    authUser: any;
    onlineUsers: any[];
    socket: Socket | null;
    login: (state: string, credentials: any) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (body: any) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({children}) => {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [authUser, setAuthUser] = useState<Socket | null>(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [socket, setSocket] = useState(null);

    // Connect socket function to handle socket connection
    const connectSocket = (userData) => {
        if (!userData || socket?.connected) return;

        const newSocket = io(backendUrl, {
            query: {userId: userData._id}
        })
        newSocket.connect();
        setSocket(newSocket);

        newSocket.on("getOnlineUsers", (userIds) => {
            setOnlineUsers(userIds);
        })
    }

    // Check if user is authenticated
    const isAuthenticated = async () => {
        try {
            const {data} = await axios.get("/api/auth/check")
            if (data.success) {
                setAuthUser(data.user);
                connectSocket(data.user);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    // Login function to handle user authentication and socket connection
    const login = async (state, credentials) => {
        try {
            const {data} = await axios.post(`/api/auth/${state}`, credentials);
            if (data.success) {
                setAuthUser(data.userData);
                connectSocket(data.userData);
                axios.defaults.headers.common['token'] = data.token;
                setToken(data.token);
                localStorage.setItem("token", data.token);
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
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
        socket.disconnect();
    }

    // Update profile function to handle user profile updates
    const updateProfile = async (body) => {
        try {
            const {data} = await axios.put("/api/auth/update-profile", body);
            if (data.success) {
                setAuthUser(data.user);
                toast.success('Profile updated successfully');
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common["token"] = token;
        }

        isAuthenticated();
    }, [])

    const value = {
        axios,
        authUser,
        onlineUsers,
        socket,
        login,
        logout,
        updateProfile
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}