"use client";

import React, { useState, useTransition, useEffect } from 'react';
import Image from 'next/image';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { BrainCircuit, HeartPulse, Scale, Cake, ShoppingCart, Soup, Leaf, Bot, Activity, CheckCircle2, PieChart as PieChartIcon, Carrot, Beef, Milk, Wheat, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { generateDietPlanAction, generateShoppingListAction, suggestRecipesAction } from './actions';
import { dietPlanSchema } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { AuthButton } from '@/components/auth-button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Chatbot } from '@/components/chatbot';
import { type GenerateDietPlanOutput } from '@/ai/flows/generate-diet-plan';
import { type GenerateShoppingListOutput } from '@/ai/flows/generate-shopping-list';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import { useRouter } from 'next/navigation';

type LoadingState = {
  diet: boolean;
  list: boolean;
  recipes: boolean;
};

const IconWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-primary/10 text-primary p-2 rounded-lg">{children}</div>
);

const Loader = ({ text }: { text: string }) => (
  <div className="flex flex-col items-center justify-center gap-4 text-center">
    <Bot className="w-12 h-12 text-primary animate-pulse" />
    <p className="text-muted-foreground font-medium">{text}</p>
  </div>
);

const ProgressTracker = () => {
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);

  const days = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];

  useEffect(() => {
    setProgress((completedDays.length / days.length) * 100);
  }, [completedDays, days.length]);

  const handleDayToggle = (dayIndex: number) => {
    setCompletedDays(prev =>
      prev.includes(dayIndex) ? prev.filter(d => d !== dayIndex) : [...prev, dayIndex]
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <span>Progress Tracker</span>
        </CardTitle>
        <CardDescription>Track your weekly adherence to the plan.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progress} className="w-full h-3 transition-all duration-500" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {days.map((day, index) => (
            <div key={day} className="flex items-center space-x-2">
              <Checkbox
                id={`day-${index}`}
                checked={completedDays.includes(index)}
                onCheckedChange={() => handleDayToggle(index)}
              />
              <label htmlFor={`day-${index}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {day}
              </label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};


const DietPlanChart = ({ data }: { data: GenerateDietPlanOutput['macronutrientDistribution'] }) => {
  const chartData = [
    { name: 'Carbs', value: data.carbs, color: 'hsl(var(--chart-1))' },
    { name: 'Protein', value: data.protein, color: 'hsl(var(--chart-2))' },
    { name: 'Fat', value: data.fat, color: 'hsl(var(--chart-3))' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChartIcon className="w-5 h-5 text-primary" />
          <span>Macronutrient Distribution</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  borderColor: 'hsl(var(--border))',
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

const DietPlanDisplay = ({ plan }: { plan: GenerateDietPlanOutput }) => {
  const router = useRouter();

  const handleDayClick = (day: string) => {
    sessionStorage.setItem('dietPlan', JSON.stringify(plan));
    router.push(`/plan/${day.toLowerCase()}`);
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-accent" />
            Your Personalized Diet Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{plan.summary}</p>
        </CardContent>
      </Card>
      
      <DietPlanChart data={plan.macronutrientDistribution} />

      <Card>
        <CardHeader>
            <CardTitle>Weekly Meal Plan</CardTitle>
            <CardDescription>Select a day to see the detailed meal plan.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {plan.weeklyPlan.map((dailyPlan, index) => (
              <button
                key={index}
                onClick={() => handleDayClick(dailyPlan.day)}
                className="w-full text-left p-4 rounded-lg transition-colors hover:bg-muted/50 flex justify-between items-center"
              >
                <span className="font-semibold">{dailyPlan.day}</span>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
};

const ShoppingListDisplay = ({ list }: { list: GenerateShoppingListOutput }) => {
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'produce':
        return <Carrot className="w-5 h-5 text-primary" />;
      case 'protein':
      case 'meat':
        return <Beef className="w-5 h-5 text-primary" />;
      case 'dairy & alternatives':
      case 'dairy':
        return <Milk className="w-5 h-5 text-primary" />;
      case 'grains':
      case 'pantry staples':
        return <Wheat className="w-5 h-5 text-primary" />;
      default:
        return <ShoppingCart className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-primary" /> Shopping List
        </CardTitle>
        <CardDescription>
          Here is your shopping list based on your diet plan.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {list.shoppingList.map((category, index) => (
          <div key={index}>
            <div className="flex items-center gap-3 mb-3">
              {getCategoryIcon(category.category)}
              <h3 className="font-semibold text-lg">{category.category}</h3>
            </div>
            <div className="space-y-2 ml-2 pl-6 border-l-2 border-border">
              {category.items.map((item, itemIndex) => (
                <div key={itemIndex} className="flex justify-between items-center">
                  <span className="text-muted-foreground">{item.item}</span>
                  <span className="font-medium text-sm">{item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};


export default function NutriGeniusPage() {
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState<LoadingState>({ diet: false, list: false, recipes: false });
  const [dietPlan, setDietPlan] = useState<GenerateDietPlanOutput | null>(null);
  const [shoppingList, setShoppingList] = useState<GenerateShoppingListOutput | null>(null);
  const [recipes, setRecipes] = useState<string[] | null>(null);
  const { toast } = useToast();

  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-image');

  const form = useForm<z.infer<typeof dietPlanSchema>>({
    resolver: zodResolver(dietPlanSchema),
    defaultValues: {
      bmi: 22,
      age: 30,
      medicalHistory: 'None',
      dietaryPreferences: '',
    },
  });

  const handleGenerateDietPlan = async (values: z.infer<typeof dietPlanSchema>) => {
    setIsLoading({ diet: true, list: false, recipes: false });
    setDietPlan(null);
    setShoppingList(null);
    setRecipes(null);
    startTransition(async () => {
      const result = await generateDietPlanAction(values);
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        });
      } else {
        setDietPlan(result.data ?? null);
      }
      setIsLoading(prev => ({ ...prev, diet: false }));
    });
  };

  const handleGenerateShoppingList = async () => {
    if (!dietPlan) return;
    setIsLoading(prev => ({ ...prev, list: true }));
    startTransition(async () => {
      const result = await generateShoppingListAction(JSON.stringify(dietPlan));
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        });
      } else {
        setShoppingList(result.data ?? null);
      }
      setIsLoading(prev => ({ ...prev, list: false }));
    });
  };

  const handleSuggestRecipes = async () => {
    if (!dietPlan) return;
    setIsLoading(prev => ({ ...prev, recipes: true }));
    startTransition(async () => {
      const result = await suggestRecipesAction(JSON.stringify(dietPlan));
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        });
      } else {
        setRecipes(result.data ?? null);
      }
      setIsLoading(prev => ({ ...prev, recipes: false }));
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">NutriGenius</h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <AuthButton />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">
        <div className="grid lg:grid-cols-[1fr,1.1fr] lg:gap-16 gap-8">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Your Personal AI Diet Planner
            </h2>
            <p className="text-lg text-muted-foreground">
              Answer a few simple questions and let our AI create a personalized diet plan tailored to your health needs and goals.
            </p>
            <Card className="mt-6">
              <CardContent className="p-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleGenerateDietPlan)} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="bmi"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2"><Scale className="w-4 h-4" /> BMI</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="e.g., 22.5" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2"><Cake className="w-4 h-4" /> Age</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="e.g., 30" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="medicalHistory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2"><HeartPulse className="w-4 h-4" /> Medical History</FormLabel>
                          <FormControl>
                            <Textarea placeholder="e.g., Diabetes, High Blood Pressure" {...field} />
                          </FormControl>
                          <FormDescription>List any past or current medical conditions.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="dietaryPreferences"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2"><Leaf className="w-4 h-4" /> Dietary Preferences (Optional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="e.g., Vegetarian, gluten-free, allergies to nuts" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={isPending || isLoading.diet} className="w-full">
                      {isLoading.diet ? 'Generating Plan...' : 'Generate My Diet Plan'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8 min-h-[500px]">
            {isLoading.diet && (
              <Card className="flex items-center justify-center h-full">
                <CardContent className="p-6">
                  <Loader text="Crafting your personalized diet plan..." />
                </CardContent>
              </Card>
            )}
            {!dietPlan && !isLoading.diet && heroImage && (
              <Card className="h-full overflow-hidden">
                <div className="relative w-full h-full">
                  <Image
                    src={heroImage.imageUrl}
                    alt={heroImage.description}
                    fill
                    className="object-cover"
                    data-ai-hint={heroImage.imageHint}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-6">
                    <h3 className="text-2xl font-bold text-white">Unlock a Healthier You</h3>
                    <p className="text-white/90 mt-2">Your journey to wellness starts here. Fill out the form to get started.</p>
                  </div>
                </div>
              </Card>
            )}
            {dietPlan && (
              <>
                <DietPlanDisplay plan={dietPlan} />
                <Card>
                    <CardHeader>
                        <CardTitle>Next Steps</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                         <Button onClick={handleGenerateShoppingList} disabled={isPending || isLoading.list}>
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            {isLoading.list ? 'Creating List...' : 'Generate Shopping List'}
                        </Button>
                        <Button onClick={handleSuggestRecipes} disabled={isPending || isLoading.recipes} variant="outline">
                            <Soup className="mr-2 h-4 w-4" />
                            {isLoading.recipes ? 'Finding Recipes...' : 'Suggest Recipes'}
                        </Button>
                    </CardContent>
                </Card>

                <ProgressTracker />

                {isLoading.list && (
                  <Card>
                    <CardContent className="p-6"><Loader text="Compiling your shopping list..." /></CardContent>
                  </Card>
                )}
                {shoppingList && <ShoppingListDisplay list={shoppingList} />}


                {isLoading.recipes && (
                  <Card>
                    <CardContent className="p-6"><Loader text="Discovering delicious recipes..." /></CardContent>
                  </Card>
                )}
                {recipes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2"><Soup className="w-5 h-5 text-primary" /> Recipe Suggestions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {recipes.map((recipe, index) => (
                        <React.Fragment key={index}>
                          <div className="flex items-start gap-3">
                            <IconWrapper><Soup className="w-4 h-4" /></IconWrapper>
                            <p className="flex-1 text-sm">{recipe}</p>
                          </div>
                          {index < recipes.length - 1 && <Separator />}
                        </React.Fragment>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-auto border-t">
        <div className="container py-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} NutriGenius. All rights reserved.</p>
        </div>
      </footer>
      <Chatbot />
    </div>
  );
}
