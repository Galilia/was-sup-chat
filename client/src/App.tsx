import {Navigate, Route, Routes} from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import {Toaster} from "react-hot-toast";
import {useAuth} from "./app/providers/auth/AuthContext";
import ProfilePage from "./pages/ProfilePage";

const App = () => {
    const {authUser, authLoading} = useAuth();

    if (authLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="bg-[url('/bgImage.svg')] bg-contain">
            <Toaster/>

            <Routes>
                <Route
                    path="/"
                    element={
                        (authUser ? <HomePage/> : <Navigate to="/login" replace/>) as React.ReactElement
                    }
                />
                <Route
                    path="/login"
                    element={
                        (!authUser ? <LoginPage/> : <Navigate to="/" replace/>) as React.ReactElement
                    }
                />
                <Route
                    path="/profile"
                    element={
                        (authUser ? <ProfilePage/> : <Navigate to="/login" replace/>) as React.ReactElement
                    }
                />
            </Routes>
        </div>
    )
}

export default App;