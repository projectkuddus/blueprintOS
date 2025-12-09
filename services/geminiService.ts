import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Project } from '../types';

// Initialize the API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateProjectAssistantResponse = async (
  query: string, 
  projectContext: Project | null
): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    
    let contextPrompt = "";
    
    if (projectContext) {
      const currentStageName = projectContext.stages.find(s => s.id === projectContext.currentStageId)?.name || "Unknown";
      
      // Calculate basic stats for context
      const teamSize = Object.keys(projectContext.team).length;
      const completedStages = projectContext.stages.filter(s => s.status === 'completed').length;
      const totalStages = projectContext.stages.length;

      contextPrompt = `
      SYSTEM INSTRUCTION:
      You are "BlueprintAI", the dedicated Project Guide for the architectural project "${projectContext.name}".
      
      YOUR KNOWLEDGE BASE:
      - Project Location: ${projectContext.location}
      - Budget: $${projectContext.budget.toLocaleString()} (You have access to the BOQ data).
      - Size: ${projectContext.squareFootage} sq ft.
      - Current Phase: ${currentStageName} (${completedStages}/${totalStages} stages complete).
      - Team: ${teamSize} members active.
      
      STRICT RULES:
      1. You are a PROJECT GUIDE. You ONLY answer questions related to THIS specific project, architectural processes, construction details, or team coordination.
      2. If a user asks about general topics (weather, sports, jokes) unrelated to construction or this project, politely REFUSE. Say: "I am restricted to project-related inquiries only."
      3. Assume you have access to all uploaded PDF/CAD files. If asked about specific pricing/BOQ, answer confidently based on the project budget provided above.
      4. Be concise, professional, and confident. Use architectural terminology.
      `;
    } else {
      contextPrompt = "You are BlueprintAI. You are currently not inside a specific project context. Ask the user to open a project first.";
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: [
        { role: 'user', parts: [{ text: contextPrompt }] },
        { role: 'user', parts: [{ text: query }] }
      ],
      config: {
        systemInstruction: "You are a specialized Architectural Project Assistant. Stick strictly to the project context.",
      }
    });

    return response.text || "I apologize, I couldn't generate a response at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "An error occurred while communicating with the AI assistant. Please check your API key.";
  }
};

export const generateStageSummary = async (stageName: string, project: Project): Promise<string> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a concise checklist (max 5 items) and a brief risk assessment for the "${stageName}" stage of a project named "${project.name}" located in ${project.location}.`,
    });
    return response.text || "Could not generate summary.";
  } catch (error) {
    return "Analysis unavailable.";
  }
}