import { db } from "./db";
import { type Flashcard, type InsertFlashcard, flashcards } from "@shared/schema";
import { eq, lte } from "drizzle-orm";

export interface IStorage {
  getFlashcards(): Promise<Flashcard[]>;
  getFlashcard(id: number): Promise<Flashcard | undefined>;
  createFlashcard(card: InsertFlashcard): Promise<Flashcard>;
  updateFlashcard(card: Flashcard): Promise<Flashcard>;
  getDueCards(limit?: number): Promise<Flashcard[]>;
}

export class DatabaseStorage implements IStorage {
  async getFlashcards(): Promise<Flashcard[]> {
    return await db.select().from(flashcards);
  }

  async getFlashcard(id: number): Promise<Flashcard | undefined> {
    const [card] = await db.select().from(flashcards).where(eq(flashcards.id, id));
    return card;
  }

  async createFlashcard(insertCard: InsertFlashcard): Promise<Flashcard> {
    const [card] = await db
      .insert(flashcards)
      .values({
        ...insertCard,
        nextReview: new Date(),
        interval: 0,
        easeFactor: 250,
        repetitions: 0
      })
      .returning();
    return card;
  }

  async updateFlashcard(card: Flashcard): Promise<Flashcard> {
    const [updated] = await db
      .update(flashcards)
      .set(card)
      .where(eq(flashcards.id, card.id))
      .returning();
    return updated;
  }

  async getDueCards(limit = 20): Promise<Flashcard[]> {
    return await db
      .select()
      .from(flashcards)
      .where(lte(flashcards.nextReview, new Date()))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();