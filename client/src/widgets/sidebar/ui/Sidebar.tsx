import {useAuth, useChat} from "@/app/providers";
import {useEffect, useState} from "react";
import {SidebarSkeleton} from "@/shared/ui/loader";
import {SidebarHeader} from "./sidebar-header/sidebar-header";
import {SidebarContactsList} from "./sidebar-contacts-list/sidebar-contacts-list";
import {SearchInput} from "@/shared/ui/search-input/SearchInput";
import {useContacts} from "@/entities/contacts";
import {RequestsPanel} from "./requests-panel/RequestsPanel";
import {SidebarTabs} from "./sidebar-tabs/SidebarTabs";
import {SidebarTab} from "../model/sidebar-types";
import {SidebarAddList} from "./sidebar-add-list/SidebarAddList";

export const Sidebar = () => {
    const {onlineUsers} = useAuth();
    const {loading, getContacts, getRequests, searchUsers} = useContacts();
    const {selectedUser} = useChat();

    const [input, setInput] = useState('');
    const [tab, setTab] = useState<SidebarTab>("contacts");
    const [searchResults, setSearchResults] = useState<any[]>([]);

    useEffect(() => {
        getContacts();
    }, [onlineUsers]);

    useEffect(() => {
        getRequests();
    }, []);

    useEffect(() => {
        if (tab === "add" && input.trim().length > 1) {
            (async () => setSearchResults(await searchUsers(input.trim())))();
        } else {
            setSearchResults([]);
        }
    }, [tab, input, searchUsers]);

    if (loading) return <SidebarSkeleton/>;

    return (
        <div
            className={'bg-[#818582]/10 h-full p-5 rounded-r-xl overflow-y-scroll text-white' + ` ${selectedUser ? "max-md:hidden" : ""}`}>
            <div className='pb-5'>
                <SidebarHeader/>

                <SidebarTabs tab={tab} setTab={setTab}/>

                <SearchInput value={input} onChange={e => setInput(e.target.value)}
                             placeholder={tab === "add" ? "Search users to add…" : "Search contact…"}/>
            </div>

            {tab === "contacts" && <SidebarContactsList input={input}/>}

            {tab === "requests" && <RequestsPanel/>}

            {tab === "add" && <SidebarAddList input={input}/>}
        </div>
    )
}