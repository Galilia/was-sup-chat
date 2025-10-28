import {User} from "@/entities/user";
import assets from "@/shared/assets";
import {useAuth} from "@/app/providers";
import {useCall} from "@/features/calls/model/hooks/useCall";
import VideoSvg from '@/shared/assets/icons/call/video-camera.svg?react';
import AudioSvg from '@/shared/assets/icons/call/telephone.svg?react';

interface ChatHeaderProps {
    selectedUser: User;
    setSelectedUser: (user: User | null) => void;
}

export const ChatHeader = ({selectedUser, setSelectedUser}: ChatHeaderProps) => {
    const {authUser, onlineUsers} = useAuth();
    const call = useCall(authUser!._id, {defaultWithVideo: true});

    return (
        <div className='flex items-center gap-3 py-3 mx-4 border-b border-stone-500'>
            <img onClick={() => setSelectedUser(null)} src={assets.arrow_left} alt="" className='md:hidden max-w-7'/>

            <img src={selectedUser?.profilePic || assets.avatar_icon} alt=""
                 className="max-w-[40px] max-h-[40px] rounded-full"/>

            <p className='flex-1 text-lg text-white flex items-center gap-2'>
                {selectedUser.fullName}
                {onlineUsers.includes(selectedUser._id) && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
            </p>

            <div className="flex items-center gap-2">
                {/* Call button */}
                <button
                    className="rounded-full px-3 py-1 cursor-pointer"
                    onClick={() => call.call(selectedUser._id, true)}
                    disabled={call.state !== "idle"}
                    title="Video call"
                >
                    <AudioSvg/>
                </button>

                <button
                    className="rounded-full px-3 py-1 cursor-pointer"
                    onClick={() => call.call(selectedUser._id, true)}
                    disabled={call.state !== "idle"}
                    title="Video call"
                >
                    <VideoSvg/>
                </button>
            </div>

            <img src={assets.dots_icon} alt=""/>
        </div>
    )
}