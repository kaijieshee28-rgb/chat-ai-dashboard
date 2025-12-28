import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { OpenAI } from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

// Mock web search tool for the AI
async function performWebSearch(query: string) {
  // In a real scenario, this would call a search API.
  // For this implementation, we'll return a helpful mock response
  // that suggests we've searched the web.
  return `Search results for "${query}": 
  1. Example Site - A great resource for ${query}. [https://example.com]
  2. News Update - Latest trends in ${query} for 2024. [https://news.example.com]
  3. Wikipedia - General overview of ${query}. [https://en.wikipedia.org/wiki/${encodeURIComponent(query)}]`;
}

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

      // Get history for context
      const history = await storage.getMessages();
      const messages = history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

      // Define tools for the AI
      const tools = [
        {
          type: "function" as const,
          function: {
            name: "search_web",
            description: "Search the web for information or websites",
            parameters: {
              type: "object",
              properties: {
                query: { type: "string", description: "The search query" },
              },
              required: ["query"],
            },
          },
        },
        {
          type: "function" as const,
          function: {
            name: "open_website",
            description: "Automatically open a website for the user when they express clear intent to visit it",
            parameters: {
              type: "object",
              properties: {
                url: { type: "string", description: "The full URL of the website to open" },
              },
              required: ["url"],
            },
          },
        },
      ];

      // Initial call to check for tool usage
      let response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a helpful assistant for a dashboard app. You can browse the web using 'search_web' and automatically open websites for users using 'open_website' when they want to visit a site." },
          ...messages
        ],
        tools,
      });

      const toolCalls = response.choices[0].message.tool_calls;

      if (toolCalls) {
        // AI wants to use tools
        const historyWithTool = [...messages, response.choices[0].message];

        for (const toolCall of toolCalls) {
          const toolCallAny = toolCall as any;
          if (toolCallAny.function.name === "search_web") {
            const args = JSON.parse(toolCallAny.function.arguments);
            const searchResult = await performWebSearch(args.query);

            historyWithTool.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: searchResult,
            } as any);
          } else if (toolCallAny.function.name === "open_website") {
            const args = JSON.parse(toolCallAny.function.arguments);
            // In a real app, we might send a message back to frontend via WS or specific response field
            // For this implementation, we'll confirm the action in the response
            historyWithTool.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: `Website ${args.url} has been requested to open.`,
            } as any);
          }
        }

        // Final call with search results
        response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: "You are a helpful assistant for a dashboard app. You have just searched the web and should now provide the user with the information they need." },
            ...historyWithTool as any
          ],
        });
      }

      const aiContent = response.choices[0].message.content || "I'm sorry, I couldn't process that.";

      // Save AI response
      const aiMessage = await storage.createMessage({ role: 'assistant', content: aiContent });

      // Check for automation metadata
      let automation;
      if (toolCalls) {
        const openCall = toolCalls.find(tc => (tc as any).function.name === "open_website");
        if (openCall) {
          const args = JSON.parse((openCall as any).function.arguments);
          automation = { type: 'open_url', url: args.url };
        }
      }

      res.json({ message: aiMessage, automation });
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
