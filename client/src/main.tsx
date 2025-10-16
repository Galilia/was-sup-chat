import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App'
import {BrowserRouter} from "react-router-dom";
import {AuthProvider} from "./app/providers/auth/AuthContext";
import {ChatProvider} from "./app/providers/chat/ChatContext";

createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
        <AuthProvider>
            <ChatProvider>
                <App/>
            </ChatProvider>
        </AuthProvider>
    </BrowserRouter>,
)
