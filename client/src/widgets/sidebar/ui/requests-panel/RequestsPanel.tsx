import {useContacts} from "@/entities/contacts";
import assets from "@/shared/assets";

export const RequestsPanel = () => {
    const {incoming, outgoing, respondRequest} = useContacts();

    return (
        <div className="space-y-3">
            <p className="text-xs text-neutral-300 mt-2">Incoming</p>
            {incoming.length === 0 && <p className="text-xs text-neutral-500">No incoming requests</p>}
            {incoming.map((r) => (
                <div key={r._id} className="flex items-center gap-2 p-2 rounded border border-gray-700">
                    <img src={r.from?.profilePic || assets.avatar_icon} className="w-8 h-8 rounded-full"/>
                    <div className="flex-1">
                        <p className="text-sm">{r.from?.fullName}</p>
                    </div>
                    <button
                        onClick={() => respondRequest(r._id, "accept")}
                        className="text-xs border border-green-400 px-2 py-1 rounded-full hover:bg-green-400/10"
                    >
                        Accept
                    </button>
                    <button
                        onClick={() => respondRequest(r._id, "decline")}
                        className="text-xs border border-gray-400 px-2 py-1 rounded-full hover:bg-white/10"
                    >
                        Decline
                    </button>
                </div>
            ))}

            <p className="text-xs text-neutral-300 mt-4">Outgoing</p>
            {outgoing.length === 0 && <p className="text-xs text-neutral-500">No outgoing requests</p>}
            {outgoing.map((r) => (
                <div key={r._id} className="flex items-center gap-2 p-2 rounded border border-gray-700 opacity-70">
                    <img src={r.to?.profilePic || assets.avatar_icon} className="w-8 h-8 rounded-full"/>
                    <div className="flex-1">
                        <p className="text-sm">{r.to?.fullName}</p>
                    </div>
                    <span className="text-[11px] text-neutral-400">Pending…</span>
                </div>
            ))}
        </div>
    );
};
