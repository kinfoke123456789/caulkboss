import React, { useState, useContext } from 'react';
import type { Job, CrewMember, CrewStatus } from '../types';
import CrewFormModal from '../components/CrewFormModal';
import { AppContext, YARD_COORDINATES } from '../context/AppContext';

const statusColorMap: { [key in CrewStatus]: string } = {
    'Available': 'bg-green-100 text-green-800',
    'On Site': 'bg-blue-100 text-blue-800',
    'Traveling': 'bg-purple-100 text-purple-800',
    'Offline': 'bg-slate-100 text-slate-800',
};

const CrewsPage: React.FC = () => {
    const { crews, jobs, updateCrew, addCrew, deleteCrew, assignCrewToJob } = useContext(AppContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCrew, setEditingCrew] = useState<CrewMember | null>(null);

    const openModalForEdit = (crew: CrewMember) => {
        setEditingCrew(crew);
        setIsModalOpen(true);
    };

    const openModalForNew = () => {
        setEditingCrew(null);
        setIsModalOpen(true);
    };

    const handleDelete = (crewId: string) => {
        if (window.confirm('Are you sure you want to remove this crew?')) {
            deleteCrew(crewId);
        }
    };
    
    const handleSaveCrew = (crewData: CrewMember, assignedJobId?: string) => {
        const assignedJob = assignedJobId ? jobs.find(j => j.id === assignedJobId) : null;
        
        const finalCrewData = {
            ...crewData,
            locationName: assignedJob?.address || 'Yard',
            location: assignedJob?.location || YARD_COORDINATES,
        };

        if (editingCrew) { // Update existing crew
            updateCrew(finalCrewData);
        } else { // Add new crew
            addCrew({ ...finalCrewData, id: `C${Date.now()}` });
        }
        
        assignCrewToJob(finalCrewData.id, assignedJobId);

        setIsModalOpen(false);
        setEditingCrew(null);
    };

    return (
        <>
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-slate-800">Crew Management</h2>
                    <button 
                        onClick={openModalForNew}
                        className="px-4 py-2 bg-slate-800 text-white font-semibold rounded-lg shadow-md hover:bg-slate-900 transition-colors"
                    >
                        + Add Crew
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Crew Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Assigned Job</th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {crews.map((crew) => {
                                const assignedJob = jobs.find(j => j.crewId === crew.id);
                                return (
                                    <tr key={crew.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{crew.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColorMap[crew.status]}`}>
                                                {crew.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{assignedJob?.title || 'Unassigned'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <button onClick={() => openModalForEdit(crew)} className="text-slate-600 hover:text-slate-900">Edit</button>
                                            <button onClick={() => handleDelete(crew.id)} className="text-red-600 hover:text-red-900">Remove</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && (
                <CrewFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveCrew}
                    crewMember={editingCrew}
                    jobs={jobs}
                />
            )}
        </>
    );
};

export default CrewsPage;