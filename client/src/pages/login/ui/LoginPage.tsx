import assets from "@/shared/assets";
import {type FormEvent, useState} from "react";
import {useAuth} from "../../../app/providers/auth/AuthContext";

const AuthState = {
    SIGN_UP: "Sign up",
    LOGIN: "Login"
} as const;

type AuthStateType = (typeof AuthState)[keyof typeof AuthState];

export const LoginPage = () => {
    const {login} = useAuth();

    const [currState, setCurrState] = useState<AuthStateType>(AuthState.SIGN_UP);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [gender, setGender] = useState("male");
    const [bio, setBio] = useState('');
    const [isDataSubmitted, setIsDataSubmitted] = useState(false);

    const onSubmitHandler = (event: FormEvent) => {
        event.preventDefault();

        if (currState === AuthState.SIGN_UP && !isDataSubmitted) {
            setIsDataSubmitted(true);
            return;
        }

        login(currState === AuthState.SIGN_UP ? "signup" : "login", {fullName, email, password, gender, bio});
    }

    return (
        <div
            className='min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl'>
            {/* ---------- left ---------- */}
            <img src={assets.logo_icon} alt='' className='w-[min(30vw,250px)]'/>

            {/* ---------- right ---------- */}
            <form onSubmit={onSubmitHandler}
                  className='border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg'>

                <h2 className='font-medium text-2xl flex justify-between items-center'>
                    {currState}
                    {isDataSubmitted && <img onClick={() => setIsDataSubmitted(false)}
                                             src={assets.arrow_icon} alt=""
                                             className='w-5 cursor-pointer'/>}
                </h2>

                {currState === "Sign up" && !isDataSubmitted && (
                    <input onChange={(e) => setFullName(e.target.value)} value={fullName}
                           type="text" className='p-2 border border-gray-500 rounded-md focus:outline-none'
                           placeholder="Full Name" required/>
                )}

                {!isDataSubmitted && (
                    <>
                        <input onChange={(e) => setEmail(e.target.value)} value={email}
                               type="email" placeholder='Email Address' required
                               className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'/>

                        <input onChange={(e) => setPassword(e.target.value)} value={password}
                               type="password" placeholder='Password' required
                               className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'/>
                    </>
                )}

                {currState === AuthState.SIGN_UP && isDataSubmitted && (
                    <div className='flex gap-4 items-center'>
                        <label className='flex items-center gap-1'>
                            <input
                                type="radio"
                                name="gender"
                                value="male"
                                checked={gender === "male"}
                                onChange={() => setGender("male")}
                                required
                            />
                            Male
                        </label>
                        <label className='flex items-center gap-1'>
                            <input
                                type="radio"
                                name="gender"
                                value="female"
                                checked={gender === "female"}
                                onChange={() => setGender("female")}
                            />
                            Female
                        </label>
                    </div>
                )}

                {currState === AuthState.SIGN_UP && isDataSubmitted && (
                    <textarea onChange={(e) => setBio(e.target.value)} value={bio}
                              rows={4}
                              className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                              placeholder='provide a short bio...' required></textarea>
                )}

                <button type='submit'
                        className='py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer'>
                    {currState === AuthState.SIGN_UP ? "Create Account" : "Login Now"}
                </button>

                {currState === AuthState.SIGN_UP && (
                    <div className='flex items-center gap-2 text-sm text-gray-500'>
                        <input type="checkbox"/>
                        <p>Agree to the terms of use & privacy policy.</p>
                    </div>)
                }

                <div className='flex flex-col gap-2'>
                    {currState === AuthState.SIGN_UP ? (
                        <p className='text-sm text-gray-600'>Already have an account? <span
                            onClick={() => {
                                setCurrState(AuthState.LOGIN);
                                setIsDataSubmitted(false);
                            }}
                            className='font-medium text-violet-500 cursor-pointer'>Login here</span></p>
                    ) : (
                        <p className='text-sm text-gray-600'>Create an account <span
                            onClick={() => {
                                setCurrState(AuthState.SIGN_UP);
                            }}
                            className='font-medium text-violet-500 cursor-pointer'>Click here</span></p>
                    )}
                </div>
            </form>
        </div>
    )
}