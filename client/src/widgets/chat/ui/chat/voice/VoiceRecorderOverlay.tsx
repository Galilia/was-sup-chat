import {useEffect, useRef, useState} from "react";
import {useChat} from "@/entities/message";

type Props = {
    targetUserId: string;
    onClose: () => void;
};

export default function VoiceRecorderOverlay({targetUserId, onClose}: Props) {
    const {sendVoiceMessage} = useChat();

    const [recording, setRecording] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [elapsed, setElapsed] = useState(0);
    const [mime, setMime] = useState("audio/webm;codecs=opus");
    const [duration, setDuration] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const mrRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<BlobPart[]>([]);
    const tickRef = useRef<number | null>(null);
    const startedAtRef = useRef<number>(0);

    useEffect(() => {
        const esc = (e: KeyboardEvent) => {
            if (e.key === "Escape") cancel();
        };
        window.addEventListener("keydown", esc);
        return () => window.removeEventListener("keydown", esc);
    }, []);

    useEffect(() => {
        if (!recording) return;
        startedAtRef.current = Date.now();
        tickRef.current = window.setInterval(() => {
            setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000));
        }, 200);
        return () => {
            if (tickRef.current) window.clearInterval(tickRef.current);
        };
    }, [recording]);

    const pickMime = () => {
        if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) return "audio/webm;codecs=opus";
        if (MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")) return "audio/ogg;codecs=opus";
        return "audio/webm;codecs=opus";
    };

    const start = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({audio: true});
            const m = pickMime();
            setMime(m);
            const mr = new MediaRecorder(stream, {mimeType: m});
            mrRef.current = mr;
            chunksRef.current = [];

            mr.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
            mr.onstop = async () => {
                if (tickRef.current) window.clearInterval(tickRef.current);
                stream.getTracks().forEach(t => t.stop());
                const blob = new Blob(chunksRef.current, {type: m});
                const url = URL.createObjectURL(blob);
                setPreviewUrl(url);

                const a = new Audio(url);
                a.addEventListener("loadedmetadata", () => setDuration(a.duration || elapsed));
            };

            mr.start();
            setRecording(true);
            setError(null);
        } catch (e: any) {
            setError(e?.message || "Microphone error");
        }
    };

    const stop = () => {
        mrRef.current?.stop();
        setRecording(false);
    };

    const cancel = () => {
        try {
            mrRef.current?.stream.getTracks().forEach(t => t.stop());
        } catch {
        }
        setRecording(false);
        setPreviewUrl(null);
        onClose();
    };

    const send = async () => {
        if (!previewUrl) return;
        const resp = await fetch(previewUrl);
        const buf = await resp.arrayBuffer();
        const ext = mime.includes("ogg") ? "ogg" : "webm";
        const file = new File([buf], `voice-${Date.now()}.${ext}`, {type: mime});

        sendVoiceMessage(file, duration);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[9999] grid place-items-center bg-black/60">
            <div className="w-[360px] max-w-[92vw] rounded-2xl bg-[#2b0f2f] text-white p-6 shadow-2xl">
                {!previewUrl ? (
                    <>
                        <h3 className="text-lg font-semibold mb-4 text-center">Record a voice message</h3>
                        <div className="relative grid place-items-center h-48">
                            {recording && <span
                                className="absolute inline-flex h-36 w-36 rounded-full border-4 border-red-400/60 animate-ping"/>}
                            <button
                                onClick={recording ? stop : start}
                                className={`relative z-10 h-24 w-24 rounded-full text-3xl grid place-items-center transition
                ${recording ? "bg-red-600 hover:bg-red-500" : "bg-violet-700 hover:bg-violet-600"}`}
                                aria-label={recording ? "Stop" : "Start"}
                            >
                                🎤
                            </button>
                        </div>
                        <p className="text-center text-white/80">
                            {recording ? `Recording… ${elapsed}s (Esc — cancel)` : "Tap to start"}
                        </p>
                        {error && <p className="mt-2 text-center text-red-300">{error}</p>}
                        <div className="mt-4 flex justify-center">
                            <button onClick={cancel}
                                    className="px-3 py-2 rounded-lg border border-white/30 hover:bg-white/10">
                                Cancel
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <h3 className="text-lg font-semibold mb-4 text-center">Preview</h3>
                        <audio src={previewUrl} controls autoPlay className="w-full"/>
                        <div className="mt-4 flex justify-center gap-3">
                            <button onClick={send}
                                    className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-medium">
                                Send
                            </button>
                            <button onClick={cancel}
                                    className="px-4 py-2 rounded-lg border border-white/30 hover:bg-white/10">
                                Cancel
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
