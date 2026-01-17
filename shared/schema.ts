import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";

export * from "./models/auth";

export const globalStats = pgTable("global_stats", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(), // e.g., 'total_robux'
  value: integer("value").default(0).notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  amount: integer("amount").notNull(),
  gamepassUrl: text("gamepass_url").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({ 
  id: true, 
  createdAt: true 
}).extend({
  gamepassUrl: z.string().url("Invalid gamepass URL"),
  amount: z.number().min(1, "Amount must be at least 1"),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
