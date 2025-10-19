// src/features/contact-request/respond/ui/RespondRequestButtons.tsx
import React from "react";
import {useContacts} from "@/entities/contacts";

type Props = { requestId: string; compact?: boolean };

export const RespondRequestButtons: React.FC<Props> = ({requestId, compact}) => {
    const {respondRequest} = useContacts();

    return (
        <div className={`flex items-center gap-2 ${compact ? "" : "ml-auto"}`}>
            <button
                onClick={() => respondRequest(requestId, "accept")}
                className="text-xs border border-green-400 px-2 py-1 rounded-full hover:bg-green-400/10"
            >
                Accept
            </button>
            <button
                onClick={() => respondRequest(requestId, "decline")}
                className="text-xs border border-gray-400 px-2 py-1 rounded-full hover:bg-white/10"
            >
                Decline
            </button>
        </div>
    );
};
