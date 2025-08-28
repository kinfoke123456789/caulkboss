import { GoogleGenAI, Type } from "@google/genai";
import type { EstimationFormData, Job, CuringAnalysisResult, SafetyBriefingResult } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        resolve((reader.result as string).split(',')[1]);
      } else {
        resolve(''); // or reject
      }
    };
    reader.readAsDataURL(file);
  });
  
  const data = await base64EncodedDataPromise;
  if (!data) {
    throw new Error("Failed to read file");
  }

  return {
    inlineData: { data, mimeType: file.type },
  };
};

const estimationResponseSchema = {
    type: Type.OBJECT,
    properties: {
        analysis: {
            type: Type.STRING,
            description: "A detailed analysis of the job site from the photo. Identify concrete condition, joint type, and potential issues like cracks, spalling, or old sealant.",
        },
        materials: {
            type: Type.ARRAY,
            description: "A list of required materials with quantities.",
            items: {
                type: Type.OBJECT,
                properties: {
                    item: { type: Type.STRING, description: "Name of the material (e.g., 'Self-leveling sealant (32oz tubes)', 'Backer rod')." },
                    quantity: { type: Type.STRING, description: "Quantity required (e.g., '55 tubes', '450 linear feet')." },
                },
                 required: ["item", "quantity"],
            },
        },
        laborHours: {
            type: Type.NUMBER,
            description: "Total estimated labor hours for the project.",
        },
        durationDays: {
            type: Type.NUMBER,
            description: "Estimated project duration in days, assuming a standard work day.",
        },
        totalMaterialCost: {
            type: Type.NUMBER,
            description: "The total estimated cost of all materials, in USD."
        },
        totalLaborCost: {
            type: Type.NUMBER,
            description: "The total estimated cost of labor, in USD."
        },
        totalJobCost: {
            type: Type.NUMBER,
            description: "The total estimated price for the job (materials + labor), in USD."
        }
    },
    required: ["analysis", "materials", "laborHours", "durationDays", "totalMaterialCost", "totalLaborCost", "totalJobCost"],
};


export const getEstimation = async (formData: EstimationFormData) => {
    const imagePart = await fileToGenerativePart(formData.jobSitePhoto);

    const prompt = `
You are "Caulk Boss Pro", an AI expert in concrete caulking estimation with 20 years of field experience. Your task is to analyze the provided job site photo and project details to generate a precise material, labor, and cost estimate. Be thorough and professional.

**Pricing Assumptions (Use these for all calculations):**
- **Labor Rate:** $75 per hour
- **Sealant Cost:** $12 per 32oz tube of self-leveling polyurethane sealant.
- **Backer Rod Cost:** $0.15 per linear foot.

**Project Details:**
- Client Name: ${formData.clientName}
- Total Linear Feet of Joints: ${formData.linearFeet}
- Joint Type: ${formData.jointType}
- Surface Material: ${formData.surfaceMaterial}

**Instructions:**
Based on the image and the project details, provide the following:
1.  **Site Analysis**: A detailed analysis of the job site from the photo. Identify concrete condition, joint type visible, and any potential issues like cracks, spalling, moisture, or old sealant that needs removal.
2.  **Material Estimate**: A list of required materials. **All caulk/sealant must be calculated in 32oz tubes.** Factor in waste (approx 10%).
3.  **Labor Estimate**: The total estimated labor hours, including prep, installation, and cleanup.
4.  **Project Duration**: The estimated project duration in days.
5.  **Cost Breakdown**:
    - Calculate the **Total Material Cost** based on the pricing assumptions above.
    - Calculate the **Total Labor Cost** based on the labor rate and estimated hours.
    - Calculate the **Total Job Cost** (materials + labor).

Return your complete response in the specified JSON format.
`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                imagePart,
                { text: prompt }
            ]
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: estimationResponseSchema,
        }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
};

const curingAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        advice: {
            type: Type.STRING,
            description: "Detailed advice on sealant application based on the weather. Mention optimal application windows and potential risks like rain washout or premature skinning from heat."
        },
        curingTime: {
            type: Type.STRING,
            description: "The estimated full cure time for a standard polyurethane sealant under the given conditions, in hours or days (e.g., '48-72 hours')."
        }
    },
    required: ["advice", "curingTime"]
};

export const getCuringAnalysis = async (job: Job, weather: { temp: number; humidity: number; chanceOfRain: number }): Promise<CuringAnalysisResult> => {
    const prompt = `
You are a senior chemical engineer specializing in industrial sealants for a major manufacturer.
A client needs advice for a concrete caulking job with the following conditions:
- Job: ${job.title}
- Surface Material: ${job.surfaceMaterial || 'Concrete'}
- Current Weather:
  - Temperature: ${weather.temp}°F
  - Humidity: ${weather.humidity}%
  - Chance of Rain (next 24h): ${weather.chanceOfRain}%

Based on these conditions, provide expert advice regarding the application and curing of a standard polyurethane concrete joint sealant.
Return your response in the specified JSON format.
`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: curingAnalysisSchema,
        }
    });
    
    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
};

const safetyBriefingSchema = {
    type: Type.OBJECT,
    properties: {
        briefingPoints: {
            type: Type.ARRAY,
            description: "A list of 5-7 critical, concise safety points for a morning toolbox talk.",
            items: { type: Type.STRING }
        }
    },
    required: ["briefingPoints"]
};

export const getSafetyBriefing = async (job: Job, weather: { temp: number; wind: number }): Promise<SafetyBriefingResult> => {
    const prompt = `
You are an OSHA-certified construction site safety officer. Your task is to generate a daily safety briefing ("toolbox talk") for a concrete caulking crew.

Job Details:
- Title: ${job.title}
- Description: ${job.description || 'Standard concrete joint caulking.'}
- Location: ${job.address}

Today's Weather Conditions:
- Temperature: ${weather.temp}°F
- Wind: ${weather.wind} mph

Generate a list of 5-7 critical, concise, and actionable safety points relevant to today's specific tasks and conditions.
Return your response in the specified JSON format.
`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: safetyBriefingSchema,
        }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
};