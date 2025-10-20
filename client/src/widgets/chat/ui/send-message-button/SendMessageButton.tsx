import assets from "@/shared/assets";
import {FormEvent, KeyboardEvent, useState} from "react";
import {useChat} from "@/entities/message";
import {ChatHeader} from "@/widgets/chat/ui/chat-header/ChatHeader";
import toast from "react-hot-toast";
import {User} from "@/entities/user";
import VoiceRecorderOverlay from "@/widgets/chat/ui/chat/voice/VoiceRecorderOverlay";

interface SendMessageButtonProps {
    selectedUser: User;
}

export const SendMessageButton = ({selectedUser}: SendMessageButtonProps) => {
    const {sendMessage} = useChat();

    const [input, setInput] = useState('');
    const [recOpen, setRecOpen] = useState(false);

    const handleSendImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || !files[0] || !files[0].type.startsWith("image/")) {
            toast.error('Please select a valid image file');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64Img = reader.result;
            await sendMessage({image: typeof base64Img === "string" ? base64Img : undefined});
            e.target.value = "";
        }
        reader.readAsDataURL(files[0]);
    }

    const handleSendMessage = async (e: FormEvent | KeyboardEvent) => {
        e.preventDefault();
        if (input.trim() === "") return null;
        await sendMessage({text: input.trim()});
        setInput('');
        return null;
    }

    return (
        <>
            <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3">
                <div className="flex-1 flex items-center bg-gray-100/12 px-3 rounded-full">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => (e.key === "Enter" ? handleSendMessage(e) : null)}
                        type="text"
                        placeholder="Send a message"
                        className="flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400"
                    />

                    {/* IMAGE  BUTTON */}
                    <input onChange={handleSendImage} type="file" id="image" accept="image/png,image/jpeg" hidden/>
                    <label htmlFor="image">
                        <img src={assets.gallery_icon} alt=""
                             className="ml-1 p-2 rounded-full hover:bg-white/10 focus:outline-none cursor-pointer"/>
                    </label>

                    {/* MIC BUTTON */}
                    <button
                        type="button"
                        onClick={() => selectedUser && setRecOpen(true)}
                        className="ml-1 p-2 rounded-full hover:bg-white/10 focus:outline-none cursor-pointer"
                        title="Record voice"
                        aria-label="Record voice"
                    >
                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white/80">
                            <path
                                d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V20H8v2h8v-2h-3v-2.08A7 7 0 0 0 19 11h-2Z"/>
                        </svg>
                    </button>
                </div>

                <img onClick={handleSendMessage} src={assets.send_icon} alt="" className="w-11 cursor-pointer"/>
            </div>

            {recOpen && selectedUser && (
                <VoiceRecorderOverlay
                    targetUserId={selectedUser._id}
                    onClose={() => setRecOpen(false)}
                    onSent={({url, mime, dur}) => {
                        sendMessage({audioUrl: url, mime, duration: dur, type: "audio"} as any);
                        setRecOpen(false);
                    }}
                />
            )}
        </>
    )
}