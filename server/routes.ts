import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertFlashcardSchema, reviewSchema } from "@shared/schema";
import { z } from "zod";

export function registerRoutes(app: Express) {
  app.get("/api/flashcards", async (_req, res) => {
    const cards = await storage.getFlashcards();
    res.json(cards);
  });

  app.get("/api/flashcards/due", async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const cards = await storage.getDueCards(limit);
    res.json(cards);
  });

  app.post("/api/flashcards", async (req, res) => {
    const result = insertFlashcardSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    const card = await storage.createFlashcard(result.data);
    res.json(card);
  });

  app.post("/api/flashcards/review", async (req, res) => {
    const result = reviewSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    const card = await storage.getFlashcard(result.data.id);
    if (!card) {
      return res.status(404).json({ error: "Card not found" });
    }

    // Update card using SM-2 algorithm
    const quality = result.data.quality;
    const newEF = Math.max(130, card.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
    let interval = 1;
    
    if (quality >= 3) {
      if (card.repetitions === 0) interval = 1;
      else if (card.repetitions === 1) interval = 6;
      else interval = Math.round(card.interval * (card.easeFactor / 100));
    }

    const updatedCard = await storage.updateFlashcard({
      ...card,
      interval,
      easeFactor: newEF,
      repetitions: quality >= 3 ? card.repetitions + 1 : 0,
      nextReview: new Date(Date.now() + interval * 24 * 60 * 60 * 1000)
    });

    res.json(updatedCard);
  });

  app.post("/api/flashcards/upload", async (req, res) => {
    const fileSchema = z.object({
      cards: z.array(insertFlashcardSchema)
    });

    const result = fileSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    const cards = await Promise.all(
      result.data.cards.map(card => storage.createFlashcard(card))
    );

    res.json(cards);
  });

  const httpServer = createServer(app);
  return httpServer;
}
