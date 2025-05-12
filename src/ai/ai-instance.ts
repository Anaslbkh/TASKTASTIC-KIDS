import { GoogleGenAI } from "@google/genai";

// Initialize the GoogleGenAI client directly
// Ensure GOOGLE_GENAI_API_KEY is set in your environment variables
export const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY || "" });
