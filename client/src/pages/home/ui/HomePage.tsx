import {Sidebar} from "@/widgets/sidebar";
import {ChatContainer} from "@/widgets/chat";

export const HomePage = () => {

    return (
        <div className='border w-full h-screen sm:px-[5%] sm:py-[5%]'>
            <div className='backdrop-blur-xl border-2 border-gray-600 rounded-2xl
                overflow-hidden h-[100%] grid grid-cols-[0.8fr_1.2fr] relative'>
                <Sidebar/>

                <ChatContainer/>
            </div>
        </div>
    )
}