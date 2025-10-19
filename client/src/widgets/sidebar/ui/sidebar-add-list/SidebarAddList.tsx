// src/widgets/sidebar/ui/sidebar-add-list/SidebarAddList.tsx
import {useEffect, useRef, useState} from "react";
import {useContacts} from "@/entities/contacts";
import assets from "@/shared/assets";
import {AddFriendButton} from "@/features/contact-request";
import {debounce} from "@/shared/lib/utils";

interface SidebarAddListProps {
    input: string;
}

export const SidebarAddList = ({input}: SidebarAddListProps) => {
    const {searchUsers} = useContacts();
    const [results, setResults] = useState<any[]>([]);

    const debouncedSearch = useRef(
        debounce(async (q: string) => {
            if (q.trim().length > 1) {
                const list = await searchUsers(q.trim());
                setResults(list);
            } else {
                setResults([]);
            }
        }, 400)
    ).current;

    useEffect(() => {
        debouncedSearch(input);
    }, [input, searchUsers]);

    return (
        <div className="space-y-2">
            {results.map((user) => (
                <div key={user._id} className="flex items-center gap-2 p-2 rounded hover:bg-white/5">
                    <img src={user.profilePic || assets.avatar_icon} className="w-8 h-8 rounded-full"/>
                    <div className="flex-1"><p className="text-sm">{user.fullName}</p></div>
                    <AddFriendButton targetId={user._id}/>
                </div>
            ))}
            {input.trim() && results.length === 0 && (
                <p className="text-xs text-neutral-500">No users found.</p>
            )}
        </div>
    );
};
