import React from "react";
import {VideoTiles} from "./VideoTiles";
import {CallControls} from "./CallControls";

/** Small floating dock that appears at the bottom when a call is active. */
export const ActiveCallDock: React.FC<{
    local: React.MutableRefObject<MediaStream | null>;
    remote: React.MutableRefObject<MediaStream>;
    onMute: (muted: boolean) => void;
    onCamera: (on: boolean) => void;
    onSwitchCam?: () => void;
    onEnd: () => void;
}> = ({local, remote, onMute, onCamera, onSwitchCam, onEnd}) => {
    return (
        <div
            className="fixed left-1/2 -translate-x-1/2 bottom-4 z-[900] w-[720px] max-w-[95vw] bg-white/90 backdrop-blur border shadow-xl rounded-2xl p-3">
            <VideoTiles local={local} remote={remote} compact/>
            <div className="mt-3">
                <CallControls onMute={onMute} onCamera={onCamera} onSwitchCam={onSwitchCam} onEnd={onEnd}/>
            </div>
        </div>
    );
};
