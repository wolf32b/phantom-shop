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
  } else if (!ROBLOX_COOKIE) {
    console.warn("[ROBLOX] ROBLOX_COOKIE not found. Global balance will remain at 0.");
  }
}

// Fixed getRobux check
async function getRobuxSafe(): Promise<number> {
  try {
    if (!ROBLOX_COOKIE) return 0;
    // Ensure we are logged in
    await noblox.setCookie(ROBLOX_COOKIE);
    // @ts-ignore
    const currentUser = await noblox.getAuthenticatedUser();
    // @ts-ignore
    const robux = await noblox.getUserFunds(currentUser.id || currentUser.UserID || currentUser.userId || currentUser.userID);
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
  }, 1 * 60 * 1000); // Sync every minute for better responsiveness
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  
  createOrder(order: InsertOrder): Promise<Order>;
  getOrdersForUser(userId: string): Promise<Order[]>;
  getOrderById(id: number): Promise<Order | undefined>;
  getPendingOrders(): Promise<Order[]>;
  updateOrderStatus(id: number, status: string, adminNote?: string | null): Promise<void>;

  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotificationsForUser(userId: string): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<void>;

  getGlobalStat(key: string): Promise<number>;
  setGlobalStat(key: string, value: number): Promise<void>;

  createPhantomCode(code: InsertPhantomCode): Promise<PhantomCode>;
  getPhantomCode(code: string): Promise<PhantomCode | undefined>;
  updatePhantomCodeAmount(id: number, amount: number): Promise<void>;
  markPhantomCodeAsPaid(id: number): Promise<void>;
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
    return newOrder;
  }

  async getOrdersForUser(userId: string): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId));
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getPendingOrders(): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.status, "pending_admin"));
  }

  async updateOrderStatus(id: number, status: string, adminNote?: string | null): Promise<void> {
    await db.update(orders).set({ 
      status, 
      adminNote: adminNote ?? null,
      updatedAt: new Date(),
    }).where(eq(orders.id, id));
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
      isPaid: false, // Default to false until paid via Stripe
    }).returning();
    return newCode;
  }

  async markPhantomCodeAsPaid(id: number): Promise<void> {
    await db.update(phantomCodes).set({ isPaid: true }).where(eq(phantomCodes.id, id));
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
