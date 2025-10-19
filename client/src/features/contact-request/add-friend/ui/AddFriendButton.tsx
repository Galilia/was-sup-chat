import React from "react";
import {useContacts} from "@/entities/contacts";

export const AddFriendButton: React.FC<{ targetId: string; className?: string }> = ({targetId, className}) => {
    const {sendRequest} = useContacts();

    return (
        <button
            onClick={() => sendRequest(targetId)}
            className={className ?? "text-xs border border-violet-400 px-2 py-1 rounded-full hover:bg-violet-400/10"}
        >
            Add
        </button>
    );
};
