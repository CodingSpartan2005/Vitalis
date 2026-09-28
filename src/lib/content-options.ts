import type { FitnessRecipe, WorkoutRoutine } from "@/lib/fitness-content";
import { IMAGES } from "@/lib/images";

/** Client-safe options for the content creator (no database imports here). */

export type UserRoutineView = WorkoutRoutine & { userOwned: true; dbId: number };
export type UserRecipeView = FitnessRecipe & { userOwned: true; dbId: number };
export type UserQuoteView = {
  id: number;
  body: string;
  author: string;
  category: string;
  userOwned: true;
};

export type UserContent = {
  routines: UserRoutineView[];
  recipes: UserRecipeView[];
  quotes: UserQuoteView[];
};

export const EMPTY_USER_CONTENT: UserContent = {
  routines: [],
  recipes: [],
  quotes: [],
};

export const ROUTINE_IMAGES = [
  IMAGES.strength,
  IMAGES.hero,
  IMAGES.workoutHiit,
  IMAGES.community,
  IMAGES.mind,
];

export const RECIPE_IMAGES = [
  IMAGES.nutrition,
  IMAGES.recipeProtein,
  IMAGES.recipeBowl,
];

export const ROUTINE_ACCENTS = [
  "from-fuchsia-500 to-violet-600",
  "from-cyan-400 to-blue-600",
  "from-lime-400 to-emerald-600",
  "from-amber-400 to-rose-500",
  "from-violet-500 to-cyan-400",
];
