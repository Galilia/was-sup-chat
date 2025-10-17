import {Navigate, Route, Routes} from "react-router-dom";
import {useAuth} from "../auth/AuthContext";
import HomePage from "@/pages/home";
import LoginPage from "@/pages/login";
import ProfilePage from "@/pages/profile";
import {Protected} from "./Protected";

const AppRouter = () => {
    const {authUser} = useAuth();

    return (
        <Routes>
            <Route
                path="/"
                element={
                    <Protected allow={!!authUser} to="/login">
                        <HomePage/>
                    </Protected>
                }
            />
            <Route
                path="/login"
                element={
                    <Protected allow={!authUser} to="/">
                        <LoginPage/>
                    </Protected>
                }
            />
            <Route
                path="/profile"
                element={
                    <Protected allow={!!authUser} to="/login">
                        <ProfilePage/>
                    </Protected>
                }
            />
            <Route path="*" element={<Navigate to="/" replace/>}/>
        </Routes>
    );
};

export default AppRouter;
