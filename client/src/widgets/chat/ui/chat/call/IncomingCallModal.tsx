import React from "react";

export const IncomingCallModal: React.FC<{
    visible: boolean;
    callerName?: string;
    onAccept: () => void;
    onReject: () => void;
}> = ({visible, callerName, onAccept, onReject}) => {
    if (!visible) return null;
    return (
        <div className="fixed inset-0 z-[1000] bg-black/40 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-[320px]">
                <div className="text-lg font-semibold mb-1">Incoming call</div>
                <div className="text-sm text-gray-600 mb-5">{callerName ?? "User"}</div>
                <div className="flex gap-2">
                    <button
                        className="flex-1 rounded-lg border py-2 hover:bg-gray-50"
                        onClick={onReject}
                    >
                        Decline
                    </button>
                    <button
                        className="flex-1 rounded-lg bg-green-600 text-white py-2 hover:bg-green-700"
                        onClick={onAccept}
                    >
                        Accept
                    </button>
                </div>
            </div>
        </div>
    );
};
