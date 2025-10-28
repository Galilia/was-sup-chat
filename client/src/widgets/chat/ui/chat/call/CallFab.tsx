import {useCall} from "@/features/calls";
import {useAuth} from "@/app/providers";
import VideoSvg from '@/shared/assets/icons/call/video-camera.svg?react';

interface CallFabProps {
    selectedUserId: string;
}

export function CallFab({selectedUserId}: CallFabProps) {
    const {authUser, onlineUsers} = useAuth();
    const call = useCall(authUser!._id, {defaultWithVideo: true});

    const show = onlineUsers.includes(selectedUserId) && call.state === "idle";
    if (!show) return null;

    return (
        <button
            className="fixed bottom-6 right-6 z-[800] rounded-full w-12 h-12 flex items-center justify-center shadow-lg border bg-white hover:bg-gray-50"
            onClick={() => call.call(selectedUserId, true)}
            title="Video call"
        >
            <VideoSvg/>
        </button>
    );
}
