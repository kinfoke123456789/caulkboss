import { useState, useEffect } from 'react';
import type { CrewMember, Job } from '../types';
import { YARD_COORDINATES } from '../context/AppContext';

const SIMULATION_INTERVAL = 2000; // ms
const TRAVEL_SPEED = 0.05; // Percentage of distance per interval

export default function useCrewLocationSimulator(jobs: Job[], initialCrews: CrewMember[]) {
    const [simulatedCrews, setSimulatedCrews] = useState<CrewMember[]>(initialCrews);
    
    useEffect(() => {
        setSimulatedCrews(initialCrews);
    }, [initialCrews]);


    useEffect(() => {
        const intervalId = setInterval(() => {
            const jobsById = new Map(jobs.map(job => [job.id, job]));
            const assignedCrews = new Set(jobs.map(job => job.crewId).filter(Boolean));

            setSimulatedCrews(prevCrews => 
                prevCrews.map(crew => {
                    const assignedJob = jobs.find(j => j.crewId === crew.id);

                    if (crew.status === 'Offline') {
                        return crew;
                    }

                    if (assignedJob) {
                        const targetLocation = assignedJob.location;
                        const distLat = targetLocation.lat - crew.location.lat;
                        const distLng = targetLocation.lng - crew.location.lng;
                        const distance = Math.sqrt(distLat*distLat + distLng*distLng);

                        if (distance < 0.001) {
                            // Arrived at destination
                            return { 
                                ...crew, 
                                status: 'On Site', 
                                location: targetLocation,
                                locationName: assignedJob.address
                            };
                        } else {
                            // Traveling
                            const newLat = crew.location.lat + distLat * TRAVEL_SPEED;
                            const newLng = crew.location.lng + distLng * TRAVEL_SPEED;
                            return { 
                                ...crew, 
                                status: 'Traveling', 
                                location: { lat: newLat, lng: newLng },
                                locationName: `En route to ${assignedJob.title}`
                            };
                        }
                    } else {
                        // Not assigned to a job, should be at the yard
                        // Only move them back if they aren't already available
                        if (crew.status !== 'Available') {
                           return { 
                                ...crew, 
                                status: 'Available', 
                                location: YARD_COORDINATES,
                                locationName: 'Yard' 
                            };
                        }
                        return crew;
                    }
                })
            );
        }, SIMULATION_INTERVAL);

        return () => clearInterval(intervalId);
    }, [jobs]);

    return { simulatedCrews };
}