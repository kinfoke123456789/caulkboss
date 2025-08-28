import React, { createContext, useState, ReactNode } from 'react';
import type { Job, CrewMember, Invoice } from '../types';

// --- INITIAL MOCK DATA ---
export const YARD_COORDINATES = { lat: 34.052, lng: -118.243 };

const initialJobs: Job[] = [
    { 
      id: 'J001', 
      title: 'Downtown Plaza Expansion Joints', 
      address: '123 Main St, Anytown', 
      status: 'In Progress', 
      crewId: 'C01',
      description: 'Replacing old, failed sealant in high-traffic pedestrian plaza. Joints are 1-inch wide. Grinding and cleaning required.',
      surfaceMaterial: 'Concrete',
      location: { lat: 34.055, lng: -118.250 }
    },
    { 
      id: 'J002', 
      title: 'Airport Runway 2B Saw Cuts', 
      address: '789 Terminal Dr, Anytown', 
      status: 'Pending',
      description: 'Sealing fresh saw cuts on a newly poured concrete runway. Job must be completed overnight. High wind exposure.',
      surfaceMaterial: 'Concrete',
      location: { lat: 33.941, lng: -118.408 }
    },
    { 
      id: 'J003', 
      title: 'Residential Driveway Repair', 
      address: '456 Oak Ave, Suburbia', 
      status: 'Completed',
      crewId: 'C03',
      description: 'Sealing control joints in a residential driveway. Area is sloped and has brick paver borders.',
      surfaceMaterial: 'Brick Pavers',
      location: { lat: 34.152, lng: -118.443 }
    },
];

const initialCrews: CrewMember[] = [
    { id: 'C01', name: 'Mike\'s Crew', status: 'On Site', locationName: '123 Main St, Anytown', location: { lat: 34.055, lng: -118.250 } },
    { id: 'C02', name: 'Javier\'s Crew', status: 'Available', locationName: 'Yard', location: YARD_COORDINATES },
    { id: 'C03', name: 'Dave\'s Crew', status: 'Available', locationName: 'Yard', location: YARD_COORDINATES },
];

const initialInvoices: Invoice[] = [
    { id: 'INV-001', jobTitle: 'Downtown Plaza Expansion Joints', clientName: 'City Corp', amount: 12500, status: 'Paid', dueDate: '2024-06-30' },
    { id: 'INV-002', jobTitle: 'Residential Driveway Repair', clientName: 'Jane Smith', amount: 850, status: 'Sent', dueDate: '2024-07-15' },
    { id: 'INV-003', jobTitle: 'Warehouse Floor Control Joints', clientName: 'Logistics Inc', amount: 24000, status: 'Overdue', dueDate: '2024-06-20' },
    { id: 'INV-004', jobTitle: 'Parking Garage Sealant', clientName: 'Metro Parking', amount: 18200, status: 'Draft', dueDate: '2024-08-01' },
];


// --- CONTEXT DEFINITION ---

interface AppContextType {
    jobs: Job[];
    crews: CrewMember[];
    invoices: Invoice[];
    addJob: (job: Job) => void;
    addInvoice: (invoice: Invoice) => void;
    addCrew: (crew: CrewMember) => void;
    updateCrew: (crew: CrewMember) => void;
    deleteCrew: (crewId: string) => void;
    assignCrewToJob: (crewId: string, jobId?: string) => void;
}

export const AppContext = createContext<AppContextType>({
    jobs: [],
    crews: [],
    invoices: [],
    addJob: () => {},
    addInvoice: () => {},
    addCrew: () => {},
    updateCrew: () => {},
    deleteCrew: () => {},
    assignCrewToJob: () => {},
});

// --- PROVIDER COMPONENT ---

interface AppProviderProps {
    children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
    const [jobs, setJobs] = useState<Job[]>(initialJobs);
    const [crews, setCrews] = useState<CrewMember[]>(initialCrews);
    const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);

    const addJob = (job: Job) => {
        setJobs(prev => [...prev, job]);
    };

    const addInvoice = (invoice: Invoice) => {
        setInvoices(prev => [...prev, invoice]);
    };

    const addCrew = (crew: CrewMember) => {
        setCrews(prev => [...prev, crew]);
    };

    const updateCrew = (updatedCrew: CrewMember) => {
        setCrews(prev => prev.map(c => c.id === updatedCrew.id ? updatedCrew : c));
    };
    
    const deleteCrew = (crewId: string) => {
        setCrews(prev => prev.filter(c => c.id !== crewId));
        // Also un-assign from any job
        setJobs(prev => prev.map(j => j.crewId === crewId ? { ...j, crewId: undefined } : j));
    };
    
    const assignCrewToJob = (crewId: string, jobId?: string) => {
         setJobs(prevJobs => {
            // Remove the crew from any job it was previously assigned to
            const jobsWithoutCrew = prevJobs.map(j => 
                j.crewId === crewId ? { ...j, crewId: undefined } : j
            );
            // Assign crew to the new job, if one is selected
            if (jobId) {
                return jobsWithoutCrew.map(j => 
                    j.id === jobId ? { ...j, crewId: crewId } : j
                );
            }
            return jobsWithoutCrew;
        });
    }

    const value = {
        jobs,
        crews,
        invoices,
        addJob,
        addInvoice,
        addCrew,
        updateCrew,
        deleteCrew,
        assignCrewToJob
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};