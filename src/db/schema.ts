import {
  boolean,
  date,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

export type StoredExercise = {
  id: string;
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
  muscle: string;
  tip: string;
};

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  avatar: text("avatar").notNull().default("🔥"),
  goal: text("goal").notNull().default("Construir mi mejor versión"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  token: text("token").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  icon: text("icon").notNull().default("💪"),
  color: text("color").notNull().default("violet"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  archived: boolean("archived").notNull().default(false),
});

export const habitLogs = pgTable(
  "habit_logs",
  {
    id: serial("id").primaryKey(),
    habitId: integer("habit_id")
      .notNull()
      .references(() => habits.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    day: date("day").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique("habit_logs_habit_day_unique").on(table.habitId, table.day)],
);

export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  // Único: evita que varios procesos sembrando a la vez dupliquen el catálogo.
  body: text("body").notNull().unique(),
  author: text("author").notNull(),
  category: text("category").notNull().default("mindset"),
});

export const favoriteQuotes = pgTable(
  "favorite_quotes",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    quoteId: integer("quote_id")
      .notNull()
      .references(() => quotes.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique("favorite_quotes_unique").on(table.userId, table.quoteId)],
);

export const workoutLogs = pgTable("workout_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  routineId: text("routine_id").notNull(),
  routineTitle: text("routine_title").notNull(),
  durationMinutes: integer("duration_minutes").notNull().default(45),
  caloriesBurned: integer("calories_burned").notNull().default(350),
  day: date("day").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const savedRoutines = pgTable(
  "saved_routines",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    routineId: text("routine_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique("saved_routines_unique").on(table.userId, table.routineId)],
);

export const recipeLogs = pgTable("recipe_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  recipeId: text("recipe_id").notNull(),
  recipeTitle: text("recipe_title").notNull(),
  calories: integer("calories").notNull().default(450),
  proteinGrams: integer("protein_grams").notNull().default(35),
  day: date("day").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const savedRecipes = pgTable(
  "saved_recipes",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    recipeId: text("recipe_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique("saved_recipes_unique").on(table.userId, table.recipeId)],
);

export const userRoutines = pgTable("user_routines", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull().default(""),
  level: text("level").notNull().default("Intermedio"),
  durationMinutes: integer("duration_minutes").notNull().default(30),
  caloriesBurned: integer("calories_burned").notNull().default(250),
  equipment: text("equipment").notNull().default("Peso corporal"),
  image: text("image").notNull().default("/images/strength.jpg"),
  accent: text("accent").notNull().default("from-fuchsia-500 to-violet-600"),
  exercises: jsonb("exercises").$type<StoredExercise[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const userRecipes = pgTable("user_recipes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull().default(""),
  category: text("category").notNull().default("proteina"),
  prepMinutes: integer("prep_minutes").notNull().default(15),
  calories: integer("calories").notNull().default(400),
  protein: integer("protein").notNull().default(30),
  carbs: integer("carbs").notNull().default(30),
  fats: integer("fats").notNull().default(10),
  image: text("image").notNull().default("/images/nutrition.jpg"),
  accent: text("accent").notNull().default("from-lime-400 to-emerald-500"),
  ingredients: jsonb("ingredients").$type<string[]>().notNull().default([]),
  steps: jsonb("steps").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const userQuotes = pgTable("user_quotes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  author: text("author").notNull().default("Mi mantra"),
  category: text("category").notNull().default("mindset"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const inboxMessages = pgTable("inbox_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  subject: text("subject").notNull(),
  sender: text("sender").notNull().default("VITALIS Coach <coach@vitalis.app>"),
  verificationCode: text("verification_code").notNull().default("849201"),
  body: text("body").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type Habit = typeof habits.$inferSelect;
export type HabitLog = typeof habitLogs.$inferSelect;
export type Quote = typeof quotes.$inferSelect;
export type WorkoutLog = typeof workoutLogs.$inferSelect;
export type RecipeLog = typeof recipeLogs.$inferSelect;
export type InboxMessage = typeof inboxMessages.$inferSelect;
