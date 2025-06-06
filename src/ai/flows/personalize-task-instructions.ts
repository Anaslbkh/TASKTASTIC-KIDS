"use server";
/**
 * @fileOverview A function for providing personalized, detailed instructions for a task,
 * incorporating positive reinforcement and adapting to the child's background and requirements,
 * using the GoogleGenAI library directly.
 *
 * - personalizeTaskInstructions - A function that handles the task personalization process.
 * - PersonalizeTaskInstructionsInput - The input type for the personalizeTaskInstructions function.
 * - PersonalizeTaskInstructionsOutput - The return type for the personalizeTaskInstructions function.
 */

import { ai } from "@/ai/ai-instance";

export interface PersonalizeTaskInstructionsInput {
  task: string;
  childBackground: string;
  requirements?: string;
}

export interface PersonalizeTaskInstructionsOutput {
  steps: Array<{
    instruction: string;
    encouragement: string;
  }>;
}

// Helper function to extract JSON content from a string
function extractJsonContent(text: string): string | null {
  // First, try to find a ```json ... ``` block
  const markdownMatch = text.match(/```json\s*([\s\S]+?)\s*```/);
  if (markdownMatch && markdownMatch[1]) {
    return markdownMatch[1].trim();
  }

  // If no markdown block, try to find the first '{' and last '}' or first '[' and last ']'
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

  const firstBracket = text.indexOf("[");
  const lastBracket = text.lastIndexOf("]");
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    const potentialJson = text.substring(firstBracket, lastBracket + 1);
    try {
      JSON.parse(potentialJson);
      return potentialJson;
    } catch (e) {
      // Not valid JSON, continue
    }
  }

  // If all else fails, check if the trimmed text itself is a JSON object or array
  const trimmedText = text.trim();
  if (
    (trimmedText.startsWith("{") && trimmedText.endsWith("}")) ||
    (trimmedText.startsWith("[") && trimmedText.endsWith("]"))
  ) {
    try {
      JSON.parse(trimmedText);
      return trimmedText;
    } catch (e) {
      // Not valid JSON
    }
  }

  return null;
}

const getPersonalizeTaskInstructionsPromptContent = (
  input: PersonalizeTaskInstructionsInput
) => {
  const requirementsText = input.requirements
    ? `Requirements: ${input.requirements}`
    : "";
  return `You are a friendly expert in writing simple, personalized step-by-step instructions for children.

Your job is to take the task below and break it down into **short, easy-to-understand steps**. Use **simple words** and **brief sentences** that even young kids can follow. Each step should feel friendly and clear — like a fun helper is guiding them.

Every step must also include a short and cheerful **encouragement** message that keeps the child feeling motivated and proud.

Keep the tone playful, kind, and positive. Avoid long explanations. Be helpful and fun!

Task: ${input.task}
Child's Background: ${input.childBackground}
${requirementsText}

Output should be in this exact JSON format:
Respond ONLY with a JSON object containing a single key "steps", which is an array of objects with keys "instruction" and "encouragement".

Example Output:
{
  "steps": [
    {
      "instruction": "First, wash your hands!",
      "encouragement": "Nice start! Clean and ready!"
    },
    {
      "instruction": "Grab two slices of bread.",
      "encouragement": "Awesome! You got it!"
    },
    {
      "instruction": "Spread jam on one slice.",
      "encouragement": "Yummy! Looking great!"
    },
    {
      "instruction": "Put the other slice on top.",
      "encouragement": "Almost done!"
    },
    {
      "instruction": "Yay! You made a sandwich!",
      "encouragement": "You're amazing! Enjoy it!"
    }
  ]
}
`;
};

export async function personalizeTaskInstructions(
  input: PersonalizeTaskInstructionsInput
): Promise<PersonalizeTaskInstructionsOutput> {
  try {
    console.log(
      `personalizeTaskInstructions: Personalizing instructions for task: "${input.task}"`
    );

    const promptContent = getPersonalizeTaskInstructionsPromptContent(input);

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
        "Personalize task instructions returned no candidates or content."
      );
      return {
        steps: [
          {
            instruction: "Could not generate instructions at this time.",
            encouragement: "Please try again!",
          },
        ],
      };
    }

    let rawModelText: string | undefined = undefined;
    if (
      response.candidates[0].content &&
      response.candidates[0].content.parts &&
      response.candidates[0].content.parts.length > 0
    ) {
      rawModelText = response.candidates[0].content.parts[0]?.text;
    }

    if (!rawModelText) {
      console.error(
        "Personalize task instructions returned no text in model response."
      );
      return {
        steps: [
          {
            instruction:
              "The helper seems to be quiet, no instructions received.",
            encouragement: "Let's try asking again!",
          },
        ],
      };
    }

    console.log("Raw model response for task instructions:", rawModelText);
    const jsonTextToParse = extractJsonContent(rawModelText);

    if (!jsonTextToParse) {
      console.error(
        "Could not extract valid JSON content from model response for task instructions. Raw text was:",
        rawModelText
      );
      return {
        steps: [
          {
            instruction: "The instructions are a bit muddled right now.",
            encouragement: "Maybe one more try?",
          },
        ],
      };
    }

    try {
      const parsedOutput: PersonalizeTaskInstructionsOutput =
        JSON.parse(jsonTextToParse);
      console.log("Successfully parsed task instructions:", parsedOutput);

      if (
        !parsedOutput.steps ||
        !Array.isArray(parsedOutput.steps) ||
        parsedOutput.steps.some(
          (step) =>
            typeof step.instruction !== "string" ||
            typeof step.encouragement !== "string"
        )
      ) {
        console.warn(
          "Parsed JSON for task instructions has incorrect structure or missing 'steps' array. Parsed data:",
          parsedOutput,
          "Extracted JSON was:",
          jsonTextToParse
        );
        return {
          steps: [
            {
              instruction: "The instruction steps look a bit unusual.",
              encouragement: "Let's try to get clearer ones!",
            },
          ],
        };
      }

      return parsedOutput;
    } catch (jsonError) {
      console.error(
        "Failed to parse extracted JSON for task instructions:",
        jsonError,
        "Extracted text was:",
        jsonTextToParse,
        "Original raw text was:",
        rawModelText
      );
      return {
        steps: [
          {
            instruction: "Failed to process the instructions clearly.",
            encouragement: "Give it another go!",
          },
        ],
      };
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unknown error occurred during task personalization.";
    console.error(
      "Error in personalizeTaskInstructions main catch block. Task:",
      input.task,
      "Error:",
      error
    );
    return {
      steps: [
        {
          instruction: `Oops! An error occurred: ${errorMessage.substring(
            0,
            100
          )}...`,
          encouragement: "Don't worry, we can try again!",
        },
      ],
    };
  }
}
