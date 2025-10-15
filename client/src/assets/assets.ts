import menu_icon from './menu_icon.svg?url';
import search_icon from './search_icon.svg?url';
import avatar_icon from './avatar_icon.svg?url';
import avatar_girl_icon from './avatar_girl_icon.svg?url';
import help_icon from './help_icon.svg?url';
import logo_icon from './logo_icon.svg?url';
import send_icon from './send_icon.svg?url';
import gallery_icon from './gallery_icon.svg?url';
import arrow_icon from './arrow_icon.png?url';
import type {Message} from "../types/Message.ts";

const assets = {
    menu_icon,
    search_icon,
    avatar_icon,
    avatar_girl_icon,
    logo_icon,
    help_icon,
    send_icon,
    gallery_icon,
    arrow_icon
};

export default assets;

export const messagesDummyData: Message[] = [
    {
        senderId: "680f50e4f10f3cd28382ecf9",
        text: "Привет! Как дела?",
        createdAt: "2024-06-10T10:00:00Z",
        image: null,
    },
    {
        senderId: "user2",
        text: "Все отлично, спасибо!",
        createdAt: "2024-06-10T10:01:00Z",
    },
    {
        senderId: "680f50e4f10f3cd28382ecf9",
        text: "Посмотри на это фото:",
        image: "/src/assets/sample_image.jpg",
        createdAt: "2024-06-10T10:02:00Z",
    },
];

export const imagesDummyData: string[] = [
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    "https://images.unsplash.com/photo-1519125323398-675f0ddb6308",
    "https://images.unsplash.com/photo-1465101046530-73398c7f28ca",
    "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429",
    "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e"
];
