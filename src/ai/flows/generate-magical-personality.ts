'use server';
/**
 * @fileOverview This file defines a function to generate a magical personality for the child based on the tasks they've completed, using the GoogleGenAI library directly.
 *
 * - generateMagicalPersonality - A function that generates a magical personality.
 * - GenerateMagicalPersonalityInput - The input type for the generateMagicalPersonality function.
 * - GenerateMagicalPersonalityOutput - The return type for the generateMagicalPersonality function.
 */

import { ai } from '@/ai/ai-instance';

export interface GenerateMagicalPersonalityInput {
  tasks: string[];
}

export interface GenerateMagicalPersonalityOutput {
  name: string;
  description: string;
  imagePrompt: string;
}

// Helper function to extract JSON content from a string
function extractJsonContent(text: string): string | null {
  // First, try to find a ```json ... ``` block
  const markdownMatch = text.match(/```json\s*([\s\S]+?)\s*```/);
  if (markdownMatch && markdownMatch[1]) {
    return markdownMatch[1].trim();
  }

  // If no markdown block, try to find the first '{' and last '}'
  // This is specific to this flow expecting an object.
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const potentialJson = text.substring(firstBrace, lastBrace + 1);
    try {
      JSON.parse(potentialJson);
      return potentialJson;
    } catch (e) {
      // Not valid JSON, continue
    }
  }
  
  // If all else fails, check if the trimmed text itself is a JSON object
  const trimmedText = text.trim();
  if (trimmedText.startsWith('{') && trimmedText.endsWith('}')) {
     try {
      JSON.parse(trimmedText);
      return trimmedText;
    } catch (e) {
      // Not valid JSON
    }
  }

  return null;
}


const getMagicalPersonalityPromptContent = (tasks: string[]) => {
  const tasksList = tasks.map(task => `- ${task}`).join('\n');
  return `You are a creative assistant that helps generate a magical personality for children based on the tasks they accomplished during the day.

  Analyze the following tasks and create a unique and fun magical personality.
  Include a name, a short description (5 words max), and a prompt to generate a creative and engaging image to represent the personality.

  Tasks completed:
${tasksList}

  Ensure that the image prompt is detailed, non-empty, and suitable for generating a high-quality 3D illustration of the magical personality.
  Respond ONLY with a JSON object containing the keys "name", "description", and "imagePrompt". Do not include any text before or after the JSON object.
  Example Output:
  {
    "name": "Captain Sparkle",
    "description": "Kind, brave, and full energy!",
    "imagePrompt": "A whimsical 3D illustration of a cute child superhero with a shimmering sparkle cape, a confident smile, standing bravely. The style should be bright and playful."
  }
  `;
};

export async function generateMagicalPersonality(
  input: GenerateMagicalPersonalityInput
): Promise<GenerateMagicalPersonalityOutput> {
  try {
    console.log(`generateMagicalPersonality: Generating personality for tasks: ${input.tasks.join(', ')}`);

    const promptContent = getMagicalPersonalityPromptContent(input.tasks);

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash', 
      contents: promptContent,
    });

    if (!response.candidates || response.candidates.length === 0 || !response.candidates[0].content) {
        console.error("Magical personality generation returned no candidates or content.");
        return { 
            name: "Mysterious Helper", 
            description: "Details forming...", 
            imagePrompt: "A gentle glowing orb of light, representing a story yet to be told." 
        };
    }
    
    const rawModelText = response.candidates[0].content.parts[0]?.text;

    if (!rawModelText) {
        console.error("Magical personality generation returned no text in model response.");
         return { 
            name: "Silent Storyteller", 
            description: "Words are awakening...", 
            imagePrompt: "A softly glowing book with pages turning, suggesting a magical personality about to be revealed." 
        };
    }

    console.log("Raw model response for magical personality:", rawModelText);
    const jsonTextToParse = extractJsonContent(rawModelText);

    if (!jsonTextToParse) {
      console.error("Could not extract valid JSON content from model response for magical personality. Raw text was:", rawModelText);
      return { 
          name: "Enigmatic Friend", 
          description: "Character is shy.", 
          imagePrompt: "A playful silhouette peeking from behind a sparkling curtain, hinting at a fun personality." 
      };
    }
    
    try {
        const personalityDetails: GenerateMagicalPersonalityOutput = JSON.parse(jsonTextToParse);
        console.log("Successfully parsed magical personality details:", personalityDetails);
        
        if (
            !personalityDetails.name || typeof personalityDetails.name !== 'string' ||
            !personalityDetails.description || typeof personalityDetails.description !== 'string' ||
            !personalityDetails.imagePrompt || typeof personalityDetails.imagePrompt !== 'string'
           ) {
             console.warn("Parsed JSON for magical personality missing required fields or fields have incorrect types. Parsed data:", personalityDetails, "Extracted JSON was:", jsonTextToParse);
             return { 
                name: personalityDetails.name || "Dream Weaver", 
                description: personalityDetails.description || "Crafting wonders...", 
                imagePrompt: personalityDetails.imagePrompt || "A colorful swirl of magic dust forming a friendly shape." 
            };
        }

        return personalityDetails;

    } catch (jsonError) {
        console.error("Failed to parse extracted JSON for magical personality:", jsonError, "Extracted text was:", jsonTextToParse, "Original raw text was:", rawModelText);
        return { 
            name: "Whispering Spirit", 
            description: "Response unclear.", 
            imagePrompt: "A faint shimmering outline of a friendly magical creature in a soft, dreamy style." 
        };
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during personality generation.';
    console.error('Error in generateMagicalPersonality main catch block. Tasks:', input.tasks.join(', '), 'Error:', error);
    return { 
        name: "Unknown Entity", 
        description: "Error occurred.", 
        imagePrompt: "A swirling void of cosmic dust, with a hint of a friendly face, in a mysterious but not scary style." 
    };
  }
}
