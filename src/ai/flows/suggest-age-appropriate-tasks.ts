"use server";
/**
 * @fileOverview This file defines a function to suggest age-appropriate tasks for children,
 * using the GoogleGenAI library directly.
 *
 * - suggestAgeAppropriateTasks - A function that suggests tasks based on age.
 * - SuggestAgeAppropriateTasksInput - The input type for the suggestAgeAppropriateTasks function.
 * - SuggestAgeAppropriateTasksOutput - The return type for the suggestAgeAppropriateTasks function.
 */

import { ai } from "@/ai/ai-instance";
// No longer need genkit or z for schema definition here, using TypeScript interfaces.
import { checkAgeAppropriateness } from "@/services/age-appropriateness";

export interface SuggestAgeAppropriateTasksInput {
  age: number;
}

export interface SuggestAgeAppropriateTasksOutput {
  tasks: string[];
}

// Directly define the prompt content similar to the original Genkit prompt template
const getSuggestTasksPromptContent = (age: number) => {
  return `You are a creative and thoughtful assistant who provides fun, educational, and age-appropriate tasks for kids.

Your job is to suggest **5 unique daily tasks** that are:
- Suitable for a child who is ${age} years old.
- Easy to do alone or with very little adult help.
- Friendly, fun, and rewarding for kids.
- A mix of helpful, creative, and learning activities.
- Related to **seasons** (e.g., summer, winter, holidays), **culture**, **technology**, or **general life skills** — but always kid-appropriate and engaging.

No boring chores unless they feel fun or game-like! Be playful and seasonal when possible.

Respond ONLY with a JSON array of 5 task strings. No additional explanation or formatting.

Example Output:
[
  "Build a summer fort with pillows and blankets",
  "Water your favorite plant and check how it's growing",
  "Draw a winter holiday card for someone you love",
  "Organize your toy shelf like a little store",
  "Try a fun typing game for 10 minutes"
]
`;
};
// This function is responsible for suggesting age-appropriate tasks based on the child's age.
// It uses the GoogleGenAI library to generate content and checks for age appropriateness.
// The function is designed to be robust, handling various edge cases and ensuring the output is valid.
// It also includes error handling and logging for better debugging and understanding of the process.
// The function is asynchronous and returns a promise with the suggested tasks.
// The function is designed to be used in a server-side context, as indicated by the "use server" directive at the top.
// The function is expected to be called with an input object containing the child's age.
// The output is an object containing an array of suggested tasks.

export async function suggestAgeAppropriateTasks(
  input: SuggestAgeAppropriateTasksInput
): Promise<SuggestAgeAppropriateTasksOutput> {
  try {
    console.log(
      `suggestAgeAppropriateTasks: Suggesting tasks for age: ${input.age}`
    );

    const promptContent = getSuggestTasksPromptContent(input.age);

    // Use the direct GoogleGenAI instance for text generation
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
        "Suggest age appropriate tasks returned no candidates or content."
      );
      // Return a default or error state
      return { tasks: [] };
    }

    let text: string | undefined = undefined;
    if (
      response.candidates[0].content &&
      response.candidates[0].content.parts &&
      response.candidates[0].content.parts.length > 0
    ) {
      text = response.candidates[0].content.parts[0]?.text;
    }

    if (!text) {
      console.error("Suggest age appropriate tasks returned no text.");
      return { tasks: [] };
    }

    console.log("Raw text response:", text);

    // Attempt to parse the JSON array output from the model
    let suggestedTasks: string[] = [];
    try {
      // Clean the text: remove potential markdown backticks for JSON block
      const cleanText = text.replace(/^```json\s*|\s*```$/g, "").trim();
      suggestedTasks = JSON.parse(cleanText);

      if (!Array.isArray(suggestedTasks)) {
        console.warn(
          "Parsed output is not an array, using empty array.",
          suggestedTasks
        );
        suggestedTasks = [];
      } else {
        // Ensure all items in the array are strings, filter out any non-string elements
        suggestedTasks = suggestedTasks.filter(
          (task) => typeof task === "string"
        );
      }

      console.log("Parsed suggested tasks:", suggestedTasks);
    } catch (jsonError) {
      console.error(
        "Failed to parse JSON array from model response:",
        jsonError,
        "Raw text:",
        text
      );
      // Fallback if JSON parsing fails
      suggestedTasks = [];
    }

    // Refine the tasks by checking age appropriateness using the service.
    const ageRange = { min: input.age, max: input.age };
    const refinedTasks: string[] = [];

    for (const task of suggestedTasks) {
      // Ensure task is a string before checking appropriateness (already filtered above, but good for safety)
      if (typeof task === "string") {
        const appropriatenessResult = await checkAgeAppropriateness(
          task,
          ageRange
        );
        if (appropriatenessResult.isAppropriate) {
          refinedTasks.push(task);
        }
      } else {
        console.warn("Skipping non-string task found in array:", task);
      }
    }

    // Ensure that the refinedTasks array contains a maximum of 5 tasks.
    const limitedTasks = refinedTasks.slice(0, 5);

    return { tasks: limitedTasks };
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unknown error occurred during task suggestion.";
    console.error("Error in suggestAgeAppropriateTasks.", "Error:", error);
    return { tasks: [] };
  }
}
