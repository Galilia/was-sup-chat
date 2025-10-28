export const iceServers: RTCIceServer[] = [
    {urls: "stun:stun.l.google.com:19302"},
    {
        urls: import.meta.env.VITE_TURN_URL,
        username: import.meta.env.VITE_TURN_USER,
        credential: import.meta.env.VITE_TURN_CRED,
    },
];
