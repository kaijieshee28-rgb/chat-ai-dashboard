import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { OpenAI } from "openai";

// Initialize OpenAI client
// Replit AI integration provides the API key in the environment or handles it
const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Tiles API
  app.get(api.tiles.list.path, async (req, res) => {
    const tiles = await storage.getTiles();
    res.json(tiles);
  });

  app.post(api.tiles.create.path, async (req, res) => {
    try {
      const input = api.tiles.create.input.parse(req.body);
      const tile = await storage.createTile(input);
      res.status(201).json(tile);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.tiles.delete.path, async (req, res) => {
    await storage.deleteTile(Number(req.params.id));
    res.status(204).send();
  });

  // Chat API
  app.get(api.chat.history.path, async (req, res) => {
    const history = await storage.getMessages();
    res.json(history);
  });

  app.post(api.chat.send.path, async (req, res) => {
    try {
      const { message } = api.chat.send.input.parse(req.body);

      // Save user message
      await storage.createMessage({ role: 'user', content: message });

      // Get history for context (limit to last 10 for context window)
      const history = await storage.getMessages();
      const messages = history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

      // Call OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a helpful assistant for a dashboard app. The user can access various websites via tiles. You help them find information or navigate." },
          ...messages
        ],
      });

      const aiContent = response.choices[0].message.content || "I'm sorry, I couldn't process that.";

      // Save AI response
      const aiMessage = await storage.createMessage({ role: 'assistant', content: aiContent });

      res.json(aiMessage);
    } catch (err) {
      console.error('Chat error:', err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  // Seed data
  const existingTiles = await storage.getTiles();
  if (existingTiles.length === 0) {
    await storage.createTile({ title: 'Google', url: 'https://google.com', icon: 'Search', color: 'bg-blue-500' });
    await storage.createTile({ title: 'GitHub', url: 'https://github.com', icon: 'Github', color: 'bg-gray-800' });
    await storage.createTile({ title: 'YouTube', url: 'https://youtube.com', icon: 'Youtube', color: 'bg-red-600' });
    await storage.createTile({ title: 'Twitter', url: 'https://twitter.com', icon: 'Twitter', color: 'bg-blue-400' });
  }

  return httpServer;
}
