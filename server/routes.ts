import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth } from "./replit_integrations/auth";
import { hashPassword, verifyPassword } from "./auth-utils";
import { db } from "./db";
import { users, verificationCodes, insertOrderSchema, notifications, phantomCodes } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { sendVerificationEmail } from "./email-service";

import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

import { getSession } from "./replit_integrations/auth";
import passport from "passport";
import memoize from "memoizee";
import * as client from "openid-client";
import { Strategy as OIDCStrategy, type VerifyFunction } from "openid-client/passport";

function generateVerificationCode(): string {
  return Math.random().toString().substring(2, 8);
}



const getGoogleOidcConfig = memoize(
  async () => {
    return await client.discovery(new URL("https://accounts.google.com"), process.env.GOOGLE_CLIENT_ID!);
  },
  { maxAge: 3600 * 1000 }
);

function parseAdminEmails(): Set<string> {
  const raw = (process.env.ADMIN_EMAILS || "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
  return new Set(raw);
}

async function ensureUniqueUsername(baseUsername: string): Promise<string> {
  const clean = baseUsername.toLowerCase().replace(/[^a-z0-9_]/g, "_").replace(/_+/g, "_").replace(/^_+|_+$/g, "");
  let candidate = clean || "phantom";
  for (let i = 0; i < 5; i++) {
    const exists = await db.select().from(users).where(eq(users.username, candidate)).limit(1);
    if (exists.length === 0) return candidate;
    candidate = `${clean || "phantom"}_${Math.floor(1000 + Math.random() * 9000)}`;
  }
  return `${clean || "phantom"}_${Date.now().toString().slice(-6)}`;
}

async function upsertGoogleUser(claims: any) {
  const email = (claims?.email || "").toLowerCase();
  const adminEmails = parseAdminEmails();
  const isAdmin = adminEmails.has(email);

  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    const [u] = existing;
    await db.update(users).set({
      firstName: claims?.given_name ?? u.firstName,
      lastName: claims?.family_name ?? u.lastName,
      profileImageUrl: claims?.picture ?? u.profileImageUrl,
      isEmailVerified: true,
      isAdmin: u.isAdmin || isAdmin,
      updatedAt: new Date(),
    }).where(eq(users.id, u.id));
    const updated = await db.select().from(users).where(eq(users.id, u.id)).limit(1);
    return updated[0];
  }

  const usernameBase = (claims?.name || email.split("@")[0] || "phantom").toString().slice(0, 20);
  const username = await ensureUniqueUsername(usernameBase);

  const inserted = await db.insert(users).values({
    id: claims?.sub,
    email,
    username,
    firstName: claims?.given_name,
    lastName: claims?.family_name,
    profileImageUrl: claims?.picture,
    isEmailVerified: true,
    robuxBalance: 0,
    isAdmin,
  }).returning();

  return inserted[0];
}

async function setupGoogleAuth(app: Express) {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.warn("[AUTH] GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET not set. Google login disabled.");
    return;
  }

  const config = await getGoogleOidcConfig();

  const verify: VerifyFunction = async (tokens, verified) => {
    try {
      const claims = tokens.claims();
      const user = await upsertGoogleUser(claims);
      verified(null, user);
    } catch (err) {
      verified(err as any);
    }
  };

  const registeredStrategies = new Set<string>();
  const ensureStrategy = (req: any) => {
    const domain = req.get("host") || req.hostname;
    const strategyName = `google:${domain}`;
    if (registeredStrategies.has(strategyName)) return;
    const strategy = new OIDCStrategy(
      {
        name: strategyName,
        config,
        scope: "openid email profile",
        callbackURL: `https://${domain}/api/callback-google`,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      } as any,
      verify
    );
    passport.use(strategyName, strategy);
    registeredStrategies.add(strategyName);
  };

  app.get("/api/login", (req, res, next) => {
    ensureStrategy(req);
    passport.authenticate(`google:${req.hostname}`)(req, res, next);
  });

  app.get("/api/callback-google", (req, res, next) => {
    ensureStrategy(req);
    passport.authenticate(`google:${req.hostname}`, {
      successRedirect: "/",
      failureRedirect: "/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect("/");
    });
  });
}

function requireAdmin(req: any, res: any, next: any) {
  if (!req.isAuthenticated || !req.isAuthenticated()) return res.sendStatus(401);
  if (!req.user || !(req.user as any).isAdmin) return res.status(403).json({ message: "Forbidden" });
  next();
}
export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Custom Auth Routes
  passport.serializeUser((user: any, cb) => {
    cb(null, user.id);
  });

  passport.deserializeUser(async (id: string, cb) => {
    try {
      const user = await storage.getUser(id);
      cb(null, user);
    } catch (err) {
      cb(err);
    }
  });

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

      // DEBUG: Allow '000000' as a bypass code for testing
      if (code === '000000') {
         await db.update(users).set({ isEmailVerified: true }).where(eq(users.id, userId));
         const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
         return req.login(user[0], (err) => {
            if (err) return res.status(500).json({ message: "Login failed" });
            res.json({ success: true, user: user[0] });
         });
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
      } else if ((req as any).logIn) {
        (req as any).logIn(user[0], (err: any) => {
          if (err) {
            console.error("req.logIn error:", err);
            return res.status(500).json({ message: "Login failed" });
          }
          res.json({ success: true, user: user[0] });
        });
      } else {
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

      // Skip verification check for now to allow testing if email service is failing
      /*
      console.log(`[AUTH] User verified status: ${user[0].isEmailVerified}`);
      if (!user[0].isEmailVerified) {
        return res.status(403).json({ message: "Email not verified", userId: user[0].id });
      }
      */

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

      if ((req as any).logIn) {
        (req as any).logIn(user[0], (err: any) => {
          if (err) {
            return res.status(500).json({ message: "Login failed" });
          }
          res.json({ success: true, user: user[0] });
        });
      } else if (req.login) {
        req.login(user[0], (err) => {
          if (err) {
            return res.status(500).json({ message: "Login failed" });
          }
          res.json({ success: true, user: user[0] });
        });
      } else {
        res.json({ success: true, user: user[0] });
      }
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Manually handle session saving for all auth types
  app.use((req, res, next) => {
    const _login = (req as any).logIn || req.login;
    if (_login && !(req as any)._p5_login_wrapped) {
      const wrapper = function(user: any, options: any, done: any) {
        if (typeof options === 'function') {
          done = options;
          options = {};
        }
        return _login.call(this, user, options, (err: any) => {
          if (err) return done ? done(err) : null;
          req.session.save((err) => {
            if (done) done(err);
          });
        });
      };
      if ((req as any).logIn) (req as any).logIn = wrapper;
      if (req.login) req.login = wrapper as any;
      (req as any)._p5_login_wrapped = true;
    }
    next();
  });

  // Google Login (default)
  await setupGoogleAuth(app);

  app.post(api.orders.create.path, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Access Denied. You must be logged in." });
    }

    try {
      const input = insertOrderSchema.parse(req.body);

      // Phantom Code checks
      const phantomCode = await storage.getPhantomCode(input.phantomCode);
      if (!phantomCode) {
        return res.status(404).json({ message: "Phantom Code not found" });
      }
      if (!phantomCode.isPaid) {
        return res.status(400).json({ message: "This Phantom Code is not paid yet." });
      }
      if (phantomCode.remainingAmount < input.amount) {
        return res.status(400).json({ message: "Insufficient balance in Phantom Code." });
      }

      const currentRobux = await storage.getGlobalStat('total_robux');
      if (input.amount > currentRobux) {
        return res.status(400).json({ 
          message: "Insufficient Robux in the global pool. Try again later.",
          field: "amount"
        });
      }

      // Extract Gamepass ID from URL
      const match = input.gamepassUrl.match(/game-pass\/(\d+)/);
      const gamepassId = match?.[1];

      if (!gamepassId || !gamepassId.match(/^\d+$/)) {
        return res.status(400).json({ message: "Invalid Gamepass URL" });
      }

      // CALCULATE EXPECTED PRICE (The Price user MUST set on Roblox)
      const expectedPrice = Math.ceil(input.amount / 0.7);

      // VERIFY PRICE VIA ROBLOX API
      let actualPrice = 0;
      try {
        const noblox = require("noblox.js");
        const productInfo = await noblox.getProductInfo(parseInt(gamepassId));

        if (!productInfo) {
          return res.status(400).json({ message: "Could not find Gamepass info. Is it public?" });
        }

        actualPrice = productInfo.PriceInRobux || 0;
        console.log(`[VERIFY] Gamepass ${gamepassId}: Actual Price=${actualPrice}, Expected Price=${expectedPrice}`);

        if (actualPrice !== expectedPrice) {
          return res.status(400).json({ 
            message: `Verification Failed: Your Gamepass price is set to ${actualPrice} R$, but it MUST be exactly ${expectedPrice} R$ to receive ${input.amount} R$.`,
            expected: expectedPrice,
            actual: actualPrice
          });
        }
      } catch (err) {
        console.error("[VERIFY] Roblox API Error:", err);
        return res.status(500).json({ message: "Roblox verification server is busy. Try again in a moment." });
      }

      // Reserve funds from code (so user can't double spend)
      await storage.updatePhantomCodeAmount(phantomCode.id, phantomCode.remainingAmount - input.amount);

      // @ts-ignore
      const userId = req.user.id;
      const order = await storage.createOrder({
        userId,
        amount: input.amount,
        phantomCode: input.phantomCode,
        gamepassUrl: input.gamepassUrl,
        gamepassId,
        expectedPrice,
        actualPrice,
        status: "pending_admin"
      } as any);

      await storage.createNotification({
        userId,
        title: "Request Submitted",
        message: `Your request is now in the Admin Panel queue. (Order #${order.id})`,
        type: "info"
      });

      res.status(201).json(order);
    } catch (error: any) {
      console.error("Create order error:", error);
      if (error?.issues) {
        return res.status(400).json({ message: error.issues?.[0]?.message || "Invalid input" });
      }
      res.status(500).json({ message: "Order creation failed" });
    }
  });app.get(api.orders.list.path, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "غير مصرح لك بالدخول" });
    }
    // @ts-ignore
    const orders = await storage.getOrdersForUser(req.user.id);
    res.json(orders);
  });

  

  // Admin Panel API
  app.get("/api/admin/orders", requireAdmin, async (_req, res) => {
    const orders = await storage.getPendingOrders();
    res.json(orders);
  });

  app.post("/api/admin/orders/:id/approve", requireAdmin, async (req, res) => {
    const orderId = parseInt(req.params.id);
    const order = await storage.getOrderById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    await storage.updateOrderStatus(orderId, "approved", (req.body?.note || null));

    await storage.createNotification({
      userId: order.userId,
      title: "Heist Approved",
      message: `Admin approved your request for ${order.amount} Robux. Enjoy!`,
      type: "success"
    });

    res.json({ success: true });
  });

  app.post("/api/admin/orders/:id/reject", requireAdmin, async (req, res) => {
    const orderId = parseInt(req.params.id);
    const order = await storage.getOrderById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Refund reserved code balance
    const phantom = await storage.getPhantomCode((order as any).phantomCode);
    if (phantom) {
      await storage.updatePhantomCodeAmount(phantom.id, phantom.remainingAmount + order.amount);
    }

    await storage.updateOrderStatus(orderId, "rejected", (req.body?.note || null));

    await storage.createNotification({
      userId: order.userId,
      title: "Heist Rejected",
      message: `Your request was rejected. Your Phantom Code balance was refunded.`,
      type: "error"
    });

    res.json({ success: true });
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

  app.get("/api/notifications", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    // @ts-ignore
    const list = await storage.getNotificationsForUser(req.user.id);
    res.json(list);
  });

  app.post("/api/notifications/:id/read", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.markNotificationAsRead(parseInt(req.params.id));
    res.json({ success: true });
  });

  app.post("/api/codes/purchase", async (req, res) => {
    const { amount, email } = req.body;
    if (!amount || !email) return res.status(400).json({ message: "Missing amount or email" });
    
    if (!stripe) {
      return res.status(500).json({ message: "Payment system not configured (Stripe key missing)" });
    }

    const codeStr = `PHANTOM-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const newCode = await storage.createPhantomCode({
      code: codeStr,
      initialAmount: amount,
      remainingAmount: amount,
      email
    });

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `Phantom Code - ${amount} Robux`,
                description: "Digital Robux redemption code",
              },
              unit_amount: Math.ceil(amount / 100) * 100, // Crude pricing logic, should be mapped properly
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${req.headers.origin}/shop?success=true&code=${codeStr}`,
        cancel_url: `${req.headers.origin}/shop?canceled=true`,
        customer_email: email,
        metadata: {
          codeId: newCode.id.toString(),
          code: codeStr,
        },
      });

      res.json({ url: session.url, code: codeStr });
    } catch (err) {
      console.error("[STRIPE] Checkout error:", err);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  // Stripe webhook to mark code as paid
  app.post("/api/webhooks/stripe", async (req, res) => {
    const sig = req.headers["stripe-signature"];
    if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) return res.sendStatus(400);

    let event;
    try {
      event = stripe!.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown'}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const codeId = session.metadata?.codeId;
      if (codeId) {
        await storage.markPhantomCodeAsPaid(parseInt(codeId));
        console.log(`[STRIPE] Code ${codeId} marked as paid`);
      }
    }

    res.json({ received: true });
  });

  app.post("/api/codes/redeem", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { code, amount } = req.body;
    
    const phantomCode = await storage.getPhantomCode(code);
    if (!phantomCode) return res.status(404).json({ message: "Code not found" });
    if (phantomCode.remainingAmount < amount) return res.status(400).json({ message: "Insufficient balance in code" });

    // Deduct from code and add to user or trigger heist
    await storage.updatePhantomCodeAmount(phantomCode.id, phantomCode.remainingAmount - amount);
    
    res.json({ success: true, remaining: phantomCode.remainingAmount - amount });
  });

  // Ensure stats seeded only if no cookie
  const currentRobux = await storage.getGlobalStat('total_robux');
  if (currentRobux === 0 && !process.env.ROBLOX_COOKIE) {
    await storage.setGlobalStat('total_robux', 1000000);
  }

  return httpServer;
}
