import React, { useState, useEffect } from 'react';
import type { CrewMember, CrewStatus, Job } from '../types';
// Fix: Corrected the import path for YARD_COORDINATES.
import { YARD_COORDINATES } from '../context/AppContext';

interface CrewFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (crewMember: CrewMember, assignedJobId?: string) => void;
    crewMember: CrewMember | null;
    jobs: Job[];
}

const CrewFormModal: React.FC<CrewFormModalProps> = ({ isOpen, onClose, onSave, crewMember, jobs }) => {
    const [name, setName] = useState('');
    const [status, setStatus] = useState<CrewStatus>('Available');
    const [assignedJobId, setAssignedJobId] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (crewMember) {
            setName(crewMember.name);
            setStatus(crewMember.status);
            const currentJob = jobs.find(j => j.crewId === crewMember.id);
            setAssignedJobId(currentJob?.id);
        } else {
            // Reset form for new entry
            setName('');
            setStatus('Available');
            setAssignedJobId(undefined);
        }
    }, [crewMember, jobs, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const assignedJob = assignedJobId ? jobs.find(j => j.id === assignedJobId) : null;
        
        const crewData: CrewMember = {
            id: crewMember?.id || '', // ID is handled by parent on creation
            name,
            status,
            locationName: assignedJob?.address || 'Yard',
            location: assignedJob?.location || YARD_COORDINATES,
        };
        onSave(crewData, assignedJobId);
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
            aria-modal="true"
            role="dialog"
        >
            <div className="bg-white rounded-lg shadow-xl p-8 m-4 max-w-lg w-full">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">{crewMember ? 'Edit Crew' : 'Add New Crew'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="crewName" className="block text-sm font-medium text-slate-700">Crew Name</label>
                        <input
                            type="text"
                            id="crewName"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="crewStatus" className="block text-sm font-medium text-slate-700">Status</label>
                        <select
                            id="crewStatus"
                            value={status}
                            onChange={(e) => setStatus(e.target.value as CrewStatus)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm rounded-md"
                        >
                            <option>Available</option>
                            <option>On Site</option>
                            <option>Offline</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="assignedJob" className="block text-sm font-medium text-slate-700">Assign to Job</label>
                        <select
                            id="assignedJob"
                            value={assignedJobId || ''}
                            onChange={(e) => setAssignedJobId(e.target.value || undefined)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm rounded-md"
                        >
                            <option value="">-- Unassigned --</option>
                            {jobs.filter(j => !j.crewId || j.crewId === crewMember?.id).map(job => (
                                <option key={job.id} value={job.id}>{job.title}</option>
                            ))}
                        </select>
                    </div>
                    <div className="pt-4 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 bg-slate-800 text-white font-semibold rounded-lg shadow-md hover:bg-slate-900 transition-colors">
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CrewFormModal;