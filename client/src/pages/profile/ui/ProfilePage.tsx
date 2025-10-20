import {type FormEvent, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../../../app/providers/auth/AuthContext";
import assets from "../../../shared/assets";

export const ProfilePage = () => {
    const navigate = useNavigate();
    const {authUser, updateProfile} = useAuth();

    const [selectedImg, setSelectedImg] = useState<File | null>(null);
    const [name, setName] = useState<string>(authUser?.fullName ?? "");
    const [bio, setBio] = useState<string>(authUser?.bio ?? "");

    const onSubmitHandler = async (event: FormEvent) => {
        event.preventDefault();
        if (!selectedImg) {
            await updateProfile({fullName: name, bio});
            navigate('/');
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(selectedImg);
        reader.onload = async () => {
            const base64Img = reader.result;
            await updateProfile({
                fullName: name,
                bio,
                profilePic: typeof base64Img === "string" ? base64Img : undefined
            });
            navigate('/');
        }

    }

    return (
        <div className='min-h-screen bg-cover bg-no-repeat flex items-center justify-center'>
            <div className='w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600
                flex items-center justify-between max-sm:flex-col-reverse rounded-lg'>
                <button
                    onClick={() => navigate('/')}
                    className='absolute top-4 right-4 bg-gray-700/60  p-2 rounded-full shadow-md cursor-pointer'
                    type="button"
                    aria-label="Вернуться на главную"
                >
                    <img src={assets.arrow_icon as string} alt="Назад" className='w-6 h-6'/>
                </button>

                <form onSubmit={onSubmitHandler} className="flex flex-col gap-5 p-10 flex-1">
                    <h3 className="text-lg">Profile details</h3>

                    <label htmlFor="avatar" className='flex items-center gap-3 cursor-pointer'>
                        <input onChange={(event) => {
                            const file = event.target.files?.[0];

                            if (file) {
                                setSelectedImg(file);
                            } else {
                                setSelectedImg(null);
                            }
                        }}
                               type="file" id='avatar' accept='.png, .jpg, .jpeg' hidden/>
                        <img src={selectedImg ? URL.createObjectURL(selectedImg) : assets.avatar_icon} alt=""
                             className={`w-12 h-12 ${selectedImg && 'rounded-full'}`}/>
                        upload profile image
                    </label>

                    <input onChange={(e) => setName(e.target.value)} value={name}
                           type="text" required placeholder='Your name'
                           className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500'/>

                    <textarea onChange={(e) => setBio(e.target.value)} value={bio}
                              placeholder="Write profile bio" required
                              className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 rows={4}">
                    </textarea>

                    <button type="submit"
                            className="bg-gradient-to-r from-purple-400 to-violet-600 text-white p-2 rounded-full text-lg cursor-pointer">
                        Save
                    </button>
                </form>

                <img src={authUser?.profilePic || assets.logo_icon} alt=""
                     className={`w-[min(30vw,150px)] aspect-square rounded-full mx-10 max-sm:mt-10 ${selectedImg && 'rounded-full'}`}/>
            </div>
        </div>
    )
}
