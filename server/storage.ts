import { type Flashcard, type InsertFlashcard } from "@shared/schema";

export interface IStorage {
  getFlashcards(): Promise<Flashcard[]>;
  getFlashcard(id: number): Promise<Flashcard | undefined>;
  createFlashcard(card: InsertFlashcard): Promise<Flashcard>;
  updateFlashcard(card: Flashcard): Promise<Flashcard>;
  getDueCards(limit?: number): Promise<Flashcard[]>;
}

export class MemStorage implements IStorage {
  private flashcards: Map<number, Flashcard>;
  private currentId: number;

  constructor() {
    this.flashcards = new Map();
    this.currentId = 1;
  }

  async getFlashcards(): Promise<Flashcard[]> {
    return Array.from(this.flashcards.values());
  }

  async getFlashcard(id: number): Promise<Flashcard | undefined> {
    return this.flashcards.get(id);
  }

  async createFlashcard(insertCard: InsertFlashcard): Promise<Flashcard> {
    const id = this.currentId++;
    const card: Flashcard = {
      id,
      ...insertCard,
      nextReview: new Date(),
      interval: 0,
      easeFactor: 250,
      repetitions: 0
    };
    this.flashcards.set(id, card);
    return card;
  }

  async updateFlashcard(card: Flashcard): Promise<Flashcard> {
    this.flashcards.set(card.id, card);
    return card;
  }

  async getDueCards(limit = 20): Promise<Flashcard[]> {
    const now = new Date();
    return Array.from(this.flashcards.values())
      .filter(card => card.nextReview <= now)
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
