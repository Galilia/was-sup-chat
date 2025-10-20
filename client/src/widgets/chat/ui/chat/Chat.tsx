import {useAuth, useChat} from "@/app/providers";
import {User} from "@/entities/user";
import {formatMessageTime} from "@/shared/lib/utils/common";
import assets from "@/shared/assets";

interface ChatProps {
    selectedUser: User;
}

export const Chat = ({selectedUser}: ChatProps) => {
    const {authUser} = useAuth();
    const {messages} = useChat();

    return (
        <div className='flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6'>
            {messages.map((msg, index) => (
                <div key={index} className={`flex items-end gap-2 justify-end
                        ${msg.senderId !== authUser?._id && 'flex-row-reverse'}`}>
                    {msg.image ? (
                        <img src={msg.image} alt=""
                             className='max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8'/>
                    ) : (
                        <p className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-8 break-all bg-violet-500/30 text-white 
                            ${msg.senderId === authUser?._id ? 'rounded-br-none' : 'rounded-bl-none'}`}>
                            {msg.text}
                        </p>
                    )}

                    <div className='text-center text-xs'>
                        <img alt="" className='w-7 rounded-full'
                             src={msg.senderId === authUser?._id
                                 ? (authUser?.profilePic || assets?.avatar_icon)
                                 : (selectedUser?.profilePic || assets?.avatar_icon)}
                        />
                        <p className='text-gray-400'>{formatMessageTime(msg.createdAt)}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}