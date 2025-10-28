'use server';

/**
 * @fileOverview A shopping list generator AI agent.
 *
 * - generateShoppingList - A function that handles the shopping list generation process.
 * - GenerateShoppingListInput - The input type for the generateShoppingList function.
 * - GenerateShoppingListOutput - The return type for the generateShoppingList function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateShoppingListInputSchema = z.object({
  dietPlan: z
    .string()
    .describe("The user's generated diet plan, including meals for 7 days."),
});
export type GenerateShoppingListInput = z.infer<typeof GenerateShoppingListInputSchema>;

const ShoppingListItemSchema = z.object({
  item: z.string().describe('The name of the single shopping item (e.g., "Chicken Breast", "Brown Rice").'),
  quantity: z.string().optional().describe('The suggested quantity and unit (e.g., "2 lbs", "1 cup", "1 container").')
});

const ShoppingListCategorySchema = z.object({
  category: z.string().describe('The category of the items (e.g., "Produce", "Protein", "Dairy & Alternatives", "Pantry Staples", "Grains").'),
  items: z.array(ShoppingListItemSchema)
});


const GenerateShoppingListOutputSchema = z.object({
  shoppingList: z.array(ShoppingListCategorySchema).describe('A categorized list of shopping items.')
});
export type GenerateShoppingListOutput = z.infer<typeof GenerateShoppingListOutputSchema>;


export async function generateShoppingList(
  input: GenerateShoppingListInput
): Promise<GenerateShoppingListOutput> {
  return generateShoppingListFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateShoppingListPrompt',
  input: {schema: GenerateShoppingListInputSchema},
  output: {schema: GenerateShoppingListOutputSchema},
  prompt: `You are a helpful shopping list generator. Based on the provided 7-day diet plan, create a categorized shopping list.

  Diet Plan:
  {{{dietPlan}}}
  
  Instructions:
  1.  Analyze all meals for the entire week in the diet plan.
  2.  Consolidate all necessary ingredients into a single shopping list.
  3.  Group the ingredients into logical categories such as "Produce", "Protein", "Dairy & Alternatives", "Grains", and "Pantry Staples".
  4.  For each ingredient, provide the item name and an estimated quantity if possible.
  5.  Return the final list as a JSON object that follows the specified output schema.
  `,
});

const generateShoppingListFlow = ai.defineFlow(
  {
    name: 'generateShoppingListFlow',
    inputSchema: GenerateShoppingListInputSchema,
    outputSchema: GenerateShoppingListOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
