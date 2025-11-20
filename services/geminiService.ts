import { GoogleGenAI, Modality } from "@google/genai";
import { RestorationRequest } from "../types";

const apiKey = process.env.API_KEY;
// Note: In a real production app, ensure environment variables are handled securely.
// Here we assume process.env.API_KEY is injected by the environment.

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export const restoreImage = async (request: RestorationRequest): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  try {
    // Using gemini-2.5-flash-image as per guidelines for Image Editing/Generation
    const modelId = 'gemini-2.5-flash-image';

    // Clean base64 string if it has a data prefix
    const cleanBase64 = request.imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: request.mimeType,
            },
          },
          {
            text: request.prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      const parts = candidates[0].content.parts;
      // Search for the image part in the response
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
           return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("No image data returned from the model.");

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to restore image.");
  }
};