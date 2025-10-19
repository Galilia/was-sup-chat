import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App'
import {BrowserRouter} from "react-router-dom";
import {AuthProvider} from "./app/providers/auth/AuthContext";
import {ChatProvider} from "./app/providers/chat/ChatContext";
import {ContactsProvider} from "./app/providers/contacts/ContactsContext";

createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
        <AuthProvider>
            <ContactsProvider>
                <ChatProvider>
                    <App/>
                </ChatProvider>
            </ContactsProvider>
        </AuthProvider>
    </BrowserRouter>,
)
