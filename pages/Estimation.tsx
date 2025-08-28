import React, { useState, useCallback } from 'react';
import EstimationForm from '../components/EstimationForm';
import EstimationResult from '../components/EstimationResult';
import LoadingSpinner from '../components/LoadingSpinner';
import type { EstimationFormData, EstimationResultData } from '../types';
import { getEstimation } from '../services/geminiService';

const EstimationPage: React.FC = () => {
  const [estimationResult, setEstimationResult] = useState<EstimationResultData | null>(null);
  const [formData, setFormData] = useState<EstimationFormData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = useCallback(async (data: EstimationFormData) => {
    setIsLoading(true);
    setError(null);
    setEstimationResult(null);
    setFormData(data);

    try {
      const result = await getEstimation(data);
      setEstimationResult(result);
    } catch (err) {
      console.error(err);
      setError('Failed to generate estimation. The AI model may be busy or an error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const InitialState = () => (
    <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 p-8 bg-white rounded-lg shadow-lg">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h2 className="text-2xl font-bold text-slate-700">AI-Powered Estimations</h2>
      <p className="mt-2 max-w-sm">
        Fill out the project details on the left and upload a photo of the job site to get an instant, AI-generated estimate for materials and labor.
      </p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">New Project Estimate</h2>
        <p className="text-slate-500 mb-6">Enter details and upload a photo to begin.</p>
        <EstimationForm onSubmit={handleFormSubmit} isLoading={isLoading} />
      </div>

      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm rounded-2xl z-10">
            <LoadingSpinner />
          </div>
        )}
        
        {error && (
            <div className="flex flex-col items-center justify-center h-full text-center text-red-700 p-8 bg-red-50 rounded-lg shadow-lg border border-red-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-2xl font-bold">An Error Occurred</h3>
                <p className="mt-2 max-w-sm">{error}</p>
            </div>
        )}

        {!isLoading && !error && !estimationResult && <InitialState />}

        {!isLoading && !error && estimationResult && formData && (
            <EstimationResult result={estimationResult} formData={formData} />
        )}
      </div>

    </div>
  );
};

export default EstimationPage;