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
            {messages.map((msg, index) => {
                const isMine = msg.senderId === authUser?._id;

                return (
                    <div key={index}
                         className={`flex items-end gap-2 justify-end ${msg.senderId !== authUser?._id ? 'flex-row-reverse' : ''}`}>

                        {msg.type === 'audio' && msg.audioUrl && (
                            <div
                                className={`mb-8 w-4/6 p-2 rounded-xl text-white
                                    ${isMine ? "bg-violet-500/30" : "bg-gray-300/30"}  ${isMine ? 'rounded-br-none' : 'rounded-bl-none'}`}>
                                <audio controls src={(msg as any).audioUrl} className="w-full"/>
                                {(msg as any).duration != null && (
                                    <div className="text-xs text-white/70 mt-1">
                                        {Math.round((msg as any).duration)}s
                                    </div>
                                )}
                            </div>
                        )}


                        {msg.type === 'image' && msg.image && (
                            <img src={msg.image} alt=""
                                 className='max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8'/>
                        )}

                        {msg.type === 'text' && msg.text && (
                            <p className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-8 break-all text-white 
                                 ${isMine ? "bg-violet-500/30" : "bg-gray-300/30"} ${isMine ? 'rounded-br-none' : 'rounded-bl-none'}`}>
                                {msg.text}
                            </p>
                        )}

                        <div className='text-center text-xs'>
                            <img
                                alt=""
                                className='w-7 rounded-full'
                                src={
                                    isMine
                                        ? (authUser?.profilePic || assets?.avatar_icon)
                                        : (selectedUser?.profilePic || assets?.avatar_icon)
                                }
                            />
                            <p className='text-gray-400'>{formatMessageTime(msg.createdAt)}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}