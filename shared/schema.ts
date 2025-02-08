import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const flashcards = pgTable("flashcards", {
  id: serial("id").primaryKey(),
  front: text("front").notNull(),
  back: text("back").notNull(),
  nextReview: timestamp("next_review").notNull().defaultNow(),
  interval: integer("interval").notNull().default(0),
  easeFactor: integer("ease_factor").notNull().default(250), // 250 = 2.5
  repetitions: integer("repetitions").notNull().default(0)
});

export const insertFlashcardSchema = createInsertSchema(flashcards).pick({
  front: true,
  back: true
});

export type InsertFlashcard = z.infer<typeof insertFlashcardSchema>;
export type Flashcard = typeof flashcards.$inferSelect;

export const reviewSchema = z.object({
  id: z.number(),
  quality: z.number().min(0).max(5)
});

export type Review = z.infer<typeof reviewSchema>;
