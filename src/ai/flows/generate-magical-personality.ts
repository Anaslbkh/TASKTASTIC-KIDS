"use server";
/**
 * @fileOverview This file defines a function to generate a magical personality for the child based on the tasks they've completed, using the GoogleGenAI library directly.
 *
 * - generateMagicalPersonality - A function that generates a magical personality.
 * - GenerateMagicalPersonalityInput - The input type for the generateMagicalPersonality function.
 * - GenerateMagicalPersonalityOutput - The return type for the generateMagicalPersonality function.
 */

import { ai } from "@/ai/ai-instance";

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
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
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
  if (trimmedText.startsWith("{") && trimmedText.endsWith("}")) {
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
  const tasksList = tasks.map((task) => `- ${task}`).join("\n");
  return `You are a playful and imaginative assistant that creates magical characters for children based on the tasks they’ve completed today.

Analyze the list of tasks below and craft a unique magical personality that feels fun, inspiring, and rewarding for the child.

Each magical personality must include:
- A whimsical and memorable **name**
- A **short description** (max 5 words) describing the character’s traits or powers
- A richly detailed **imagePrompt** that inspires a colorful, high-quality 3D illustration of the character

Tasks completed:
${tasksList}

Make the magical personality reflect the nature of the tasks (e.g., cleaning, helping, reading), and include fantasy elements like sparkles, wings, magical gadgets, animal companions, or enchanted outfits.

The image prompt should be full of creativity and color, suitable for a children’s magical universe.

Respond ONLY with a JSON object using the keys "name", "description", and "imagePrompt". Do not include any extra text.

Example Output:
{
  "name": "Captain Sparkle",
  "description": "Kind, brave, full of energy",
  "imagePrompt": "A vibrant 3D illustration of a cheerful child superhero wearing a glittering cape, colorful boots, and a glowing heart emblem. The character is floating above a magical landscape with sparkles in the air. Bright, playful cartoon style."
}
`;
};

export async function generateMagicalPersonality(
  input: GenerateMagicalPersonalityInput
): Promise<GenerateMagicalPersonalityOutput> {
  try {
    console.log(
      `generateMagicalPersonality: Generating personality for tasks: ${input.tasks.join(
        ", "
      )}`
    );

    const promptContent = getMagicalPersonalityPromptContent(input.tasks);

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: promptContent,
    });

    if (
      !response.candidates ||
      response.candidates.length === 0 ||
      !response.candidates[0].content
    ) {
      console.error(
        "Magical personality generation returned no candidates or content."
      );
      return {
        name: "Mysterious Helper",
        description: "Details forming...",
        imagePrompt:
          "A gentle glowing orb of light, representing a story yet to be told.",
      };
    }

    const rawModelText = response.candidates[0].content.parts[0]?.text;

    if (!rawModelText) {
      console.error(
        "Magical personality generation returned no text in model response."
      );
      return {
        name: "Silent Storyteller",
        description: "Words are awakening...",
        imagePrompt:
          "A softly glowing book with pages turning, suggesting a magical personality about to be revealed.",
      };
    }

    console.log("Raw model response for magical personality:", rawModelText);
    const jsonTextToParse = extractJsonContent(rawModelText);

    if (!jsonTextToParse) {
      console.error(
        "Could not extract valid JSON content from model response for magical personality. Raw text was:",
        rawModelText
      );
      return {
        name: "Enigmatic Friend",
        description: "Character is shy.",
        imagePrompt:
          "A playful silhouette peeking from behind a sparkling curtain, hinting at a fun personality.",
      };
    }

    try {
      const personalityDetails: GenerateMagicalPersonalityOutput =
        JSON.parse(jsonTextToParse);
      console.log(
        "Successfully parsed magical personality details:",
        personalityDetails
      );

      if (
        !personalityDetails.name ||
        typeof personalityDetails.name !== "string" ||
        !personalityDetails.description ||
        typeof personalityDetails.description !== "string" ||
        !personalityDetails.imagePrompt ||
        typeof personalityDetails.imagePrompt !== "string"
      ) {
        console.warn(
          "Parsed JSON for magical personality missing required fields or fields have incorrect types. Parsed data:",
          personalityDetails,
          "Extracted JSON was:",
          jsonTextToParse
        );
        return {
          name: personalityDetails.name || "Dream Weaver",
          description: personalityDetails.description || "Crafting wonders...",
          imagePrompt:
            personalityDetails.imagePrompt ||
            "A colorful swirl of magic dust forming a friendly shape.",
        };
      }

      return personalityDetails;
    } catch (jsonError) {
      console.error(
        "Failed to parse extracted JSON for magical personality:",
        jsonError,
        "Extracted text was:",
        jsonTextToParse,
        "Original raw text was:",
        rawModelText
      );
      return {
        name: "Whispering Spirit",
        description: "Response unclear.",
        imagePrompt:
          "A faint shimmering outline of a friendly magical creature in a soft, dreamy style.",
      };
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unknown error occurred during personality generation.";
    console.error(
      "Error in generateMagicalPersonality main catch block. Tasks:",
      input.tasks.join(", "),
      "Error:",
      error
    );
    return {
      name: "Unknown Entity",
      description: "Error occurred.",
      imagePrompt:
        "A swirling void of cosmic dust, with a hint of a friendly face, in a mysterious but not scary style.",
    };
  }
}
