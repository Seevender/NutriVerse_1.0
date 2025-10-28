import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-recipes.ts';
import '@/ai/flows/generate-shopping-list.ts';
import '@/ai/flows/generate-diet-plan.ts';
import '@/ai/flows/chatbot-flow.ts';
