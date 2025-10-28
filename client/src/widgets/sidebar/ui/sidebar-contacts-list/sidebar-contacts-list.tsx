import assets from "@/shared/assets";
import {useAuth} from "@/app/providers";
import {useChat} from "@/entities/message";
import type {User} from "@/entities/user";
import {useContacts} from "@/entities/contacts";

interface SidebarContactsListProps {
    input: string;
}

export const SidebarContactsList = (props: SidebarContactsListProps) => {
    const {onlineUsers} = useAuth();
    const {contacts, loading} = useContacts();
    const {
        selectedUser,
        setSelectedUser,
        unseenMessages,
        setUnseenMessages
    } = useChat();

    const {input} = props;

    const filtered = input.length === 0
        ? contacts
        : contacts?.filter(user => user.fullName.toLowerCase().includes(input.toLowerCase()));

    if (loading) return null;
    if (filtered?.length === 0) return (
        <p className='text-xs text-neutral-500'>No contacts found.</p>
    )

    return (
        <div className='flex flex-col'>
            {filtered?.map((user: User) => (
                <button key={user._id}
                        onClick={() => {
                            setSelectedUser(user);
                            // @ts-ignore
                            setUnseenMessages(prev => ({...prev, [user?._id]: 0}));
                        }}
                        className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer max-sm:text-sm 
                        ${selectedUser?._id === user._id && 'bg-gray-700/50'}`}>
                    <img src={user?.profilePic || assets.avatar_icon} alt=""
                         className='w-[35px] aspect-[1/1] rounded-full'/>
                    <div className='flex flex-col leading-5'>
                        <p>{user.fullName}</p>
                        {
                            onlineUsers.includes(user._id)
                                ? <span className='text-green-400 text-xs'>Online</span>
                                : <span className='text-neutral-400 text-xs'>Offline</span>
                        }
                    </div>
                    {unseenMessages[user._id] > 0 &&
                        <p className='absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500/50'>
                            {unseenMessages[user._id]}
                        </p>}
                </button>
            ))}
        </div>
    )
}