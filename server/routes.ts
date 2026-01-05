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

  app.get(api.products.list.path, async (req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.get(api.products.get.path, async (req, res) => {
    const product = await storage.getProduct(Number(req.params.id));
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  });

  app.post(api.products.create.path, async (req, res) => {
    // Basic check for admin - normally we'd check req.user.isAdmin
    if (!req.isAuthenticated()) {
       return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const input = api.products.create.input.parse(req.body);
      const product = await storage.createProduct(input);
      res.status(201).json(product);
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

  app.post(api.orders.create.path, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const input = api.orders.create.input.parse(req.body);
      // @ts-ignore
      const userId = req.user.id;
      const order = await storage.createOrder({
        userId,
        productId: input.productId,
        status: "pending"
      });
      res.status(201).json(order);
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

  app.get(api.orders.list.path, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    // @ts-ignore
    const orders = await storage.getOrdersForUser(req.user.id);
    res.json(orders);
  });

  app.get(api.users.me.path, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not logged in" });
    }
    res.json(req.user);
  });

  // Seed data
  if ((await storage.getProducts()).length === 0) {
    await storage.createProduct({
      name: "100 Robux",
      description: "Small pack of Robux",
      price: 100,
      imageUrl: "https://images.unsplash.com/photo-1611606063065-ee7946f0787a",
      category: "Currency"
    });
    await storage.createProduct({
      name: "Phantom Mask",
      description: "A replica mask of the leader",
      price: 500,
      imageUrl: "https://images.unsplash.com/photo-1550928431-7478d8cc8019",
      category: "Accessory"
    });
    await storage.createProduct({
      name: "Calling Card",
      description: "Send a calling card to your friends",
      price: 50,
      imageUrl: "https://images.unsplash.com/photo-1586075010923-2dd45eeed858",
      category: "Item"
    });
  }

  return httpServer;
}
