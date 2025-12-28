import { db } from "./db";
import {
  tiles, messages,
  type InsertTile, type InsertMessage,
  type Tile, type Message
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Tiles
  getTiles(): Promise<Tile[]>;
  createTile(tile: InsertTile): Promise<Tile>;
  deleteTile(id: number): Promise<void>;

  // Chat
  getMessages(): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
}

export class DatabaseStorage implements IStorage {
  // Tiles
  async getTiles(): Promise<Tile[]> {
    return await db.select().from(tiles);
  }

  async createTile(insertTile: InsertTile): Promise<Tile> {
    const [tile] = await db.insert(tiles).values(insertTile).returning();
    return tile;
  }

  async deleteTile(id: number): Promise<void> {
    await db.delete(tiles).where(eq(tiles.id, id));
  }

  // Chat
  async getMessages(): Promise<Message[]> {
    return await db.select().from(messages).orderBy(messages.createdAt);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }
}

export const storage = new DatabaseStorage();
