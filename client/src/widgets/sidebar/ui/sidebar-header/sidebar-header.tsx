import assets from "@/shared/assets";
import {useNavigate} from "react-router-dom";
import {useAuth} from "@/app/providers";
import {useEffect, useRef, useState} from "react";

export const SidebarHeader = () => {
    const navigate = useNavigate();
    const {logout} = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const iconRef = useRef<HTMLImageElement | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!menuOpen) return;

        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            const target = event.target as Node;
            if (
                menuRef.current && !menuRef.current.contains(target) &&
                iconRef.current && !iconRef.current.contains(target)
            ) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, [menuOpen]);

    return (
        <div className='flex items-center justify-between'>
            <img src={assets.logo_icon as string} alt='logo' className='max-w-40'/>
            <div className="relative py-2" ref={menuRef}>
                <img
                    ref={iconRef}
                    src={assets.menu_icon as string}
                    alt='menu'
                    className='max-h-5 cursor-pointer'
                    onClick={() => setMenuOpen((prev) => !prev)}
                />
                {menuOpen && (
                    <div
                        className='absolute top-full right-0 z-20 w-32 p-5 rounded-md bg-[#282142] border border-gray-600 text-gray-100
                        transition-opacity duration-200'
                    >
                        <p onClick={() => {
                            setMenuOpen(false);
                            navigate('/profile');
                        }} className='cursor-pointer text-sm'>Edit Profile</p>
                        <hr className="my-2 border-t border-gray-500"/>
                        <p onClick={() => {
                            setMenuOpen(false);
                            logout();
                        }} className='cursor-pointer text-sm'>Logout</p>
                    </div>
                )}
            </div>
        </div>
    );
}