import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateEducationalContent(prompt: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "দুঃখিত, কোনো তথ্য পাওয়া যায়নি।";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "একটি ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।";
  }
}

export async function generateMCQs(className: string, subject: string) {
  try {
    const prompt = `Generate 30 multiple choice questions for ${className} in ${subject} subject based on Bangladesh Board Exam standards. 
    Language: Bengali.
    Format as JSON array of objects.
    Each object: { "question": string, "options": string[], "correctIndex": number, "hint": string }.
    Ensure correctIndex is 0-3.
    The questions should be important for exams.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING } 
              },
              correctIndex: { type: Type.INTEGER },
              hint: { type: Type.STRING }
            },
            required: ["question", "options", "correctIndex", "hint"]
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("MCQ Generation Error:", error);
    return [];
  }
}
