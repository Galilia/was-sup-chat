import {useEffect, useRef} from 'react';
import assets from "@/shared/assets";
import {useChat} from "../../../entities/message/model/providers/ChatContext";
import {ChatHeader} from "@/widgets/chat/ui/chat-header/ChatHeader";
import {SendMessageButton} from "@/widgets/chat/ui/send-message-button/SendMessageButton";
import {Chat} from "@/widgets/chat/ui/chat/Chat";
import {CallFab} from "@/widgets/chat/ui/chat/call/CallFab";

export const ChatContainer = () => {
    const {messages, selectedUser, setSelectedUser, getMessages} = useChat();

    const scrollEnd = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (selectedUser) {
            getMessages(selectedUser._id);
        }
    }, [selectedUser]);

    useEffect(() => {
        if (scrollEnd.current && messages) {
            scrollEnd.current.scrollIntoView({behavior: "smooth"});
        }
    }, [messages]);

    return selectedUser ? (
            <div className='h-full overflow-scroll relative backdrop-blur-lg'>
                <ChatHeader selectedUser={selectedUser} setSelectedUser={setSelectedUser}/>

                <CallFab selectedUserId={selectedUser._id}/>

                <Chat selectedUser={selectedUser}/>

                <div ref={scrollEnd}/>

                <SendMessageButton selectedUser={selectedUser}/>
            </div>
        ) :
        (
            <div className='flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden'>
                <img src={assets.logo_icon} className='max-w-16' alt=""/>
                <p className='text-lg font-medium text-white'>Chat anytime, anywhere</p>
            </div>
        )
}
