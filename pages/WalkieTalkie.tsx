import React, { useRef, useEffect } from 'react';
import useWebRTCTalk from '../hooks/useWebRTCTalk';
import NetworkStatusIndicator from '../components/NetworkStatusIndicator';

const WalkieTalkiePage: React.FC = () => {
    const { 
        connectionState, 
        isTransmitting,
        isReceiving,
        error,
        remoteStream,
        latency,
        startTransmitting, 
        stopTransmitting 
    } = useWebRTCTalk();

    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if (remoteStream && audioRef.current) {
            audioRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    const getStatusInfo = () => {
        if (error) return { text: error, color: 'text-red-500' };
        switch (connectionState) {
            case 'connecting': return { text: 'Connecting...', color: 'text-slate-500' };
            case 'connected': return { text: 'Channel: General (Online)', color: 'text-green-600' };
            case 'disconnected': return { text: 'Disconnected', color: 'text-slate-500' };
            default: return { text: 'Offline', color: 'text-slate-500' };
        }
    };

    const statusInfo = getStatusInfo();

    const getButtonState = () => {
        if (connectionState !== 'connected') {
            return {
                text: connectionState === 'connecting' ? 'CONNECTING' : 'OFFLINE',
                disabled: true,
                className: 'bg-slate-400 text-white cursor-not-allowed',
                icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
            };
        }
        if (isTransmitting) {
            return {
                text: 'TRANSMITTING',
                disabled: false,
                className: 'bg-yellow-400 text-slate-900 shadow-2xl shadow-yellow-500/50 scale-110',
                icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11v2a5 5 0 0010 0v-2a5 5 0 00-10 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 17v4m-4-2h8" /></svg>
            };
        }
        if (isReceiving) {
            return {
                text: 'RECEIVING',
                disabled: true,
                className: 'bg-blue-500 text-white shadow-lg scale-100 cursor-wait',
                icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.636 5.636a9 9 0 0112.728 0m-12.728 0a9 9 0 010 12.728" /></svg>
            };
        }
        return {
            text: 'Push to Talk',
            disabled: false,
            className: 'bg-slate-800 text-white shadow-lg scale-100',
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
        };
    };

    const buttonState = getButtonState();
    
    const buttonClasses = `
        w-full h-full rounded-full flex flex-col items-center justify-center 
        select-none cursor-pointer transition-all duration-200 ease-in-out z-10
        ${buttonState.className}
    `;
    
    const ringClasses = `
        absolute inset-0 rounded-full transition-all duration-300 ease-out
        ${isTransmitting ? 'border-4 border-yellow-400 animate-pulse-strong' : 'border-0'}
    `;

    return (
        <div className="flex flex-col items-center justify-center text-center h-full max-w-md mx-auto">
            <style>{`
                @keyframes pulse-strong {
                    0%, 100% { transform: scale(1); opacity: 0.5; }
                    50% { transform: scale(1.2); opacity: 1; }
                }
                .animate-pulse-strong {
                    animation: pulse-strong 1.5s infinite;
                }
                @keyframes receiving-waves {
                    0% {
                        transform: scale(0.9);
                        opacity: 0.6;
                    }
                    100% {
                        transform: scale(1.8);
                        opacity: 0;
                    }
                }
                .animate-receiving-waves {
                    animation: receiving-waves 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                }
            `}</style>

            <audio ref={audioRef} autoPlay playsInline />
            
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Team Comms</h2>
            <div className="flex items-center justify-center space-x-4 mb-8">
                <p className={`text-lg font-bold transition-colors ${statusInfo.color}`}>{statusInfo.text}</p>
                <NetworkStatusIndicator latency={latency} connectionState={connectionState} />
            </div>

            <div className="relative flex items-center justify-center w-48 h-48 md:w-64 md:h-64">
                {isReceiving && !isTransmitting && (
                    <>
                        <div className="absolute w-full h-full rounded-full bg-blue-400 animate-receiving-waves" style={{ animationDelay: '0s' }}></div>
                        <div className="absolute w-full h-full rounded-full bg-blue-400 animate-receiving-waves" style={{ animationDelay: '1s' }}></div>
                    </>
                )}

                <div className={ringClasses}></div>
                
                <button
                    onMouseDown={startTransmitting}
                    onMouseUp={stopTransmitting}
                    onMouseLeave={stopTransmitting}
                    onTouchStart={(e) => { e.preventDefault(); startTransmitting(); }}
                    onTouchEnd={(e) => { e.preventDefault(); stopTransmitting(); }}
                    disabled={buttonState.disabled}
                    className={buttonClasses}
                    aria-pressed={isTransmitting}
                    aria-label={buttonState.text}
                >
                    {buttonState.icon}
                    <span className="text-xl font-bold tracking-wider">
                        {buttonState.text}
                    </span>
                </button>
            </div>
            
        </div>
    );
};

export default WalkieTalkiePage;