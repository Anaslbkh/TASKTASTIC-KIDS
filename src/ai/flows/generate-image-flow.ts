'use server';
/**
 * @fileOverview A function to generate an image from a text prompt using the GoogleGenAI library directly.
 *
 * - generateImageFromPrompt - A function that generates an image.
 * - GenerateImageInput - The input type for the generateImageFromPrompt function.
 * - GenerateImageOutput - The return type for the generateImageFromPrompt function.
 */

import { ai } from '@/ai/ai-instance';
import { Modality } from '@google/genai';

// Define input and output types (can be kept from Genkit flow if suitable)
export interface GenerateImageInput {
  prompt: string;
}

export interface GenerateImageOutput {
  imageUrl: string | null;
  error: string | null;
}

export async function generateImageFromPrompt(input: GenerateImageInput): Promise<GenerateImageOutput> {
  try {
    console.log(`generateImageFromPrompt: Generating image for prompt: "${input.prompt}"`);

    // Use the direct GoogleGenAI instance
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-preview-image-generation', // Use the image generation model
      contents: input.prompt,
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE], // Request both text and image
      },
    });

    let imageUrl: string | null = null;
    let textResponse: string | null = null;

    // Process the response parts
    if (response.candidates && response.candidates.length > 0) {
      for (const part of response.candidates[0].content.parts) {
        if (part.text) {
          textResponse = part.text;
          console.log('generateImageFromPrompt: Received text part:', textResponse.substring(0, 100) + "...");
        } else if (part.inlineData) {
          // Found image data, create a data URI
          imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          console.log('generateImageFromPrompt: Successfully generated image data URI.');
        }
      }
    }

    if (imageUrl) {
      return { imageUrl, error: null };
    } else {
      const warningMessage = textResponse 
        ? `Image generation did not return a media URL. Text response received: ${textResponse.substring(0, 200)}...` 
        : 'Image generation did not return a media URL or text. The model might have refused the prompt (e.g., due to safety filters) or encountered an issue.';
      console.warn('generateImageFromPrompt:', warningMessage, 'Prompt was:', input.prompt);
      return { imageUrl: null, error: warningMessage };
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during image generation.';
    console.error('Error in generateImageFromPrompt. Prompt was:', input.prompt, 'Error:', error);
    return { imageUrl: null, error: `Image generation process failed: ${errorMessage}` };
  }
}
