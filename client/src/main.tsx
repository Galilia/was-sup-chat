import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App'
import {BrowserRouter} from "react-router-dom";
import {AuthProvider} from "./app/providers/auth/AuthContext";
import {ChatProvider} from "./entities/message/model/providers/ChatContext";
import {ContactsProvider} from "./entities/contacts/model/providers/ContactsContext";
import {SocketProvider} from "@/app/providers";

createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
        <AuthProvider>
            <SocketProvider>
                <ContactsProvider>
                    <ChatProvider>
                        <App/>
                    </ChatProvider>
                </ContactsProvider>
            </SocketProvider>
        </AuthProvider>
    </BrowserRouter>,
)
