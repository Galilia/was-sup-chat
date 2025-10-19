// src/widgets/sidebar/ui/sidebar-add-list/SidebarAddList.tsx
import {useEffect, useState} from "react";
import {useContacts} from "@/entities/contacts";
import assets from "@/shared/assets";
import {AddFriendButton} from "@/features/contact-request";

interface SidebarAddListProps {
    input: string;
}

export const SidebarAddList = ({input}: SidebarAddListProps) => {
    const {searchUsers} = useContacts();
    const [results, setResults] = useState<any[]>([]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            if (input.trim().length > 1) {
                const list = await searchUsers(input.trim());
                if (!cancelled) setResults(list);
            } else {
                setResults([]);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [input, searchUsers]);

    return (
        <div className="space-y-2">
            {results.map((u) => (
                <div key={u._id} className="flex items-center gap-2 p-2 rounded hover:bg-white/5">
                    <img src={u.profilePic || assets.avatar_icon} className="w-8 h-8 rounded-full"/>
                    <div className="flex-1"><p className="text-sm">{u.fullName}</p></div>
                    <AddFriendButton targetId={u._id}/>
                </div>
            ))}
            {input.trim() && results.length === 0 && (
                <p className="text-xs text-neutral-500">No users found.</p>
            )}
        </div>
    );
};
