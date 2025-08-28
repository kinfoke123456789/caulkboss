import React, { useState, useRef, useMemo } from 'react';
import type { EstimationFormData } from '../types';

interface EstimationFormProps {
  onSubmit: (data: EstimationFormData) => void;
  isLoading: boolean;
}

const EstimationForm: React.FC<EstimationFormProps> = ({ onSubmit, isLoading }) => {
  const [clientName, setClientName] = useState<string>('');
  const [linearFeet, setLinearFeet] = useState<number>(100);
  const [jointType, setJointType] = useState<'Expansion' | 'Control' | 'Saw Cut'>('Control');
  const [surfaceMaterial, setSurfaceMaterial] = useState<'Concrete' | 'Asphalt' | 'Brick Pavers'>('Concrete');
  const [jobSitePhoto, setJobSitePhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        setError('File size must be less than 4MB.');
        return;
      }
      setError(null);
      setJobSitePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const isFormValid = useMemo(() => {
    return linearFeet > 0 && jobSitePhoto !== null && clientName.trim() !== '';
  }, [linearFeet, jobSitePhoto, clientName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
        setError('Please fill all fields and upload a photo.');
        return;
    }
    if (jobSitePhoto) {
        onSubmit({ clientName, linearFeet, jointType, surfaceMaterial, jobSitePhoto });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
       <div>
        <label htmlFor="clientName" className="block text-sm font-medium text-slate-700">Client Name</label>
        <input
          type="text"
          id="clientName"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
          placeholder="e.g., City Corp, Jane Smith"
          required
        />
      </div>

      <div>
        <label htmlFor="linearFeet" className="block text-sm font-medium text-slate-700">Total Linear Feet</label>
        <input
          type="number"
          id="linearFeet"
          value={linearFeet}
          onChange={(e) => setLinearFeet(Number(e.target.value))}
          className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="jointType" className="block text-sm font-medium text-slate-700">Joint Type</label>
          <select
            id="jointType"
            value={jointType}
            onChange={(e) => setJointType(e.target.value as any)}
            className="mt-1 block w-full pl-3 pr-10 py-3 text-base bg-slate-50 border-slate-300 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm rounded-md"
          >
            <option>Expansion</option>
            <option>Control</option>
            <option>Saw Cut</option>
          </select>
        </div>
        <div>
          <label htmlFor="surfaceMaterial" className="block text-sm font-medium text-slate-700">Surface Material</label>
          <select
            id="surfaceMaterial"
            value={surfaceMaterial}
            onChange={(e) => setSurfaceMaterial(e.target.value as any)}
            className="mt-1 block w-full pl-3 pr-10 py-3 text-base bg-slate-50 border-slate-300 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm rounded-md"
          >
            <option>Concrete</option>
            <option>Asphalt</option>
            <option>Brick Pavers</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Job Site Photo</label>
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md cursor-pointer hover:bg-slate-50"
        >
          {photoPreview ? (
            <img src={photoPreview} alt="Job site preview" className="max-h-48 rounded-md object-contain" />
          ) : (
            <div className="space-y-1 text-center">
              <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={1} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex text-sm text-slate-600">
                <p className="pl-1">Upload a file</p>
              </div>
              <p className="text-xs text-slate-500">PNG, JPG, GIF up to 4MB</p>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          id="jobSitePhoto"
          onChange={handleFileChange}
          className="hidden"
          accept="image/png, image/jpeg, image/gif"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      
      <div>
        <button
          type="submit"
          disabled={!isFormValid || isLoading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
        >
          {isLoading ? 'Analyzing...' : 'Generate Estimate'}
        </button>
      </div>
    </form>
  );
};

export default EstimationForm;