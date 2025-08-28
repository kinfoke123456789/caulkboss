import React from 'react';
import type { Job, CrewMember } from '../types';

interface GpsMapProps {
    jobs: Job[];
    crews: CrewMember[];
}

const JobIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 11-2 0V4H6v12a1 1 0 11-2 0V4zm5 4a1 1 0 100 2h2a1 1 0 100-2H9zm-1 4a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
);

const CrewIcon = ({ status }: { status: string }) => {
    const color = status === 'On Site' ? 'text-blue-400' : status === 'Traveling' ? 'text-purple-400' : 'text-green-400';
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${color}`} viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.428A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
        </svg>
    );
};


const GpsMap: React.FC<GpsMapProps> = ({ jobs, crews }) => {
    // Combine all locations to calculate map bounds
    const allLocations = [
        ...jobs.map(j => j.location),
        ...crews.filter(c => c.status !== 'Offline').map(c => c.location)
    ];

    if (allLocations.length === 0) {
        return <div className="w-full h-full flex items-center justify-center text-slate-400">No active jobs or crews to display.</div>;
    }

    // Calculate bounding box
    const latitudes = allLocations.map(loc => loc.lat);
    const longitudes = allLocations.map(loc => loc.lng);
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    // Add padding to bounds
    const latPadding = (maxLat - minLat) * 0.1 || 0.01;
    const lngPadding = (maxLng - minLng) * 0.1 || 0.01;
    const bounds = {
        minLat: minLat - latPadding,
        maxLat: maxLat + latPadding,
        minLng: minLng - lngPadding,
        maxLng: maxLng + lngPadding
    };

    // Function to convert lat/lng to percentage-based x/y
    const getPosition = (lat: number, lng: number) => {
        const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
        const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * 100;
        return { left: `${x}%`, top: `${y}%` };
    };

    return (
        <div className="w-full h-full relative overflow-hidden bg-slate-800 rounded-lg border-4 border-slate-600">
            {/* Map Background Pattern */}
            <svg width="100%" height="100%" className="absolute inset-0">
                <defs>
                    <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(100, 116, 139, 0.4)" strokeWidth="1"/>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
            
            {/* Render Jobs */}
            {jobs.map(job => (
                <div 
                    key={`job-${job.id}`} 
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                    style={getPosition(job.location.lat, job.location.lng)}
                >
                    <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center border-2 border-slate-400">
                        <JobIcon />
                    </div>
                    <div className="hidden group-hover:block absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-xs rounded-md whitespace-nowrap">
                        {job.title}
                    </div>
                </div>
            ))}

            {/* Render Crews */}
            {crews.filter(c => c.status !== 'Offline').map(crew => (
                 <div 
                    key={`crew-${crew.id}`} 
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 group transition-all duration-1000 ease-linear"
                    style={getPosition(crew.location.lat, crew.location.lng)}
                >
                    <CrewIcon status={crew.status}/>
                    <div className="hidden group-hover:block absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-xs rounded-md whitespace-nowrap">
                        {crew.name} ({crew.status})
                    </div>
                </div>
            ))}
        </div>
    );
};

export default GpsMap;
