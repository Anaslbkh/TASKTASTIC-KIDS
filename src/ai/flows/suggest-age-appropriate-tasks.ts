

'use server';
/**
 * @fileOverview This file defines a function to suggest age-appropriate tasks for children,
 * using the GoogleGenAI library directly.
 *
 * - suggestAgeAppropriateTasks - A function that suggests tasks based on age.
 * - SuggestAgeAppropriateTasksInput - The input type for the suggestAgeAppropriateTasks function.
 * - SuggestAgeAppropriateTasksOutput - The return type for the suggestAgeAppropriateTasks function.
 */

import { ai } from '@/ai/ai-instance';
// No longer need genkit or z for schema definition here, using TypeScript interfaces.
import { checkAgeAppropriateness } from '@/services/age-appropriateness';

export interface SuggestAgeAppropriateTasksInput {
  age: number;
}

export interface SuggestAgeAppropriateTasksOutput {
  tasks: string[];
}

// Directly define the prompt content similar to the original Genkit prompt template
const getSuggestTasksPromptContent = (age: number) => {
  return `You are a helpful assistant that provides a list of age-appropriate tasks for children.

  Provide a list of tasks appropriate for a child of age ${age}. Do not include explanations, just the list of tasks.
  Each task should be something a child can accomplish on their own or with minimal adult supervision.
  Tasks should be engaging, educational, or helpful around the house.
  Limit the list to 5 tasks.

  Output the response as a JSON array of strings. Respond ONLY with the JSON array, nothing else.
  Example Output for a 7 year old:
  ["Make your bed", "Help set the dinner table", "Read a book for 20 minutes", "Draw a picture of your favorite animal", "Water the plants"]
  `;
};

export async function suggestAgeAppropriateTasks(
  input: SuggestAgeAppropriateTasksInput
): Promise<SuggestAgeAppropriateTasksOutput> {
  try {
    console.log(`suggestAgeAppropriateTasks: Suggesting tasks for age: ${input.age}`);

    const promptContent = getSuggestTasksPromptContent(input.age);

    // Use the direct GoogleGenAI instance for text generation
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash', 
      contents: promptContent,
    });

    if (!response.candidates || response.candidates.length === 0 || !response.candidates[0].content) {
        console.error("Suggest age appropriate tasks returned no candidates or content.");
        // Return a default or error state
        return { tasks: [] };
    }

    const text = response.candidates[0].content.parts[0]?.text;

    if (!text) {
        console.error("Suggest age appropriate tasks returned no text.");
         return { tasks: [] };
    }

    console.log("Raw text response:", text);

    // Attempt to parse the JSON array output from the model
    let suggestedTasks: string[] = [];
    try {
        // Clean the text: remove potential markdown backticks for JSON block
        const cleanText = text.replace(/^```json\s*|\s*```$/g, '').trim();
        suggestedTasks = JSON.parse(cleanText);
        
        if (!Array.isArray(suggestedTasks)) {
             console.warn("Parsed output is not an array, using empty array.", suggestedTasks);
             suggestedTasks = [];
        } else {
             // Ensure all items in the array are strings, filter out any non-string elements
             suggestedTasks = suggestedTasks.filter(task => typeof task === 'string');
        }


        console.log("Parsed suggested tasks:", suggestedTasks);

    } catch (jsonError) {
        console.error("Failed to parse JSON array from model response:", jsonError, "Raw text:", text);
        // Fallback if JSON parsing fails
        suggestedTasks = [];
    }

    // Refine the tasks by checking age appropriateness using the service.
    const ageRange = { min: input.age, max: input.age };
    const refinedTasks: string[] = [];

    for (const task of suggestedTasks) {
      // Ensure task is a string before checking appropriateness (already filtered above, but good for safety)
      if (typeof task === 'string') {
         const appropriatenessResult = await checkAgeAppropriateness(task, ageRange);
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
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during task suggestion.';
    console.error('Error in suggestAgeAppropriateTasks.', 'Error:', error);
    return { tasks: [] };
  }
}


