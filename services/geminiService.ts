import { GoogleGenAI, Type, Chat } from "@google/genai";
import { AiQuestion, QuestionType, AiLearningPlan, KnowledgeNode } from "../types";

// NOTE: In a real app, use import.meta.env.VITE_GEMINI_API_KEY
// For this generated code, we assume process.env.API_KEY is available or injected.
const API_KEY = process.env.API_KEY || ''; 

const ai = new GoogleGenAI({ apiKey: API_KEY });

// --- Q&A Chat Service ---

export interface ChatResponse {
  type: QuestionType;
  answer: string;
  steps: string[];
  knowledge: string[];
}

export const createSolverChat = (): Chat => {
  if (!API_KEY) throw new Error("API Key is missing.");

  return ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: `
        You are an expert academic tutor for university students.
        Analyze the user's question or follow-up question.
        1. Identify the subject/type.
        2. Provide a direct answer.
        3. Provide step-by-step detailed explanation.
        4. List relevant knowledge points.
        
        If the user asks a follow-up (e.g., "Why step 2?"), explain it in the context of the previous problem.
        ALWAYS return the response in strict JSON format as defined by the schema.
      `,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, enum: ["Mathematics", "Programming", "Translation", "General"] },
          answer: { type: Type.STRING },
          steps: { type: Type.ARRAY, items: { type: Type.STRING } },
          knowledge: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });
};

export const sendChatMessage = async (chat: Chat, text: string, imageBase64?: string): Promise<ChatResponse> => {
  const parts: any[] = [];
  
  if (imageBase64) {
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: imageBase64
      }
    });
  }
  
  parts.push({ text: text });

  try {
    const response = await chat.sendMessage({
      parts: parts
    });

    const result = JSON.parse(response.text || "{}");
    return {
      type: result.type as QuestionType || QuestionType.GENERAL,
      answer: result.answer || "I could not generate an answer.",
      steps: result.steps || [],
      knowledge: result.knowledge || []
    };
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    throw new Error("Failed to get response from AI.");
  }
};

// --- Study Plan Service ---

export const generateStudyPlan = async (goal: string, currentLevel: string, durationDays: number): Promise<AiLearningPlan> => {
  if (!API_KEY) throw new Error("API Key missing");

  const model = "gemini-2.5-flash";
  const prompt = `
    Create a study plan for a student.
    Goal: ${goal}
    Current Level: ${currentLevel}
    Duration: ${durationDays} days.
    
    Return a JSON object with a list of daily tasks.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
            dailyTasks: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        day: { type: Type.STRING },
                        topics: { type: Type.ARRAY, items: { type: Type.STRING }},
                        completed: { type: Type.BOOLEAN }
                    }
                }
            }
        }
      }
    }
  });

  const data = JSON.parse(response.text || "{}");
  
  return {
    id: Date.now().toString(),
    userId: 'user-1',
    goal,
    currentLevel,
    startDate: Date.now(),
    endDate: Date.now() + (durationDays * 86400000),
    progress: 0,
    dailyTasks: data.dailyTasks || []
  };
};

// --- Knowledge Map Service ---

export const generateKnowledgeTree = async (subject: string): Promise<KnowledgeNode> => {
    if (!API_KEY) throw new Error("API Key missing");

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Create a hierarchical knowledge structure (mind map) for the subject: "${subject}". Depth should be 3 levels.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    children: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                children: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            name: { type: Type.STRING }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    return JSON.parse(response.text || "{}") as KnowledgeNode;
}

// --- Resource Recommendation ---

export const recommendResources = async (query: string): Promise<any[]> => {
    if (!API_KEY) return [];
    
    // Using search grounding to find real resources
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Recommend 4 high-quality online learning resources (books, videos, or websites) for: ${query}. 
        Return JSON with title, type, description, and a dummy URL if specific URL is unknown.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        type: { type: Type.STRING, enum: ["Video", "Book", "Article"] },
                        description: { type: Type.STRING },
                        url: { type: Type.STRING }
                    }
                }
            }
        }
    });
    
    return JSON.parse(response.text || "[]");
}