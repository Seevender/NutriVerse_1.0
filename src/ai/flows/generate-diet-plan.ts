'use server';

/**
 * @fileOverview Diet plan generation flow.
 *
 * This file defines a Genkit flow that generates a personalized diet plan based on user health profile data.
 * - generateDietPlan - The main function to trigger the diet plan generation flow.
 * - GenerateDietPlanInput - The input type for the generateDietPlan function.
 * - GenerateDietPlanOutput - The output type for the generateDietPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDietPlanInputSchema = z.object({
  bmi: z.number().describe('The Body Mass Index of the user.'),
  age: z.number().describe('The age of the user in years.'),
  medicalHistory: z
    .string()
    .describe('A comma-separated list of past medical conditions of the user.'),
  dietaryPreferences: z
    .string()
    .optional()
    .describe('Any dietary preferences or restrictions the user has.'),
});
export type GenerateDietPlanInput = z.infer<typeof GenerateDietPlanInputSchema>;

const MealSchema = z.object({
  breakfast: z.string().describe('Breakfast meal suggestion.'),
  lunch: z.string().describe('Lunch meal suggestion.'),
  dinner: z.string().describe('Dinner meal suggestion.'),
  snacks: z.string().optional().describe('Snack suggestions.'),
});

const DailyPlanSchema = z.object({
  day: z.string().describe('The day of the week (e.g., Monday).'),
  meals: MealSchema,
  dailyTotal: z.string().describe('Summary of total calories and macros for the day.'),
});

const GenerateDietPlanOutputSchema = z.object({
  summary: z.string().describe('A brief, encouraging summary of the diet plan strategy.'),
  macronutrientDistribution: z.object({
      carbs: z.number().describe('Percentage of carbohydrates.'),
      protein: z.number().describe('Percentage of protein.'),
      fat: z.number().describe('Percentage of fat.'),
    }).describe('The recommended macronutrient distribution.'),
  weeklyPlan: z.array(DailyPlanSchema).length(7).describe('A 7-day meal plan.'),
});
export type GenerateDietPlanOutput = z.infer<typeof GenerateDietPlanOutputSchema>;

export async function generateDietPlan(input: GenerateDietPlanInput): Promise<GenerateDietPlanOutput> {
  return generateDietPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDietPlanPrompt',
  input: {schema: GenerateDietPlanInputSchema},
  output: {schema: GenerateDietPlanOutputSchema},
  prompt: `You are a registered dietitian creating personalized diet plans. Based on the user's health profile, generate a comprehensive 7-day diet plan.

  User Health Profile:
  - BMI: {{{bmi}}}
  - Age: {{{age}}}
  - Medical History: {{{medicalHistory}}}
  - Dietary Preferences: {{{dietaryPreferences}}}

  Your response must be a JSON object that strictly follows the defined output schema.

  Instructions:
  1.  **Summary**: Write a short, motivational summary of the diet plan's goals.
  2.  **Macronutrient Distribution**: Provide a percentage-based breakdown for carbohydrates, protein, and fat that is appropriate for the user's profile. The sum must be 100.
  3.  **Weekly Plan**: Create a detailed meal plan for each of the 7 days (Monday to Sunday).
      - For each day, provide specific, healthy, and appealing suggestions for breakfast, lunch, and dinner.
      - Include a brief summary of the total estimated calories and macronutrients for each day.
      - If applicable, suggest healthy snacks.
  
  Ensure the entire plan is tailored to the user's medical history and dietary preferences.
  `,
});

const generateDietPlanFlow = ai.defineFlow(
  {
    name: 'generateDietPlanFlow',
    inputSchema: GenerateDietPlanInputSchema,
    outputSchema: GenerateDietPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
