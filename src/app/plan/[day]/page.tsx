
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sun, Moon, Utensils } from 'lucide-react';
import { type GenerateDietPlanOutput } from '@/ai/flows/generate-diet-plan';
import { PlaceHolderImages } from '@/lib/placeholder-images';

type DailyPlan = GenerateDietPlanOutput['weeklyPlan'][0];

const MealCard = ({ title, meal, imageId }: { title: string; meal: string; imageId: string }) => {
  const image = PlaceHolderImages.find(img => img.id === imageId);

  return (
    <Card className="overflow-hidden">
      {image && (
        <div className="relative w-full h-48">
          <Image
            src={image.imageUrl}
            alt={image.description}
            fill
            className="object-cover"
            data-ai-hint={image.imageHint}
          />
        </div>
      )}
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {title === 'Breakfast' && <Sun className="w-5 h-5 text-primary" />}
          {title === 'Lunch' && <Utensils className="w-5 h-5 text-primary" />}
          {title === 'Dinner' && <Moon className="w-5 h-5 text-primary" />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{meal}</p>
      </CardContent>
    </Card>
  );
};

export default function DayPlanPage() {
  const router = useRouter();
  const params = useParams();
  const [dayPlan, setDayPlan] = useState<DailyPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const day = Array.isArray(params.day) ? params.day[0] : params.day;

  useEffect(() => {
    try {
      const storedPlan = sessionStorage.getItem('dietPlan');
      if (storedPlan) {
        const fullPlan: GenerateDietPlanOutput = JSON.parse(storedPlan);
        const planForDay = fullPlan.weeklyPlan.find(
          p => p.day.toLowerCase() === day?.toLowerCase()
        );
        setDayPlan(planForDay || null);
      }
    } catch (error) {
      console.error('Failed to parse diet plan from session storage:', error);
    } finally {
      setIsLoading(false);
    }
  }, [day]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p>Loading meal plan...</p>
      </div>
    );
  }

  if (!dayPlan) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-center p-4">
        <h1 className="text-2xl font-bold mb-4">Meal Plan Not Found</h1>
        <p className="text-muted-foreground mb-6">
          Could not find the meal plan for {day}. Please go back and generate a plan first.
        </p>
        <Button onClick={() => router.push('/')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-body">
       <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
            <Button variant="outline" size="icon" onClick={() => router.push('/')}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to plan</span>
            </Button>
            <h1 className="text-2xl font-bold text-foreground ml-4">{dayPlan.day}'s Meal Plan</h1>
        </div>
      </header>

      <main className="w-full max-w-4xl mx-auto p-4 md:p-8">
        <div className="space-y-8">
          <MealCard title="Breakfast" meal={dayPlan.meals.breakfast} imageId="breakfast-meal" />
          <MealCard title="Lunch" meal={dayPlan.meals.lunch} imageId="lunch-meal" />
          <MealCard title="Dinner" meal={dayPlan.meals.dinner} imageId="dinner-meal" />

          {dayPlan.meals.snacks && (
            <Card>
              <CardHeader>
                <CardTitle>Snacks</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{dayPlan.meals.snacks}</p>
              </CardContent>
            </Card>
          )}

          <Card>
             <CardHeader>
                <CardTitle>Daily Summary</CardTitle>
              </CardHeader>
              <CardContent>
                 <p className="text-sm font-medium text-muted-foreground">{dayPlan.dailyTotal}</p>
              </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
