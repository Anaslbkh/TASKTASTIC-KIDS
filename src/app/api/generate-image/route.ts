import { NextResponse } from 'next/server';
import { generateImageFromPrompt } from '@/ai/flows/generate-image-flow';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ imageUrl: null, error: 'Prompt is required' }, { status: 400 });
    }

    const result = await generateImageFromPrompt({ prompt });

    if (result.imageUrl) {
      // Successfully generated image
      return NextResponse.json({ imageUrl: result.imageUrl, error: null }, { status: 200 });
    } else {
      // Image generation failed, but the flow handled it (e.g. model refusal, caught error)
      // result.error should contain details from the flow.
      const errorMessage = result.error || 'The image could not be generated for the provided prompt, and no specific reason was given.';
      console.warn('Image generation failed via Genkit flow. Prompt:', prompt, 'Details:', errorMessage);
      return NextResponse.json(
        { imageUrl: null, error: errorMessage },
        { status: 200 } // Return 200 OK, client will check imageUrl and error fields
      );
    }
  } catch (error) {
    // Catch truly unexpected errors in the API route itself
    console.error("Critical error in /api/generate-image endpoint:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown internal server error occurred during image generation.';
    return NextResponse.json({ imageUrl: null, error: `API Error: ${errorMessage}` }, { status: 500 });
  }
}
