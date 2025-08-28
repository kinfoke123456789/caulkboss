import React, { useState, useMemo, useContext } from 'react';
import type { Job, CuringAnalysisResult, SafetyBriefingResult } from '../types';
import { getCuringAnalysis, getSafetyBriefing } from '../services/geminiService';
import { AppContext } from '../context/AppContext';

// Mock weather data for demonstration
const mockWeather = {
    temp: 72,
    humidity: 55,
    wind: 12,
    chanceOfRain: 10,
};

const IntelligencePage: React.FC = () => {
    const { jobs } = useContext(AppContext);
    const [selectedJobId, setSelectedJobId] = useState<string | undefined>(jobs[0]?.id);
    const [curingResult, setCuringResult] = useState<CuringAnalysisResult | null>(null);
    const [safetyResult, setSafetyResult] = useState<SafetyBriefingResult | null>(null);
    const [isCuringLoading, setIsCuringLoading] = useState(false);
    const [isSafetyLoading, setIsSafetyLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const selectedJob = useMemo(() => jobs.find(j => j.id === selectedJobId), [selectedJobId, jobs]);

    const handleCuringAnalysis = async () => {
        if (!selectedJob) return;
        setIsCuringLoading(true);
        setError(null);
        setCuringResult(null);
        try {
            const result = await getCuringAnalysis(selectedJob, mockWeather);
            setCuringResult(result);
        } catch (err) {
            console.error(err);
            setError("Failed to get curing analysis.");
        } finally {
            setIsCuringLoading(false);
        }
    };
    
    const handleSafetyBriefing = async () => {
        if (!selectedJob) return;
        setIsSafetyLoading(true);
        setError(null);
        setSafetyResult(null);
        try {
            const result = await getSafetyBriefing(selectedJob, mockWeather);
            setSafetyResult(result);
        } catch (err) {
            console.error(err);
            setError("Failed to generate safety briefing.");
        } finally {
            setIsSafetyLoading(false);
        }
    };

    if (jobs.length === 0) {
         return (
             <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 p-8 bg-white rounded-lg shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <h2 className="text-2xl font-bold text-slate-700">No Jobs Available</h2>
                <p className="mt-2 max-w-sm">Create a job from an estimate to use the Intelligence Hub.</p>
            </div>
         );
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-slate-800">Job Site Intelligence</h2>
                <p className="text-slate-500 mt-1">AI-powered insights for your active jobs.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
                <label htmlFor="job-select" className="block text-sm font-medium text-slate-700">Select a Job</label>
                <select 
                    id="job-select" 
                    className="mt-1 block w-full pl-3 pr-10 py-3 text-base bg-slate-50 border-slate-300 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm rounded-md"
                    value={selectedJobId}
                    onChange={(e) => {
                        setSelectedJobId(e.target.value);
                        setCuringResult(null); // Reset results on job change
                        setSafetyResult(null);
                        setError(null);
                    }}
                >
                    {jobs.map(job => (
                        <option key={job.id} value={job.id}>{job.title}</option>
                    ))}
                </select>
            </div>

            {error && <div className="p-4 bg-red-100 text-red-700 border border-red-200 rounded-lg">{error}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Curing Analysis Card */}
                <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col">
                    <div className="flex items-center mb-4">
                        <div className="bg-slate-100 rounded-full p-2 mr-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">AI Weather & Curing Advisory</h3>
                    </div>
                    <div className="text-sm text-slate-600 space-y-2 mb-4 flex-grow">
                        <p><strong>Conditions:</strong> {mockWeather.temp}°F, {mockWeather.humidity}% Humidity, {mockWeather.chanceOfRain}% Rain Chance</p>
                        {isCuringLoading ? (
                            <p className="animate-pulse">AI Chemical Engineer is analyzing conditions...</p>
                        ) : curingResult ? (
                            <div className="space-y-3 pt-2">
                                <p><strong>Cure Time Estimate:</strong> <span className="font-bold text-slate-900">{curingResult.curingTime}</span></p>
                                <p><strong>Expert Advice:</strong> {curingResult.advice}</p>
                            </div>
                        ) : (
                            <p>Generate a report for expert advice on sealant application and cure times based on today's weather.</p>
                        )}
                    </div>
                    <button onClick={handleCuringAnalysis} disabled={isCuringLoading || !selectedJob} className="w-full mt-auto py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400">
                        {isCuringLoading ? 'Analyzing...' : 'Get Curing Analysis'}
                    </button>
                </div>

                {/* Safety Briefing Card */}
                <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col">
                    <div className="flex items-center mb-4">
                        <div className="bg-slate-100 rounded-full p-2 mr-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">AI Daily Safety Briefing</h3>
                    </div>
                    <div className="text-sm text-slate-600 space-y-2 mb-4 flex-grow">
                         {isSafetyLoading ? (
                            <p className="animate-pulse">AI Safety Officer is preparing the briefing...</p>
                        ) : safetyResult ? (
                             <ul className="list-disc list-inside space-y-2 pt-2">
                                {safetyResult.briefingPoints.map((point, i) => <li key={i}>{point}</li>)}
                            </ul>
                        ) : (
                             <p>Generate a "toolbox talk" checklist tailored to this job's specific tasks and today's weather hazards.</p>
                        )}
                    </div>
                     <button onClick={handleSafetyBriefing} disabled={isSafetyLoading || !selectedJob} className="w-full mt-auto py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400">
                        {isSafetyLoading ? 'Generating...' : 'Generate Safety Briefing'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IntelligencePage;