import React, { useContext, useState } from 'react';
import type { EstimationResultData, EstimationFormData } from '../types';
import { AppContext } from '../context/AppContext';

interface EstimationResultProps {
  result: EstimationResultData;
  formData: EstimationFormData;
}

const ResultCard: React.FC<{ title: string; icon: JSX.Element; children: React.ReactNode; className?: string }> = ({ title, icon, children, className = '' }) => (
    <div className={`bg-white p-6 rounded-lg shadow-md border border-slate-200 ${className}`}>
        <div className="flex items-center mb-4">
            <div className="bg-slate-100 rounded-full p-2 mr-4">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-slate-800">{title}</h3>
        </div>
        {children}
    </div>
);

const SiteAnalysisIcon = () => (
    <svg xmlns="http://www.w.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
);

const MaterialsIcon = () => (
    <svg xmlns="http://www.w.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
);

const LaborIcon = () => (
    <svg xmlns="http://www.w.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);

const CostIcon = () => (
    <svg xmlns="http://www.w.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1h4v1m-4 0h-4v-1h4m0-4v1m0 10v1m0 0v1m0 0h-4v-1h4m0 0h4v-1h-4M8 16v-1h1m-1 0H7v-1h1m4 0v1m0 0v1m0-1h-1v1h1m0 0h1v-1h-1m-6-4v1m0-1v-1m0 0h-1v1h1m0 0h1v-1h-1" /></svg>
);

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};


const EstimationResult: React.FC<EstimationResultProps> = ({ result, formData }) => {
  const { addJob, addInvoice } = useContext(AppContext);
  const [jobCreated, setJobCreated] = useState(false);
  const [invoiceCreated, setInvoiceCreated] = useState(false);

  const handleConvertToJob = () => {
    addJob({
      id: `J${Date.now()}`,
      title: `Job for ${formData.clientName}`,
      address: 'Address from estimate', // Placeholder
      status: 'Pending',
      description: result.analysis,
      surfaceMaterial: formData.surfaceMaterial,
      location: { lat: 34.0522, lng: -118.2437 }, // Placeholder
    });
    setJobCreated(true);
  };

  const handleCreateInvoice = () => {
    addInvoice({
      id: `INV-${Date.now()}`,
      jobTitle: `Job for ${formData.clientName}`,
      clientName: formData.clientName,
      amount: result.totalJobCost,
      status: 'Draft',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    setInvoiceCreated(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
        <ResultCard title="AI Site Analysis" icon={<SiteAnalysisIcon />}>
            <p className="text-slate-600 leading-relaxed">{result.analysis}</p>
        </ResultCard>

         <ResultCard title="Cost & Price Summary" icon={<CostIcon />}>
            <div className="space-y-4">
                <div className="flex justify-between items-center text-lg">
                    <span className="text-slate-600">Total Material Cost</span>
                    <span className="font-bold text-slate-800">{formatCurrency(result.totalMaterialCost)}</span>
                </div>
                <div className="flex justify-between items-center text-lg">
                    <span className="text-slate-600">Total Labor Cost</span>
                    <span className="font-bold text-slate-800">{formatCurrency(result.totalLaborCost)}</span>
                </div>
                 <div className="flex justify-between items-center text-2xl font-bold pt-2 border-t mt-2">
                    <span className="text-slate-900">Total Job Price</span>
                    <span className="text-green-600">{formatCurrency(result.totalJobCost)}</span>
                </div>
            </div>
        </ResultCard>

        <ResultCard title="Material Estimate" icon={<MaterialsIcon />}>
            <ul className="space-y-3">
                {result.materials.map((material, index) => (
                    <li key={index} className="flex justify-between items-center bg-slate-50 p-3 rounded-md">
                        <span className="font-medium text-slate-700">{material.item}</span>
                        <span className="font-bold text-slate-800">{material.quantity}</span>
                    </li>
                ))}
            </ul>
        </ResultCard>
        
        <ResultCard title="Labor & Duration" icon={<LaborIcon />}>
            <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                    <p className="text-3xl font-extrabold text-slate-900">{result.laborHours}</p>
                    <p className="text-sm text-slate-500">Total Labor Hours</p>
                </div>
                <div>
                    <p className="text-3xl font-extrabold text-slate-900">{result.durationDays}</p>
                    <p className="text-sm text-slate-500">Projected Days</p>
                </div>
            </div>
        </ResultCard>

        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Next Steps</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                    onClick={handleConvertToJob} 
                    disabled={jobCreated}
                    className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
                >
                    {jobCreated ? '✓ Job Created' : 'Convert to Job'}
                </button>
                 <button 
                    onClick={handleCreateInvoice}
                    disabled={invoiceCreated}
                    className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                >
                    {invoiceCreated ? '✓ Invoice Created' : 'Create Invoice'}
                </button>
            </div>
        </div>
        
        <style>{`
            @keyframes fade-in {
                0% { opacity: 0; transform: translateY(10px); }
                100% { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in {
                animation: fade-in 0.5s ease-out forwards;
            }
        `}</style>
    </div>
  );
};

export default EstimationResult;