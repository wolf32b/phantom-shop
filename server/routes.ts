import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth } from "./replit_integrations/auth";
import { hashPassword, verifyPassword } from "./auth-utils";
import { db } from "./db";
import { users, verificationCodes, insertOrderSchema } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { sendVerificationEmail } from "./email-service";

function generateVerificationCode(): string {
  return Math.random().toString().substring(2, 8);
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Custom Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Check if username exists
      const existingUser = await db.select().from(users).where(eq(users.username, username)).limit(1);
      if (existingUser.length > 0) {
        return res.status(409).json({ message: "Username already taken" });
      }

      // Check if email exists
      const existingEmail = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (existingEmail.length > 0) {
        return res.status(409).json({ message: "Email already registered" });
      }

      const passwordHash = await hashPassword(password);
      const newUser = await db.insert(users).values({
        username,
        email,
        passwordHash,
        isEmailVerified: false,
        robuxBalance: 0,
        isAdmin: false,
      }).returning();

      // Generate and send verification code
      const verificationCode = generateVerificationCode();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      await db.insert(verificationCodes).values({
        userId: newUser[0].id,
        code: verificationCode,
        expiresAt,
      });

      try {
        await sendVerificationEmail(email, verificationCode);
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
        // Continue anyway - code is in DB
      }

      res.status(201).json({ 
        success: true, 
        message: "Account created. Check your email for verification code.",
        userId: newUser[0].id,
        email: newUser[0].email,
      });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/verify-email", async (req, res) => {
    try {
      const { userId, code } = req.body;

      if (!userId || !code) {
        return res.status(400).json({ message: "Missing userId or code" });
      }

      const verification = await db.select().from(verificationCodes)
        .where(eq(verificationCodes.code, code))
        .limit(1);

      if (verification.length === 0 || verification[0].userId !== userId) {
        return res.status(401).json({ message: "Invalid verification code" });
      }

      if (verification[0].expiresAt < new Date()) {
        return res.status(401).json({ message: "Verification code expired" });
      }

      // Mark email as verified
      await db.update(users).set({ isEmailVerified: true }).where(eq(users.id, userId));

      // Delete used code
      await db.delete(verificationCodes).where(eq(verificationCodes.code, code));

      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);

      if (req.login) {
        req.login(user[0], (err) => {
          if (err) {
            console.error("req.login error:", err);
            return res.status(500).json({ message: "Login failed" });
          }
          res.json({ success: true, user: user[0] });
        });
      } else {
        // Fallback if passport isn't initialized yet on this route
        res.json({ success: true, user: user[0] });
      }
    } catch (error) {
      console.error("Verify error:", error);
      res.status(500).json({ message: "Verification failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Missing username or password" });
      }

      const user = await db.select().from(users).where(eq(sql`LOWER(${users.username})`, username.toLowerCase())).limit(1);
      console.log(`[AUTH] Login attempt for user: ${username}, found: ${user.length > 0}`);
      
      if (user.length === 0) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      console.log(`[AUTH] User verified status: ${user[0].isEmailVerified}`);
      if (!user[0].isEmailVerified) {
        return res.status(403).json({ message: "Email not verified", userId: user[0].id });
      }

      const passwordHash = user[0].passwordHash;
      console.log(`[AUTH] Password hash exists: ${!!passwordHash}`);
      if (!passwordHash) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValid = await verifyPassword(password, passwordHash);
      console.log(`[AUTH] Password valid: ${isValid}`);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.logIn(user[0], (err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed" });
        }
        res.json({ success: true, user: user[0] });
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Set up Replit Auth
  await setupAuth(app);

  app.post(api.orders.create.path, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Access Denied. You must be logged in." });
    }

    try {
      const input = insertOrderSchema.parse(req.body);
      const currentRobux = await storage.getGlobalStat('total_robux');
      
      if (input.amount > currentRobux) {
        return res.status(400).json({ 
          message: "Insufficient Robux in the global pool.",
          field: "amount"
        });
      }

      // @ts-ignore
      const userId = req.user.id;
      const order = await storage.createOrder({
        userId,
        amount: input.amount,
        gamepassUrl: input.gamepassUrl,
        status: "pending"
      });

      // Deduct from global pool
      await storage.setGlobalStat('total_robux', currentRobux - input.amount);

      res.status(201).json(order);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Heist failed." });
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
