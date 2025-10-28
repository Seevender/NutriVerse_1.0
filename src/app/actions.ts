'use server';

import {
  generateDietPlan,
  type GenerateDietPlanInput,
  type GenerateDietPlanOutput
} from '@/ai/flows/generate-diet-plan';
import { generateShoppingList, type GenerateShoppingListOutput } from '@/ai/flows/generate-shopping-list';
import { suggestRecipes } from '@/ai/flows/suggest-recipes';
import { askChatbot } from '@/ai/flows/chatbot-flow';
import { dietPlanSchema } from '@/lib/types';
import type { z } from 'zod';

export async function generateDietPlanAction(
  values: z.infer<typeof dietPlanSchema>
): Promise<{ data?: GenerateDietPlanOutput; error?: string }> {
  const validatedValues = dietPlanSchema.safeParse(values);
  if (!validatedValues.success) {
    return { error: 'Invalid input. Please check your entries and try again.' };
  }

  const input: GenerateDietPlanInput = {
    ...validatedValues.data,
    dietaryPreferences: validatedValues.data.dietaryPreferences || 'None',
  };

  try {
    const result = await generateDietPlan(input);
    return { data: result };
  } catch (e) {
    console.error(e);
    return { error: 'Failed to generate diet plan. The AI service may be temporarily unavailable. Please try again later.' };
  }
}

export async function generateShoppingListAction(
  dietPlan: string
): Promise<{ data?: GenerateShoppingListOutput; error?: string }> {
  if (!dietPlan) {
    return { error: 'A diet plan is required to generate a shopping list.' };
  }

  try {
    const result = await generateShoppingList({ dietPlan });
    return { data: result };
  } catch (e) {
    console.error(e);
    return { error: 'Failed to generate shopping list. Please try again.' };
  }
}

export async function suggestRecipesAction(
  dietPlan: string
): Promise<{ data?: string[]; error?: string }> {
  if (!dietPlan) {
    return { error: 'A diet plan is required to suggest recipes.' };
  }
  try {
    const result = await suggestRecipes({ dietPlan });
    return { data: result.recipes };
  } catch (e) {
    console.error(e);
    return { error: 'Failed to suggest recipes. Please try again.' };
  }
}

export async function askChatbotAction(
  question: string
): Promise<{ data?: string; error?: string }> {
  if (!question) {
    return { error: 'Please enter a question.' };
  }
  try {
    const result = await askChatbot({ question });
    return { data: result.answer };
  } catch (e) {
    console.error(e);
    return { error: 'The chatbot is currently unavailable. Please try again later.' };
  }
}
