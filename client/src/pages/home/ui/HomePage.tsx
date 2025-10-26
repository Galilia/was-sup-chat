import {Sidebar} from "@/widgets/sidebar";
import {ChatContainer} from "@/widgets/chat";

export const HomePage = () => {

    return (
        <div className='backdrop-blur-xl border-2 border-gray-600 rounded-2xl
                        overflow-hidden h-[100%] grid grid-cols-1 sm:grid-cols-[0.8fr_1.2fr] relative'>
            <Sidebar/>
            <ChatContainer/>
        </div>
    )
}