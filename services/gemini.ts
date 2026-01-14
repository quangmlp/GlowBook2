import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ChatMessage, HairRecommendation } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to get a style consultation
export const getStyleAdvice = async (
  userQuery: string, 
  history: ChatMessage[]
): Promise<string> => {
  if (!apiKey) return "Please configure your API Key to use the AI Stylist.";

  try {
    const model = 'gemini-3-flash-preview';
    
    // Construct a simple history context string
    const conversationContext = history
      .map(msg => `${msg.role === 'user' ? 'User' : 'Stylist'}: ${msg.text}`)
      .join('\n');

    const prompt = `
      You are an expert beauty and wellness consultant for "GlowBook", a salon booking app.
      Your tone is trendy, professional, and helpful.
      
      Conversation History:
      ${conversationContext}
      
      User's latest question: ${userQuery}
      
      Provide a short, helpful recommendation (max 100 words). If they ask for a specific look, suggest what kind of service they should book (e.g., "Balayage", "Deep Tissue Massage", "Gel Manicure").
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "I'm having trouble thinking of a style right now. Try again?";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I am currently overloaded. Please try again in a minute.";
  }
};

// Helper to generate a creative description for a salon based on its name and category
export const generateSalonDescription = async (name: string, category: string): Promise<string> => {
    if (!apiKey) return "A top-rated salon for your needs.";
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Write a catchy, 1-sentence marketing description for a ${category} called "${name}".`
        });
        return response.text || `Experience the best at ${name}.`;
    } catch (e) {
        return `Experience the best at ${name}.`;
    }
}

// Analyze face shape from image and recommend styles based on event
export const analyzeFaceAndRecommend = async (base64Image: string, eventContext: string): Promise<HairRecommendation | null> => {
  if (!apiKey) return null;

  try {
    // Remove header if present (e.g., "data:image/jpeg;base64,")
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    const prompt = `
      Analyze the face shape of the person in this image. 
      Based on their face shape and the following event context: "${eventContext}", 
      recommend 3 distinct hairstyles.

      Return the response in strictly valid JSON format with this schema:
      {
        "faceShape": "String (e.g., Oval, Square, Round)",
        "analysis": "Short explanation of their face features",
        "styles": [
          {
            "name": "Name of hairstyle",
            "description": "Visual description",
            "reasoning": "Why it suits the face and event"
          }
        ]
      }
      Do not include markdown formatting like \`\`\`json. Just the raw JSON string.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png', // Assuming PNG from canvas
              data: cleanBase64
            }
          },
          { text: prompt }
        ]
      }
    });

    const text = response.text || '';
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(cleanText) as HairRecommendation;

  } catch (error) {
    console.error("Gemini Vision Error:", error);
    return null;
  }
}

// Generate a visual preview of the hairstyle on the user's image
export const generateHairstylePreview = async (base64Image: string, styleName: string, description: string): Promise<string | null> => {
    if (!apiKey) return null;

    try {
        const cleanBase64 = base64Image.split(',')[1] || base64Image;
        
        // Use gemini-2.5-flash-image for editing/in-painting tasks
        const prompt = `Change the person's hairstyle to ${styleName} (${description}). Keep the face facial features exactly the same, only change the hair. Photorealistic, high quality.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: 'image/png',
                            data: cleanBase64
                        }
                    },
                    { text: prompt }
                ]
            }
        });

        if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                }
            }
        }
        
        return null;
    } catch (error) {
        console.error("Gemini Image Gen Error:", error);
        
        // Fallback for Demo/Free Tier Quota limits
        // If the API fails, return a representative stock image based on the style name
        // so the user experience isn't broken.
        return getFallbackImage(styleName);
    }
}

function getFallbackImage(styleName: string): string {
    const lower = styleName.toLowerCase();
    if (lower.includes('bob') || lower.includes('short')) return 'https://images.unsplash.com/photo-1620331311520-246422fd82f9?auto=format&fit=crop&q=80&w=600'; 
    if (lower.includes('curl') || lower.includes('wavy')) return 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&q=80&w=600';
    if (lower.includes('bangs') || lower.includes('fringe')) return 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=600';
    if (lower.includes('straight') || lower.includes('long')) return 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&q=80&w=600';
    if (lower.includes('braid')) return 'https://images.unsplash.com/photo-1595476108692-38d707d90343?auto=format&fit=crop&q=80&w=600';
    if (lower.includes('pixie')) return 'https://images.unsplash.com/photo-1596436665042-8353e66046e7?auto=format&fit=crop&q=80&w=600';
    
    // Default fallback
    return 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600';
}