import React, { useContext } from 'react';
import type { Job, CrewMember } from '../types';
import GpsMap from '../components/GpsMap';
import useCrewLocationSimulator from '../hooks/useCrewLocationSimulator';
import { AppContext } from '../context/AppContext';

const statusColorMap = {
    'In Progress': 'bg-blue-100 text-blue-800',
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Completed': 'bg-green-100 text-green-800',
    'Available': 'bg-green-100 text-green-800',
    'On Site': 'bg-blue-100 text-blue-800',
    'Traveling': 'bg-purple-100 text-purple-800',
    'Offline': 'bg-slate-100 text-slate-800',
};

const DispatchPage: React.FC = () => {
  const { jobs, crews: allCrews } = useContext(AppContext);
  const { simulatedCrews } = useCrewLocationSimulator(jobs, allCrews);
  
  const jobsWithCrewNames = jobs.map(job => ({ 
      ...job, 
      crewName: simulatedCrews.find(c => c.id === job.crewId)?.name 
  }));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Crew Dispatch & Live GPS</h2>
        <div className="bg-slate-700 rounded-lg shadow-lg h-80 md:h-96 w-full">
          <GpsMap jobs={jobs} crews={simulatedCrews} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Active Jobs</h3>
          <ul className="space-y-4">
            {jobsWithCrewNames.map(job => (
              <li key={job.id} className="p-4 border rounded-md hover:bg-slate-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-slate-700">{job.title}</p>
                    <p className="text-sm text-slate-500">{job.address}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColorMap[job.status]}`}>{job.status}</span>
                </div>
                {job.crewId && <p className="text-sm text-slate-600 mt-2">Assigned to: <span className="font-medium">{job.crewName || '...'}</span></p>}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Crews</h3>
          <ul className="space-y-4">
            {simulatedCrews.map(crew => (
              <li key={crew.id} className="p-4 border rounded-md hover:bg-slate-50">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-bold text-slate-700">{crew.name}</p>
                        <p className="text-sm text-slate-500">Location: {crew.locationName}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColorMap[crew.status]}`}>{crew.status}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DispatchPage;