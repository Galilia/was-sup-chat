import {User} from "@/entities/user";
import assets from "@/shared/assets";
import {useAuth} from "@/app/providers";

interface ChatHeaderProps {
    selectedUser: User;
    setSelectedUser: (user: User | null) => void;
}

export const ChatHeader = ({selectedUser, setSelectedUser}: ChatHeaderProps) => {
    const {onlineUsers} = useAuth();

    return (
        <div className='flex items-center gap-3 py-3 mx-4 border-b border-stone-500'>
            <img src={selectedUser?.profilePic || assets.avatar_icon} alt=""
                 className="max-w-[40px] max-h-[40px] rounded-full"/>

            <p className='flex-1 text-lg text-white flex items-center gap-2'>
                {selectedUser.fullName}
                {onlineUsers.includes(selectedUser._id) && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
            </p>

            <img onClick={() => setSelectedUser(null)} src={assets.help_icon} alt="" className='md:hidden max-w-7'/>

            <img src={assets.help_icon} alt=""/>
        </div>
    )
}