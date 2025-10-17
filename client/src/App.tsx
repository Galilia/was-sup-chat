import {Toaster} from "react-hot-toast";
import {useAuth} from "./app/providers/auth/AuthContext";

import {FullscreenLoader} from "./shared/ui/loader";
import AppRouter from "./app/providers/router/AppRouter";

const App = () => {
    const {authLoading} = useAuth();

    if (authLoading) return <FullscreenLoader/>;

    return (
        <div className="bg-[url('/bgImage.svg')] bg-contain">
            <Toaster/>

            <AppRouter/>
        </div>
    )
}

export default App;