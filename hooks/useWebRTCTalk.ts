import { useState, useEffect, useRef, useCallback } from 'react';

type ConnectionState = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

export default function useWebRTCTalk() {
    const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
    const [isTransmitting, setIsTransmitting] = useState(false);
    const [isReceiving, setIsReceiving] = useState(false);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [latency, setLatency] = useState<number | null>(null);

    const localStreamRef = useRef<MediaStream | null>(null);
    const pc1Ref = useRef<RTCPeerConnection | null>(null);
    const pc2Ref = useRef<RTCPeerConnection | null>(null);
    const audioTrackSenderRef = useRef<RTCRtpSender | null>(null);

    const handleError = useCallback((message: string, err?: any) => {
        console.error(message, err);
        setError(message);
        setConnectionState('error');
    }, []);

    const setupPeerConnections = useCallback(async () => {
        if (!localStreamRef.current) {
            handleError("Local audio stream not available.");
            return;
        }

        pc1Ref.current = new RTCPeerConnection();
        pc2Ref.current = new RTCPeerConnection();

        pc1Ref.current.onicecandidate = e => e.candidate && pc2Ref.current?.addIceCandidate(e.candidate);
        pc2Ref.current.onicecandidate = e => e.candidate && pc1Ref.current?.addIceCandidate(e.candidate);

        pc1Ref.current.onconnectionstatechange = () => {
             if (pc1Ref.current?.connectionState === 'connected') {
                setConnectionState('connected');
             } else if (['disconnected', 'failed', 'closed'].includes(pc1Ref.current?.connectionState || '')) {
                setConnectionState('disconnected');
             }
        };

        pc2Ref.current.ontrack = (event) => {
            setRemoteStream(event.streams[0]);
            // Simple check to see if remote track is enabled to set receiving state
            event.streams[0].getVideoTracks().forEach(track => {
                 track.onmute = () => setIsReceiving(false);
                 track.onunmute = () => setIsReceiving(true);
            });
             event.streams[0].getAudioTracks().forEach(track => {
                 track.onmute = () => setIsReceiving(false);
                 track.onunmute = () => setIsReceiving(true);
            });
        };

        const audioTrack = localStreamRef.current.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = false; // Start with mic muted
            audioTrackSenderRef.current = pc1Ref.current.addTrack(audioTrack, localStreamRef.current);
        } else {
            handleError("No audio track found in local stream.");
            return;
        }

        try {
            const offer = await pc1Ref.current.createOffer();
            await pc1Ref.current.setLocalDescription(offer);
            await pc2Ref.current.setRemoteDescription(offer);

            const answer = await pc2Ref.current.createAnswer();
            await pc2Ref.current.setLocalDescription(answer);
            await pc1Ref.current.setRemoteDescription(answer);
        } catch (err) {
            handleError("Failed to establish peer connection.", err);
        }

    }, [handleError]);
    
    useEffect(() => {
        async function init() {
            setConnectionState('connecting');
            try {
                localStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
                await setupPeerConnections();
            } catch (err) {
                handleError("Microphone access denied.", err);
            }
        }

        init();

        return () => {
            localStreamRef.current?.getTracks().forEach(track => track.stop());
            pc1Ref.current?.close();
            pc2Ref.current?.close();
        };
    }, [setupPeerConnections, handleError]);
    
    useEffect(() => {
        let intervalId: number | undefined;

        if (connectionState === 'connected' && pc1Ref.current) {
            intervalId = window.setInterval(async () => {
                try {
                    const stats = await pc1Ref.current?.getStats();
                    let rtt: number | null = null;
                    stats?.forEach(report => {
                        if (report.type === 'candidate-pair' && report.state === 'succeeded' && report.currentRoundTripTime) {
                            // currentRoundTripTime is in seconds, convert to ms
                            rtt = report.currentRoundTripTime * 1000;
                        }
                    });
                    setLatency(rtt !== null ? Math.round(rtt) : null);
                } catch (e) {
                    console.error("Error getting WebRTC stats:", e);
                    setLatency(null);
                }
            }, 2000); // Poll every 2 seconds
        } else {
            setLatency(null);
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [connectionState]);


    const startTransmitting = () => {
        if (connectionState === 'connected' && audioTrackSenderRef.current?.track) {
            audioTrackSenderRef.current.track.enabled = true;
            setIsTransmitting(true);
            setIsReceiving(true); // For loopback demo
        }
    };
    
    const stopTransmitting = () => {
        if (connectionState === 'connected' && audioTrackSenderRef.current?.track) {
            audioTrackSenderRef.current.track.enabled = false;
            setIsTransmitting(false);
            setIsReceiving(false); // For loopback demo
        }
    };

    return { 
        connectionState, 
        isTransmitting,
        isReceiving,
        error,
        remoteStream,
        latency,
        startTransmitting, 
        stopTransmitting 
    };
}