import React from "react";

/** In-call controls (mute/camera/end). */
export const CallControls: React.FC<{
    onMute: (muted: boolean) => void;
    onCamera: (on: boolean) => void;
    onSwitchCam?: () => void;
    onEnd: () => void;
}> = ({onMute, onCamera, onSwitchCam, onEnd}) => {
    return (
        <div className="flex items-center gap-2">
            <button className="rounded-lg border px-3 py-1 hover:bg-gray-50" onClick={() => onMute(true)}>
                🔇 Mute
            </button>
            <button className="rounded-lg border px-3 py-1 hover:bg-gray-50" onClick={() => onMute(false)}>
                🔊 Unmute
            </button>
            <button className="rounded-lg border px-3 py-1 hover:bg-gray-50" onClick={() => onCamera(true)}>
                📷 Cam On
            </button>
            <button className="rounded-lg border px-3 py-1 hover:bg-gray-50" onClick={() => onCamera(false)}>
                🚫 Cam Off
            </button>
            {onSwitchCam && (
                <button className="rounded-lg border px-3 py-1 hover:bg-gray-50" onClick={onSwitchCam}>
                    🔁 Switch Cam
                </button>
            )}
            <button className="rounded-lg bg-red-600 text-white px-3 py-1 hover:bg-red-700" onClick={onEnd}>
                ⛔ End
            </button>
        </div>
    );
};
