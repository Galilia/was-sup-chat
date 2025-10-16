import {Navigate, Route, Routes} from "react-router-dom";
import HomePage from "./pages/HomePage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import {Toaster} from "react-hot-toast";
import {AuthContext, useAuth} from "../context/AuthContext";
import ProfilePage from "./pages/ProfilePage";

const App = () => {
    const {authUser, authLoading} = useAuth();

    if (authLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="bg-[url('./src/assets/bgImage.svg')] bg-contain">
            <Toaster/>

            <Routes>
                <Route path="/" element={authUser ? <HomePage/> : <Navigate to={'/login'}/>}/>
                <Route path="/login" element={!authUser ? <LoginPage/> : <Navigate to={'/'}/>}/>
                <Route path="/profile" element={authUser ? <ProfilePage/> : <Navigate to={'/login'}/>}/>
            </Routes>
        </div>
    )
}

export default App;