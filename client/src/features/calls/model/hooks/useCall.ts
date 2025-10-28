import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import type {Socket} from "socket.io-client";
import {iceServers} from "../consts/iceServers";
import {useSocket} from "@/app/providers"; // configure your STUN/TURN here

type CallState = "idle" | "ringing" | "connecting" | "in-call";

type OfferAnswer = RTCSessionDescriptionInit;

export interface UseCallOptions {
    /** request camera in addition to microphone (default: true for richer UX) */
    defaultWithVideo?: boolean;
}

export interface UseCall {
    state: CallState;
    peerId: string | null;
    // media streams
    localStream: React.MutableRefObject<MediaStream | null>;
    remoteStream: React.MutableRefObject<MediaStream>;
    // actions
    call: (targetUserId: string, withVideo?: boolean) => Promise<void>;
    accept: (withVideo?: boolean) => Promise<void>;
    reject: () => void;
    endCall: () => void;
    // in-call controls
    setMuted: (muted: boolean) => void;
    setCameraOn: (on: boolean) => void;
    switchCamera: () => Promise<void>; // mobile/front-back toggle if supported
    // diagnostics
    error: string | null;
    isIncoming: boolean; // true only while ringing (incoming)
}

/**
 * WebRTC 1:1 call hook driven by Socket.IO signaling from app/providers/socket
 * - does NOT create its own socket; relies on useSocket()
 * - safe to mount once per chat page
 */
export function useCall(selfUserId: string, opts: UseCallOptions = {}): UseCall {
    const {socket} = useSocket(); // may be null until auth is resolved
    const defaultWithVideo = opts.defaultWithVideo ?? true;

    const [state, setState] = useState<CallState>("idle");
    const [peerId, setPeerId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [incomingFrom, setIncomingFrom] = useState<string | null>(null); // track who is calling you

    const pcRef = useRef<RTCPeerConnection | null>(null);
    const socketRef = useRef<Socket | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const remoteStreamRef = useRef(new MediaStream());

    // ————— helpers —————

    const ensurePC = useCallback(() => {
        if (pcRef.current) return pcRef.current;
        const pc = new RTCPeerConnection({iceServers});

        pc.onicecandidate = (e) => {
            if (e.candidate && peerId && socketRef.current) {
                socketRef.current.emit("webrtc:ice-candidate", {
                    toUserId: peerId,
                    candidate: e.candidate.toJSON(),
                });
            }
        };

        pc.ontrack = (e) => {
            // merge tracks into a single remote stream
            e.streams[0]?.getTracks().forEach((t) => {
                // avoid duplicate tracks
                const already = remoteStreamRef.current.getTracks().some((rt) => rt.id === t.id);
                if (!already) remoteStreamRef.current.addTrack(t);
            });
        };

        pc.onconnectionstatechange = () => {
            if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
                // keep UX simple for MVP: end on failure/disconnect
                endCall(false);
            }
        };

        pcRef.current = pc;
        return pc;
    }, [peerId]); // rebind if peerId changes

    const getLocalStream = useCallback(
        async (withVideo: boolean) => {
            if (localStreamRef.current) return localStreamRef.current;
            try {
                localStreamRef.current = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: withVideo,
                });
                return localStreamRef.current;
            } catch (e: any) {
                setError(e?.message ?? "Failed to getUserMedia");
                throw e;
            }
        },
        []
    );

    const stopLocalStream = () => {
        localStreamRef.current?.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
    };

    const resetRemoteStream = () => {
        remoteStreamRef.current.getTracks().forEach((t) => remoteStreamRef.current.removeTrack(t));
        remoteStreamRef.current = new MediaStream();
    };

    // ————— signaling actions —————

    const createOfferFlow = useCallback(
        async (toUserId: string, withVideo: boolean) => {
            const pc = ensurePC();
            const local = await getLocalStream(withVideo);
            // add tracks once
            local.getTracks().forEach((t) => {
                if (!pc.getSenders().some((s) => s.track?.id === t.id)) pc.addTrack(t, local);
            });

            const offer = await pc.createOffer({offerToReceiveAudio: true, offerToReceiveVideo: true});
            await pc.setLocalDescription(offer);

            socketRef.current?.emit("webrtc:offer", {toUserId, sdp: offer});
        },
        [ensurePC, getLocalStream]
    );

    const createAnswerFlow = useCallback(
        async (fromUserId: string, offer: OfferAnswer, withVideo: boolean) => {
            const pc = ensurePC();

            // attach local media first
            const local = await getLocalStream(withVideo);
            local.getTracks().forEach((t) => {
                if (!pc.getSenders().some((s) => s.track?.id === t.id)) pc.addTrack(t, local);
            });

            await pc.setRemoteDescription(offer);
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            socketRef.current?.emit("webrtc:answer", {toUserId: fromUserId, sdp: answer});
            setState("in-call");
        },
        [ensurePC, getLocalStream]
    );

    // ————— public API —————

    const call = useCallback(
        async (targetUserId: string, withVideo: boolean = defaultWithVideo) => {
            if (!socket) {
                setError("Socket is not ready");
                return;
            }
            setError(null);
            setPeerId(targetUserId);
            setState("connecting");
            // step1: ask peer to accept; when accepted, we'll get "call:accepted" → createOfferFlow()
            socket.emit("call:request", {toUserId: targetUserId});
        },
        [socket, defaultWithVideo]
    );

    const accept = useCallback(
        async (withVideo: boolean = defaultWithVideo) => {
            if (!socket || !incomingFrom) return;
            setError(null);
            setPeerId(incomingFrom);
            setState("connecting");
            socket.emit("call:accept", {toUserId: incomingFrom});
            // initiator will send an offer; we'll answer in "webrtc:offer" handler
        },
        [socket, incomingFrom, defaultWithVideo]
    );

    const reject = useCallback(() => {
        if (!socket || !incomingFrom) return;
        socket.emit("call:reject", {toUserId: incomingFrom});
        setIncomingFrom(null);
        setState("idle");
    }, [socket, incomingFrom]);

    const endCall = useCallback(
        (notifyPeer = true) => {
            if (notifyPeer && socket && peerId) {
                socket.emit("call:end", {toUserId: peerId});
            }
            // cleanup
            pcRef.current?.getSenders().forEach((s) => s.track?.stop());
            pcRef.current?.close();
            pcRef.current = null;

            stopLocalStream();
            resetRemoteStream();

            setPeerId(null);
            setIncomingFrom(null);
            setState("idle");
        },
        [socket, peerId]
    );

    const setMuted = useCallback((muted: boolean) => {
        localStreamRef.current?.getAudioTracks().forEach((t) => (t.enabled = !muted));
    }, []);

    const setCameraOn = useCallback((on: boolean) => {
        localStreamRef.current?.getVideoTracks().forEach((t) => (t.enabled = on));
    }, []);

    const switchCamera = useCallback(async () => {
        // Only meaningful on devices with multiple video inputs (e.g., phones)
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videos = devices.filter((d) => d.kind === "videoinput");
        if (videos.length < 2) return;

        const currentId = localStreamRef.current?.getVideoTracks()[0]?.getSettings().deviceId;
        const next = videos.find((d) => d.deviceId !== currentId) ?? videos[0];

        // replace track with a new one
        const newStream = await navigator.mediaDevices.getUserMedia({
            video: {deviceId: {exact: next.deviceId}},
            audio: true
        });
        const newVideoTrack = newStream.getVideoTracks()[0];

        const pc = pcRef.current;
        if (!pc) return;

        const sender = pc.getSenders().find((s) => s.track?.kind === "video");
        if (sender && newVideoTrack) {
            await sender.replaceTrack(newVideoTrack);
            // stop previous
            localStreamRef.current?.getVideoTracks().forEach((t) => t.stop());
            // update local stream
            const audioTracks = localStreamRef.current?.getAudioTracks() ?? [];
            localStreamRef.current = new MediaStream([newVideoTrack, ...audioTracks]);
        }
    }, []);

    // ————— socket binding lifecycle —————

    useEffect(() => {
        // keep a stable reference to the active socket instance
        socketRef.current = socket ?? null;
        if (!socket) return;

        const onRinging = ({fromUserId}: { fromUserId: string }) => {
            setIncomingFrom(fromUserId);
            setState("ringing");
        };

        const onAccepted = async ({fromUserId}: { fromUserId: string }) => {
            // peer accepted our request; we are the offerer
            setPeerId(fromUserId);
            try {
                await createOfferFlow(fromUserId, defaultWithVideo);
            } catch (e) {
                setError("Failed to create offer");
                endCall(false);
            }
        };

        const onRejected = () => {
            setIncomingFrom(null);
            setPeerId(null);
            setState("idle");
        };

        const onOffer = async ({fromUserId, sdp}: { fromUserId: string; sdp: OfferAnswer }) => {
            // we are the answerer
            setPeerId(fromUserId);
            try {
                await createAnswerFlow(fromUserId, sdp, defaultWithVideo);
            } catch (e) {
                setError("Failed to create answer");
                endCall(false);
            }
        };

        const onAnswer = async ({sdp}: { sdp: OfferAnswer }) => {
            if (!pcRef.current) return;
            try {
                await pcRef.current.setRemoteDescription(sdp);
                setState("in-call");
            } catch {
                setError("Failed to set remote description");
                endCall(false);
            }
        };

        const onIce = async ({candidate}: { candidate: RTCIceCandidateInit }) => {
            try {
                if (candidate && pcRef.current) await pcRef.current.addIceCandidate(candidate);
            } catch {
                // ignore benign addIceCandidate errors
            }
        };

        const onEnded = () => endCall(false);

        if (!socket) return;

        socket.on("call:ringing", onRinging);
        socket.on("call:accepted", onAccepted);
        socket.on("call:rejected", onRejected);
        socket.on("webrtc:offer", onOffer);
        socket.on("webrtc:answer", onAnswer);
        socket.on("webrtc:ice-candidate", onIce);
        socket.on("call:ended", onEnded);

        return () => {
            socket.off("call:ringing", onRinging);
            socket.off("call:accepted", onAccepted);
            socket.off("call:rejected", onRejected);
            socket.off("webrtc:offer", onOffer);
            socket.off("webrtc:answer", onAnswer);
            socket.off("webrtc:ice-candidate", onIce);
            socket.off("call:ended", onEnded);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket, createOfferFlow, createAnswerFlow, defaultWithVideo, endCall]);

    const isIncoming = useMemo(() => state === "ringing" && !!incomingFrom, [state, incomingFrom]);

    return {
        state,
        peerId,
        localStream: localStreamRef,
        remoteStream: remoteStreamRef,
        call,
        accept,
        reject,
        endCall,
        setMuted,
        setCameraOn,
        switchCamera,
        error,
        isIncoming,
    };
}
