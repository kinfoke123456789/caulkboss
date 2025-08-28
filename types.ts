export interface EstimationFormData {
  clientName: string;
  linearFeet: number;
  jointType: 'Expansion' | 'Control' | 'Saw Cut';
  surfaceMaterial: 'Concrete' | 'Asphalt' | 'Brick Pavers';
  jobSitePhoto: File;
}

export interface Material {
  item: string;
  quantity: string;
}

export interface EstimationResultData {
  analysis: string;
  materials: Material[];
  laborHours: number;
  durationDays: number;
  totalMaterialCost: number;
  totalLaborCost: number;
  totalJobCost: number;
}

export type JobStatus = 'Pending' | 'In Progress' | 'Completed';
export interface Job {
  id: string;
  title: string;
  address: string;
  crewId?: string;
  status: JobStatus;
  description?: string;
  surfaceMaterial?: 'Concrete' | 'Asphalt' | 'Brick Pavers';
  location: { lat: number; lng: number; };
}

export type CrewStatus = 'Available' | 'On Site' | 'Traveling' | 'Offline';
export interface CrewMember {
  id: string;
  name: string;
  status: CrewStatus;
  locationName: string;
  location: { lat: number; lng: number; };
}

export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Overdue';
export interface Invoice {
  id: string;
  jobTitle: string;
  clientName: string;
  amount: number;
  status: InvoiceStatus;
  dueDate: string;
}

export interface CuringAnalysisResult {
    advice: string;
    curingTime: string;
}

export interface SafetyBriefingResult {
    briefingPoints: string[];
}