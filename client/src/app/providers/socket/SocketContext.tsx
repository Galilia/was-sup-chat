import {createContext, useContext, useEffect, useMemo, useRef} from 'react';
import {io, Socket} from 'socket.io-client';
import {AuthContext, useAuth} from "../auth/AuthContext";

type SocketContextValue = { socket: Socket | null };
const SocketContext = createContext<SocketContextValue>({socket: null});

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({children}: { children: React.ReactNode }) {
    const {authUser} = useAuth();
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!authUser?._id) {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            return;
        }

        if (socketRef.current?.connected && socketRef.current.io.opts.query?.userId === authUser._id) return;

        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }

        const s = io(import.meta.env.VITE_SIGNALING_URL as string, {
            transports: ['websocket'],
            withCredentials: true,
            query: {userId: authUser._id},
        });

        socketRef.current = s;
        return () => {
            s.disconnect();
            if (socketRef.current === s) socketRef.current = null;
        };
    }, [authUser?._id]);

    const value = useMemo(() => ({socket: socketRef.current}), [socketRef.current]);
    
    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>)
}