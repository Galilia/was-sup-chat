import React, {useEffect, useRef} from "react";

/** Renders local and remote video elements. */
export const VideoTiles: React.FC<{
    local: React.MutableRefObject<MediaStream | null>;
    remote: React.MutableRefObject<MediaStream>;
    compact?: boolean;
}> = ({local, remote, compact}) => {
    const localRef = useRef<HTMLVideoElement>(null);
    const remoteRef = useRef<HTMLVideoElement>(null);

    // attach local stream
    useEffect(() => {
        if (localRef.current && local.current) {
            localRef.current.srcObject = local.current;
        }
    }, [local.current]);

    // attach remote stream
    useEffect(() => {
        if (remoteRef.current) {
            remoteRef.current.srcObject = remote.current;
        }
    }, [remote.current]);

    return (
        <div className={`grid gap-2 ${compact ? "grid-cols-2" : "grid-cols-2"} `}>
            <video
                ref={remoteRef}
                autoPlay
                playsInline
                className={`bg-black rounded-xl ${compact ? "h-40" : "h-64"} w-full object-cover`}
            />
            <video
                ref={localRef}
                autoPlay
                playsInline
                muted
                className={`bg-black rounded-xl ${compact ? "h-40" : "h-64"} w-full object-cover`}
            />
        </div>
    );
};
