import * as z from 'zod';

export const dietPlanSchema = z.object({
  bmi: z.coerce
    .number({ invalid_type_error: 'BMI must be a number.' })
    .min(10, 'BMI seems too low. Please check the value.')
    .max(60, 'BMI seems too high. Please check the value.'),
  age: z.coerce
    .number({ invalid_type_error: 'Age must be a number.' })
    .int()
    .min(12, 'You must be at least 12 years old.')
    .max(120, 'Age seems too high. Please check the value.'),
  medicalHistory: z
    .string()
    .min(2, 'Please provide some information about your medical history (or "None").')
    .max(500, 'Medical history is too long.'),
  dietaryPreferences: z.string().max(500, 'Dietary preferences are too long.').optional(),
});
