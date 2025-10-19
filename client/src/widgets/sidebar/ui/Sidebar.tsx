import {useAuth, useChat} from "@/app/providers";
import {useEffect, useState} from "react";
import {SidebarSkeleton} from "@/shared/ui/loader";
import {SidebarHeader} from "./sidebar-header/sidebar-header";
import {SidebarContactsList} from "./sidebar-contacts-list/sidebar-contacts-list";
import {SearchInput} from "@/shared/ui/search-input/SearchInput";
import {useContacts} from "@/app/providers/contacts/ContactsContext";


export const Sidebar = () => {
    const {onlineUsers} = useAuth();
    const {loading, getContacts} = useContacts();
    const {selectedUser} = useChat();

    const [input, setInput] = useState('');

    useEffect(() => {
        getContacts();
    }, [onlineUsers]);

    if (loading) return <SidebarSkeleton/>;

    return (
        <div className={'bg-[#818582]/10 h-full p-5 rounded-r-xl overflow-y-scroll text-white' +
            ` ${selectedUser ? "max-md:hidden" : ""}`}>
            <div className='pb-5'>
                <SidebarHeader/>

                <SearchInput value={input} onChange={e => setInput(e.target.value)} placeholder="Search User..."/>
            </div>

            <SidebarContactsList input={input}/>
        </div>
    )
}