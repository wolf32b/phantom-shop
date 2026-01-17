import { db } from "./db";
import {
  users, orders, globalStats,
  type User, type UpsertUser,
  type Order, type InsertOrder,
  insertOrderSchema
} from "@shared/schema";
import { eq } from "drizzle-orm";
import noblox from "noblox.js";

// Initialize Roblox connection if cookie is present
let robloxUser: any = null;
const ROBLOX_COOKIE = process.env.ROBLOX_COOKIE;

async function initRoblox() {
  if (ROBLOX_COOKIE && !robloxUser) {
    try {
      robloxUser = await noblox.setCookie(ROBLOX_COOKIE);
      console.log(`[ROBLOX] Logged in as ${robloxUser.UserName}`);
      
      // Initial sync
      const balance = await noblox.getRobux();
      const dbStorage = new DatabaseStorage();
      await dbStorage.setGlobalStat('total_robux', balance);
      console.log(`[ROBLOX] Initial balance sync: ${balance} Robux`);
    } catch (err) {
      console.error("[ROBLOX] Failed to set cookie:", err);
    }
  }
}

// Start sync interval
if (ROBLOX_COOKIE) {
  initRoblox();
  setInterval(async () => {
    try {
      const balance = await noblox.getRobux();
      const dbStorage = new DatabaseStorage();
      await dbStorage.setGlobalStat('total_robux', balance);
      console.log(`[ROBLOX] Periodic balance sync: ${balance} Robux`);
    } catch (err) {
      console.error("[ROBLOX] Periodic sync failed:", err);
    }
  }, 5 * 60 * 1000); // Every 5 minutes
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  
  createOrder(order: InsertOrder): Promise<Order>;
  getOrdersForUser(userId: string): Promise<Order[]>;

  getGlobalStat(key: string): Promise<number>;
  setGlobalStat(key: string, value: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    
    // Trigger automated purchase in background
    if (ROBLOX_COOKIE) {
      this.automatePurchase(newOrder).catch(err => {
        console.error(`[ROBLOX] Automated purchase failed for order ${newOrder.id}:`, err);
      });
    }
    
    return newOrder;
  }

  private async automatePurchase(order: Order) {
    try {
      console.log(`[ROBLOX] Attempting to automate purchase for Order #${order.id} (${order.amount} Robux)`);
      
      // Extract gamepass ID from URL
      const match = order.gamepassUrl.match(/game-pass\/(\d+)/);
      if (!match) {
        throw new Error("Invalid gamepass URL format");
      }
      
      const gamepassId = parseInt(match[1]);
      
      // Noblox doesn't support buying directly, but we can log the intent
      // In a real production environment, you would use a dedicated gamepass-buyer service
      // or simulate the purchase request using Roblox's internal endpoints.
      console.log(`[ROBLOX] Automated purchase triggered for gamepass ${gamepassId}. (Note: Programmatic buying requires specialized implementation beyond standard libraries)`);
      
      // For now, we mark as "processing" to show intent
      await db.update(orders).set({ status: "processing" }).where(eq(orders.id, order.id));
      
    } catch (err) {
      console.error("[ROBLOX] Automation error:", err);
      await db.update(orders).set({ status: "failed" }).where(eq(orders.id, order.id));
    }
  }

  async getOrdersForUser(userId: string): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId));
  }

  async getGlobalStat(key: string): Promise<number> {
    const [stat] = await db.select().from(globalStats).where(eq(globalStats.key, key));
    return stat ? stat.value : 0;
  }

  async setGlobalStat(key: string, value: number): Promise<void> {
    await db.insert(globalStats)
      .values({ key, value })
      .onConflictDoUpdate({
        target: globalStats.key,
        set: { value }
      });
  }
}

export const storage = new DatabaseStorage();
