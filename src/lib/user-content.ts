import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { userQuotes, userRecipes, userRoutines } from "@/db/schema";
import type { FitnessRecipe, WorkoutRoutine } from "@/lib/fitness-content";
import type { UserContent } from "@/lib/content-options";
import { resolveImage } from "@/lib/images";

export type {
  UserContent,
  UserQuoteView,
  UserRecipeView,
  UserRoutineView,
} from "@/lib/content-options";

const RECIPE_LABELS: Record<string, string> = {
  proteina: "Aumento Muscular",
  definicion: "Definición / Quema Grasa",
  "post-entreno": "Post-Entreno",
  energia: "Energía Sostenida",
};

export async function getUserContent(userId: number): Promise<UserContent> {
  const [routines, recipes, quotes] = await Promise.all([
    db.select().from(userRoutines).where(eq(userRoutines.userId, userId)).orderBy(desc(userRoutines.id)),
    db.select().from(userRecipes).where(eq(userRecipes.userId, userId)).orderBy(desc(userRecipes.id)),
    db.select().from(userQuotes).where(eq(userQuotes.userId, userId)).orderBy(desc(userQuotes.id)),
  ]);

  return {
    routines: routines.map((r) => ({
      id: `user-${r.id}`,
      dbId: r.id,
      userOwned: true as const,
      title: r.title,
      subtitle: r.subtitle,
      category: "fuerza",
      level: (r.level as WorkoutRoutine["level"]) ?? "Intermedio",
      durationMinutes: r.durationMinutes,
      caloriesBurned: r.caloriesBurned,
      image: resolveImage(r.image),
      accent: r.accent,
      equipment: r.equipment,
      exercises: r.exercises ?? [],
    })),
    recipes: recipes.map((r) => ({
      id: `user-${r.id}`,
      dbId: r.id,
      userOwned: true as const,
      title: r.title,
      subtitle: r.subtitle,
      category: (r.category as FitnessRecipe["category"]) ?? "proteina",
      categoryLabel: RECIPE_LABELS[r.category] ?? "Mi receta",
      prepMinutes: r.prepMinutes,
      calories: r.calories,
      protein: r.protein,
      carbs: r.carbs,
      fats: r.fats,
      image: resolveImage(r.image),
      accent: r.accent,
      ingredients: r.ingredients ?? [],
      steps: r.steps ?? [],
    })),
    quotes: quotes.map((q) => ({
      id: q.id,
      body: q.body,
      author: q.author,
      category: q.category,
      userOwned: true as const,
    })),
  };
}


