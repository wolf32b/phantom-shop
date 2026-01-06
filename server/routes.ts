import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth } from "./replit_integrations/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Set up Replit Auth
  await setupAuth(app);

  app.post(api.orders.create.path, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "غير مصرح لك بالدخول" });
    }

    try {
      const input = api.orders.create.input.parse(req.body);
      const currentRobux = await storage.getGlobalStat('total_robux');
      
      if (input.amount > currentRobux) {
        return res.status(400).json({ 
          message: "لا يوجد ما يكفي من الروبوكس في الخزنة حالياً",
          field: "amount"
        });
      }

      // @ts-ignore
      const userId = req.user.id;
      const order = await storage.createOrder({
        userId,
        amount: input.amount,
        status: "pending"
      });
      res.status(201).json(order);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: "خطأ في البيانات المرسلة",
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.orders.list.path, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "غير مصرح لك بالدخول" });
    }
    // @ts-ignore
    const orders = await storage.getOrdersForUser(req.user.id);
    res.json(orders);
  });

  app.get(api.users.me.path, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "لم يتم تسجيل الدخول" });
    }
    res.json(req.user);
  });

  app.get(api.stats.getRobuxCounter.path, async (req, res) => {
    const value = await storage.getGlobalStat('total_robux');
    res.json({ value });
  });

  // Ensure stats seeded
  const currentRobux = await storage.getGlobalStat('total_robux');
  if (currentRobux === 0) {
    await storage.setGlobalStat('total_robux', 1000000);
  }

  return httpServer;
}
