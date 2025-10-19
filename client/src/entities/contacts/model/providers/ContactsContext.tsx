import {createContext, useCallback, useContext, useEffect, useState} from "react";
import {useAuth} from "../../../../app/providers/auth/AuthContext";
import toast from "react-hot-toast";
import {Contact, ContactRequest} from "../types/Contacts";

type ContactsCtx = {
    contacts: Contact[];
    incoming: ContactRequest[];
    outgoing: ContactRequest[];
    loading: boolean;
    getContacts: () => Promise<void>;
    getRequests: () => Promise<void>;
    searchUsers: (q: string) => Promise<Contact[]>;
    sendRequest: (targetId: string) => Promise<void>;
    respondRequest: (requestId: string, action: "accept" | "decline" | "block") => Promise<void>;
    removeContact: (friendId: string) => Promise<void>;
};

const defaultValue: ContactsCtx = {
    contacts: [], incoming: [], outgoing: [], loading: false,
    getContacts: async () => {
    },
    getRequests: async () => {
    },
    searchUsers: async () => [], sendRequest: async () => {
    },
    respondRequest: async () => {
    },
    removeContact: async () => {
    },
};

const ContactsContext = createContext<ContactsCtx>(defaultValue);
export const useContacts = () => useContext(ContactsContext);

export const ContactsProvider = ({children}: any) => {
    const {axios, socket} = useAuth();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [incoming, setIncoming] = useState<ContactRequest[]>([]);
    const [outgoing, setOutgoing] = useState<ContactRequest[]>([]);
    const [loading, setLoading] = useState(false);

    const getContacts = useCallback(async () => {
        try {
            setLoading(true);
            const {data} = await axios.get("/api/contacts");
            if (data.success) setContacts(data.contacts);
        } catch (e: any) {
            toast.error(e.message ?? "Failed to load contacts");
        } finally {
            setLoading(false);
        }
    }, [axios]);

    const getRequests = useCallback(async () => {
        try {
            const {data} = await axios.get("/api/contacts/requests");
            if (data.success) {
                setIncoming(data.incoming);
                setOutgoing(data.outgoing);
            }
        } catch (e: any) {
            toast.error(e.message ?? "Failed to load requests");
        }
    }, [axios]);

    const searchUsers = useCallback(async (q: string) => {
        if (!q.trim()) return [];
        try {
            const {data} = await axios.get(`/api/users/search?q=${encodeURIComponent(q)}`);
            return data.users ?? [];
        } catch {
            return [];
        }
    }, [axios]);

    const sendRequest = useCallback(async (targetId: string) => {
        try {
            const {data} = await axios.post(`/api/contacts/request/${targetId}`);
            data.success ? (toast.success("Request sent"), getRequests()) : toast.error(data.message);
        } catch (e: any) {
            toast.error(e.message ?? "Failed to send request");
        }
    }, [axios, getRequests]);

    const respondRequest = useCallback(async (requestId: string, action: "accept" | "decline" | "block") => {
        try {
            const {data} = await axios.post("/api/contacts/respond", {requestId, action});
            if (data.success) {
                if (action === "accept") await getContacts();
                await getRequests();
                toast.success(action === "accept" ? "Friend added" : action === "decline" ? "Declined" : "Blocked");
            } else toast.error(data.message);
        } catch (e: any) {
            toast.error(e.message ?? "Failed");
        }
    }, [axios, getContacts, getRequests]);

    const removeContact = useCallback(async (friendId: string) => {
        try {
            const {data} = await axios.delete(`/api/contacts/${friendId}`);
            data.success ? (toast.success("Removed"), getContacts()) : toast.error(data.message);
        } catch (e: any) {
            toast.error(e.message ?? "Failed to remove");
        }
    }, [axios, getContacts]);

    // optional: react to socket contact events
    useEffect(() => {
        if (!socket) return;
        const refresh = () => {
            getContacts();
            getRequests();
        };
        socket.on("contact:request", refresh);
        socket.on("contact:accepted", refresh);
        return () => {
            socket.off("contact:request", refresh);
            socket.off("contact:accepted", refresh);
        };
    }, [socket, getContacts, getRequests]);

    useEffect(() => {
        getContacts();
        getRequests();
    }, [getContacts, getRequests]);

    return (
        <ContactsContext.Provider value={{
            contacts, incoming, outgoing, loading,
            getContacts, getRequests, searchUsers, sendRequest, respondRequest, removeContact
        }}>
            {children}
        </ContactsContext.Provider>
    );
};
