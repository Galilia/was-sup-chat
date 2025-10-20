import assets from "@/shared/assets";
import {useNavigate} from "react-router-dom";
import {useAuth} from "@/app/providers";

export const SidebarHeader = () => {
    const navigate = useNavigate();
    const {logout} = useAuth();

    return (
        <div className='flex items-center justify-between'>
            <img src={assets.logo_icon} alt='logo' className='max-w-40'/>
            <div className="relative py-2 group">
                <img src={assets.menu_icon} alt='logo' className='max-h-5 cursor-pointer'/>
                <div
                    className='absolute top-full right-0 z-20 w-32 p-5 rounded-md bg-[#282142] border border-gray-600 text-gray-100
            opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto
            hover:opacity-100 hover:pointer-events-auto transition-opacity duration-200'>
                    <p onClick={() => navigate('/profile')} className='cursor-pointer text-sm'>Edit Profile</p>
                    <hr className="my-2 border-t border-gray-500"/>
                    <p onClick={() => logout()} className='cursor-pointer text-sm'> Logout </p>
                </div>
            </div>
        </div>

    )
}