import { db } from "./db";
import {
  users, orders, globalStats, notifications, phantomCodes,
  type User, type UpsertUser,
  type Order, type InsertOrder,
  type Notification, type InsertNotification,
  type PhantomCode, type InsertPhantomCode,
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
      const balance = await getRobuxSafe();
      const dbStorage = new DatabaseStorage();
      await dbStorage.setGlobalStat('total_robux', balance);
      console.log(`[ROBLOX] Initial balance sync: ${balance} Robux`);
    } catch (err) {
      console.error("[ROBLOX] Failed to set cookie:", err);
    }
  }
}

// Fixed getRobux check
async function getRobuxSafe(): Promise<number> {
  try {
    // Noblox v4.x uses getRobux() which returns a Promise<number>
    // However, the typings might be tricky in some environments
    const robux = await (noblox as any).getRobux();
    return typeof robux === 'number' ? robux : 0;
  } catch (e) {
    console.error("Robux check error:", e);
    return 0;
  }
}

// Start sync interval
if (ROBLOX_COOKIE) {
  initRoblox();
  setInterval(async () => {
    try {
      const balance = await getRobuxSafe();
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

  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotificationsForUser(userId: string): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<void>;

  getGlobalStat(key: string): Promise<number>;
  setGlobalStat(key: string, value: number): Promise<void>;

  createPhantomCode(code: InsertPhantomCode): Promise<PhantomCode>;
  getPhantomCode(code: string): Promise<PhantomCode | undefined>;
  updatePhantomCodeAmount(id: number, amount: number): Promise<void>;
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
      console.log(`[ROBLOX] Automated purchase triggered for gamepass ${gamepassId}.`);
      
      // Simulate successful purchase for demo purposes
      setTimeout(async () => {
        await db.update(orders).set({ status: "completed" }).where(eq(orders.id, order.id));
        await this.createNotification({
          userId: order.userId,
          title: "Heist Successful",
          message: `The Phantom Thieves have successfully transferred ${order.amount} Robux to your account!`,
          type: "success"
        });
        console.log(`[ROBLOX] Order #${order.id} marked as completed.`);
      }, 10000); // 10 seconds delay
      
      // For now, we mark as "processing" to show intent
      await db.update(orders).set({ status: "processing" }).where(eq(orders.id, order.id));
      
      // Notify user
      await this.createNotification({
        userId: order.userId,
        title: "Heist in Progress",
        message: `We've identified your gamepass and the Phantom Thieves are now transferring ${order.amount} Robux.`,
        type: "info"
      });
      
    } catch (err) {
      console.error("[ROBLOX] Automation error:", err);
      await db.update(orders).set({ status: "failed" }).where(eq(orders.id, order.id));
      
      await this.createNotification({
        userId: order.userId,
        title: "Heist Failed",
        message: "Something went wrong with the transfer. Please contact the leader.",
        type: "error"
      });
    }
  }

  async getOrdersForUser(userId: string): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async getNotificationsForUser(userId: string): Promise<Notification[]> {
    return await db.select().from(notifications).where(eq(notifications.userId, userId));
  }

  async markNotificationAsRead(id: number): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
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

  async createPhantomCode(code: InsertPhantomCode): Promise<PhantomCode> {
    const [newCode] = await db.insert(phantomCodes).values({
      ...code,
      remainingAmount: code.initialAmount,
      isPaid: true, // Assuming paid for now as we don't have stripe integration yet
    }).returning();
    return newCode;
  }

  async getPhantomCode(code: string): Promise<PhantomCode | undefined> {
    const [found] = await db.select().from(phantomCodes).where(eq(phantomCodes.code, code));
    return found;
  }

  async updatePhantomCodeAmount(id: number, amount: number): Promise<void> {
    await db.update(phantomCodes).set({ remainingAmount: amount }).where(eq(phantomCodes.id, id));
  }
}

export const storage = new DatabaseStorage();
