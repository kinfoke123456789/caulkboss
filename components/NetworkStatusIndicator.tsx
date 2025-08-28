import React from 'react';

interface NetworkStatusIndicatorProps {
    latency: number | null;
    connectionState: string;
}

const NetworkStatusIndicator: React.FC<NetworkStatusIndicatorProps> = ({ latency, connectionState }) => {
    if (connectionState !== 'connected' || latency === null) {
        return (
             <div className="flex items-center space-x-2">
                <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                <span className="text-sm text-slate-500 font-mono">-- ms</span>
            </div>
        );
    }
    
    let signalStrength = 0;
    if (latency < 100) signalStrength = 4;
    else if (latency < 200) signalStrength = 3;
    else if (latency < 300) signalStrength = 2;
    else signalStrength = 1;

    const getBarClass = (barLevel: number) => {
        if (signalStrength >= barLevel) {
            if (signalStrength >= 4) return 'text-green-500';
            if (signalStrength >= 3) return 'text-yellow-500';
            if (signalStrength >= 2) return 'text-orange-500';
            return 'text-red-500';
        }
        return 'text-slate-300';
    };
    
    const latencyColor = 
        latency < 100 ? 'text-green-600' :
        latency < 200 ? 'text-yellow-600' :
        'text-red-600';

    return (
        <div className="flex items-center space-x-2" title={`Signal Strength: ${signalStrength}/4`}>
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="15" width="4" height="6" rx="1" className={getBarClass(1)} />
                <rect x="8" y="11" width="4" height="10" rx="1" className={getBarClass(2)} />
                <rect x="13" y="7" width="4" height="14" rx="1" className={getBarClass(3)} />
                <rect x="18" y="3" width="4" height="18" rx="1" className={getBarClass(4)} />
            </svg>
            <span className={`text-sm font-mono font-semibold ${latencyColor}`}>{latency}ms</span>
        </div>
    );
};

export default NetworkStatusIndicator;
