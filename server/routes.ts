import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth } from "./replit_integrations/auth";
import { hashPassword, verifyPassword } from "./auth-utils";
import { db } from "./db";
import { users, verificationCodes, insertOrderSchema, notifications, phantomCodes, reviews, orders } from "@shared/schema";
import { eq, sql, and } from "drizzle-orm";
import { sendVerificationEmail, sendOrderApprovedEmail, sendOrderRejectedEmail, sendCodePurchaseEmail, sendCodeActivatedEmail } from "./email-service";


import { getSession } from "./replit_integrations/auth";
import passport from "passport";
import memoize from "memoizee";
import * as client from "openid-client";
import { Strategy as OIDCStrategy, type VerifyFunction } from "openid-client/passport";

function generateVerificationCode(): string {
  return Math.random().toString().substring(2, 8);
}

// ─── In-Memory CAPTCHA Store ─────────────────────────────────────────────────
interface CaptchaEntry { answer: number; expiresAt: number; }
const captchaStore = new Map<string, CaptchaEntry>();
setInterval(() => {
  const now = Date.now();
  for (const [id, entry] of captchaStore.entries()) {
    if (entry.expiresAt < now) captchaStore.delete(id);
  }
}, 60_000);

function generateCaptchaId(): string {
  return Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
}
// ─────────────────────────────────────────────────────────────────────────────

// ─── Phantom Code Brute-Force Guard ─────────────────────────────────────────
interface BruteEntry { attempts: number; lockedUntil: number | null; }
const codeFailures = new Map<string, BruteEntry>();
const LOCK_DURATION_MS = 5 * 60 * 1000;
const MAX_CODE_ATTEMPTS = 5;

function getCodeKey(ip: string): string {
  return `ip:${ip}`;
}

function isCodeLocked(key: string): { locked: boolean; remainingMs: number } {
  const entry = codeFailures.get(key);
  if (!entry || !entry.lockedUntil) return { locked: false, remainingMs: 0 };
  const now = Date.now();
  if (entry.lockedUntil > now) return { locked: true, remainingMs: entry.lockedUntil - now };
  entry.lockedUntil = null;
  entry.attempts = 0;
  return { locked: false, remainingMs: 0 };
}

function recordCodeFailure(key: string): void {
  const entry = codeFailures.get(key) || { attempts: 0, lockedUntil: null };
  entry.attempts += 1;
  if (entry.attempts >= MAX_CODE_ATTEMPTS) {
    entry.lockedUntil = Date.now() + LOCK_DURATION_MS;
  }
  codeFailures.set(key, entry);
}

function resetCodeFailures(key: string): void {
  codeFailures.delete(key);
}
// ─────────────────────────────────────────────────────────────────────────────



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
      req.session.destroy(() => {
        res.clearCookie("connect.sid", {
          path: "/",
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        });
        res.redirect("/");
      });
    });
  });

  // ─── CAPTCHA: Generate a math challenge ───────────────────────────────────
  app.get("/api/auth/captcha", (_req, res) => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    const ops = ["+", "-", "*"] as const;
    const op = ops[Math.floor(Math.random() * ops.length)];
    let answer: number;
    let question: string;
    if (op === "+") { answer = a + b; question = `${a} + ${b}`; }
    else if (op === "-") { const [big, small] = a >= b ? [a, b] : [b, a]; answer = big - small; question = `${big} - ${small}`; }
    else { answer = a * b; question = `${a} × ${b}`; }
    const id = generateCaptchaId();
    captchaStore.set(id, { answer, expiresAt: Date.now() + 5 * 60 * 1000 });
    res.json({ id, question: `${question} = ?` });
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
  // ─── Session & Passport MUST come first ───
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

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
      const { username, email, password, captchaId, captchaAnswer } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // ── CAPTCHA Validation ──────────────────────────────────────────────
      if (!captchaId || captchaAnswer === undefined || captchaAnswer === "") {
        return res.status(400).json({ message: "يرجى حل سؤال التحقق" });
      }
      const captchaEntry = captchaStore.get(captchaId);
      if (!captchaEntry) {
        return res.status(400).json({ message: "رمز التحقق منتهي الصلاحية — يرجى تحديث الصفحة" });
      }
      if (captchaEntry.expiresAt < Date.now()) {
        captchaStore.delete(captchaId);
        return res.status(400).json({ message: "رمز التحقق منتهي الصلاحية — يرجى تحديث الصفحة" });
      }
      if (parseInt(String(captchaAnswer)) !== captchaEntry.answer) {
        captchaStore.delete(captchaId);
        return res.status(400).json({ message: "إجابة التحقق خاطئة" });
      }
      captchaStore.delete(captchaId);
      // ───────────────────────────────────────────────────────────────────

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

      // Generate and send email verification code
      const code = generateVerificationCode();
      await db.insert(verificationCodes).values({
        userId: newUser[0].id,
        code,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      });
      sendVerificationEmail(email, code).catch(() => {});

      res.status(201).json({ 
        success: true,
        needsVerification: true,
        message: "Account created. Please verify your email.",
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
          req.session.save((err) => {
            if (err) {
              console.error("session save error:", err);
              return res.status(500).json({ message: "Session save failed" });
            }
            res.json({ success: true, user: user[0] });
          });
        });
      } else if ((req as any).logIn) {
        (req as any).logIn(user[0], (err: any) => {
          if (err) {
            console.error("req.logIn error:", err);
            return res.status(500).json({ message: "Login failed" });
          }
          req.session.save((err) => {
            if (err) {
              console.error("session save error:", err);
              return res.status(500).json({ message: "Session save failed" });
            }
            res.json({ success: true, user: user[0] });
          });
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

      if (!user[0].isEmailVerified) {
        return res.status(403).json({ message: "Email not verified", userId: user[0].id, needsVerification: true });
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

      if ((req as any).logIn) {
        (req as any).logIn(user[0], (err: any) => {
          if (err) {
            return res.status(500).json({ message: "Login failed" });
          }
          req.session.save((err) => {
            if (err) return res.status(500).json({ message: "Session save failed" });
            res.json({ success: true, user: user[0] });
          });
        });
      } else if (req.login) {
        req.login(user[0], (err) => {
          if (err) {
            return res.status(500).json({ message: "Login failed" });
          }
          req.session.save((err) => {
            if (err) return res.status(500).json({ message: "Session save failed" });
            res.json({ success: true, user: user[0] });
          });
        });
      } else {
        res.json({ success: true, user: user[0] });
      }
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Google Login
  await setupGoogleAuth(app);

  app.post(api.orders.create.path, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Access Denied. You must be logged in." });
    }

    try {
      const input = insertOrderSchema.parse(req.body);

      // ── Brute-Force Guard ────────────────────────────────────────────────
      const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
      const bruteKey = getCodeKey(ip);
      const lockStatus = isCodeLocked(bruteKey);
      if (lockStatus.locked) {
        const mins = Math.ceil(lockStatus.remainingMs / 60000);
        return res.status(429).json({ message: `تم تجاوز عدد المحاولات المسموح بها. يرجى الانتظار ${mins} دقيقة قبل المحاولة مجدداً.` });
      }
      // ────────────────────────────────────────────────────────────────────

      // Phantom Code checks
      const phantomCode = await storage.getPhantomCode(input.phantomCode);
      if (!phantomCode) {
        recordCodeFailure(bruteKey);
        const entry = codeFailures.get(bruteKey);
        const remaining = MAX_CODE_ATTEMPTS - (entry?.attempts || 0);
        const msg = remaining > 0
          ? `Phantom Code not found. ${remaining} attempt(s) left before lockout.`
          : "تم تجاوز عدد المحاولات. حسابك مقفل لمدة 5 دقائق.";
        return res.status(404).json({ message: msg });
      }
      if (!phantomCode.isPaid) {
        recordCodeFailure(bruteKey);
        return res.status(400).json({ message: "This Phantom Code is not paid yet." });
      }
      if (phantomCode.remainingAmount < input.amount) {
        return res.status(400).json({ message: "Insufficient balance in Phantom Code." });
      }
      // Code is valid — reset failure counter
      resetCodeFailures(bruteKey);

      // Extract Gamepass ID — accept full URL or plain numeric ID
      let gamepassId: string | undefined;
      const urlMatch = input.gamepassUrl.match(/game-pass\/(\d+)/);
      if (urlMatch) {
        gamepassId = urlMatch[1];
      } else if (/^\d+$/.test(input.gamepassUrl.trim())) {
        gamepassId = input.gamepassUrl.trim();
      }

      if (!gamepassId) {
        return res.status(400).json({ message: "Invalid Gamepass. Enter a full URL (roblox.com/game-pass/...) or just the numeric ID." });
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
  app.get("/api/admin/orders", async (req, res, next) => {
    // Check for admin session or secret key bypass
    const secretKey = req.query.key || req.headers['x-admin-key'];
    const isBypass = secretKey === (process.env.ADMIN_SECRET || "phantom-admin-secure");
    
    if (!isBypass && (!req.isAuthenticated || !req.isAuthenticated() || !(req.user as any)?.isAdmin)) {
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }
    next();
  }, async (_req, res) => {
    const orders = await storage.getPendingOrders();
    res.json(orders);
  });

  app.post("/api/admin/orders/:id/approve", async (req, res, next) => {
    const secretKey = req.query.key || req.headers['x-admin-key'];
    const isBypass = secretKey === (process.env.ADMIN_SECRET || "phantom-admin-secure");
    if (!isBypass && (!req.isAuthenticated || !req.isAuthenticated() || !(req.user as any)?.isAdmin)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  }, async (req, res) => {
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

    // Send approval email
    const [orderUser] = await db.select().from(users).where(eq(users.id, order.userId)).limit(1);
    if (orderUser?.email) {
      sendOrderApprovedEmail(orderUser.email, orderUser.username, order.amount, req.body?.note || null).catch(() => {});
    }

    res.json({ success: true });
  });

  app.post("/api/admin/orders/:id/reject", async (req, res, next) => {
    const secretKey = req.query.key || req.headers['x-admin-key'];
    const isBypass = secretKey === (process.env.ADMIN_SECRET || "phantom-admin-secure");
    if (!isBypass && (!req.isAuthenticated || !req.isAuthenticated() || !(req.user as any)?.isAdmin)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  }, async (req, res) => {
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

    // Send rejection email
    const [rejectedUser] = await db.select().from(users).where(eq(users.id, order.userId)).limit(1);
    if (rejectedUser?.email) {
      sendOrderRejectedEmail(rejectedUser.email, rejectedUser.username, order.amount, req.body?.note || null).catch(() => {});
    }

    res.json({ success: true });
  });


  app.put("/api/user/profile", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const user = req.user as any;
    const { username, profileImageUrl, currentPassword, newPassword } = req.body;
    const updates: any = { updatedAt: new Date() };

    if (username && username !== user.username) {
      const existing = await db.select().from(users).where(eq(users.username, username)).limit(1);
      if (existing.length > 0 && existing[0].id !== user.id) {
        return res.status(409).json({ message: "Username already taken" });
      }
      updates.username = username;
    }

    if (profileImageUrl !== undefined) {
      updates.profileImageUrl = profileImageUrl || null;
    }

    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ message: "Current password required" });
      if (!user.passwordHash) return res.status(400).json({ message: "No password set (Google account)" });
      const isValid = await verifyPassword(currentPassword, user.passwordHash);
      if (!isValid) return res.status(401).json({ message: "Current password is incorrect" });
      updates.passwordHash = await hashPassword(newPassword);
    }

    if (Object.keys(updates).length === 1) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    const updated = await db.update(users).set(updates).where(eq(users.id, user.id)).returning();

    (req as any).logIn(updated[0], (err: any) => {
      if (err) return res.status(500).json({ message: "Session update failed" });
      req.session.save(() => {
        res.json({ success: true, user: updated[0] });
      });
    });
  });

  app.get(api.users.me.path, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "لم يتم تسجيل الدخول" });
    }
    // Return a clean user object
    const user = req.user as any;
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
      robuxBalance: user.robuxBalance,
      isAdmin: user.isAdmin,
      isEmailVerified: user.isEmailVerified
    });
  });

  app.get(api.stats.getRobuxCounter.path, async (req, res) => {
    const value = await storage.getGlobalStat('total_robux');
    res.json({ value });
  });

  app.get("/api/admin/stats", async (req, res) => {
    const secretKey = req.query.key || req.headers['x-admin-key'];
    const isBypass = secretKey === (process.env.ADMIN_SECRET || "phantom-admin-secure");
    if (!isBypass && (!req.isAuthenticated || !req.isAuthenticated() || !(req.user as any)?.isAdmin)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const { orders: ordersTable } = await import("@shared/schema");
    const { count, eq: eqFn } = await import("drizzle-orm");
    const allOrders = await db.select().from(ordersTable);
    const total = allOrders.length;
    const pending  = allOrders.filter(o => o.status === "pending_admin").length;
    const approved = allOrders.filter(o => o.status === "approved" || o.status === "completed").length;
    const rejected = allOrders.filter(o => o.status === "rejected").length;
    const totalRobux = allOrders.filter(o => o.status !== "rejected").reduce((sum, o) => sum + o.amount, 0);
    res.json({ total, pending, approved, rejected, totalRobux });
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

  // ─── Manual Payment System ───
  // Prices per package in USD
  const PACKAGE_PRICES: Record<number, number> = {
    1000:  8,
    2000:  14,
    3000:  21,
    4000:  26,
    5000:  32,
    6000:  37,
    7000:  42,
    8000:  47,
    9000:  53,
    10000: 59,
  };

  app.post("/api/codes/purchase", async (req, res) => {
    const { amount, email, buyerName } = req.body;
    if (!amount || !email) return res.status(400).json({ message: "Missing amount or email" });

    const price = PACKAGE_PRICES[amount];
    if (!price) return res.status(400).json({ message: "Invalid package amount" });

    const codeStr = `PHANTOM-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    try {
      await storage.createPhantomCode({
        code: codeStr,
        initialAmount: amount,
        remainingAmount: amount,
        email,
        buyerName: buyerName || null,
      });

      console.log(`[PAYMENT] Manual purchase request: code=${codeStr}, amount=${amount}, email=${email}`);

      const paymentInfo = {
        bankName: process.env.PAYMENT_BANK_NAME || "اسم البنك",
        iban: process.env.PAYMENT_IBAN || "SA00 0000 0000 0000 0000 0000",
        accountName: process.env.PAYMENT_ACCOUNT_NAME || "اسم صاحب الحساب",
        stcPay: process.env.PAYMENT_STCPAY || null,
      };

      // Send purchase confirmation email
      sendCodePurchaseEmail(email, buyerName || null, codeStr, amount, price, paymentInfo).catch(() => {});

      res.json({
        code: codeStr,
        amount,
        price,
        email,
        paymentInfo,
      });
    } catch (err) {
      console.error("[PAYMENT] Purchase error:", err);
      res.status(500).json({ message: "Failed to create code" });
    }
  });

  // ─── Admin: List all phantom codes ───
  app.get("/api/admin/codes", async (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated() || !(req.user as any)?.isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const codes = await db.select().from(phantomCodes).orderBy(phantomCodes.createdAt);
    res.json(codes);
  });

  // ─── Admin: Activate a code manually ───
  app.post("/api/admin/codes/:id/activate", async (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated() || !(req.user as any)?.isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const id = parseInt(req.params.id);

    // Fetch code details before activating (to get email & amount)
    const [codeRecord] = await db.select().from(phantomCodes).where(eq(phantomCodes.id, id)).limit(1);

    await storage.markPhantomCodeAsPaid(id);
    console.log(`[PAYMENT] Admin manually activated code id=${id}`);

    // Send activation email to buyer
    if (codeRecord?.email) {
      sendCodeActivatedEmail(
        codeRecord.email,
        codeRecord.buyerName || null,
        codeRecord.code,
        codeRecord.initialAmount
      ).catch(() => {});
    }

    res.json({ success: true });
  });

  // ─── Admin: Reject/Delete a pending code ───
  app.delete("/api/admin/codes/:id", async (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated() || !(req.user as any)?.isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const id = parseInt(req.params.id);
    await db.delete(phantomCodes).where(eq(phantomCodes.id, id));
    console.log(`[PAYMENT] Admin deleted code id=${id}`);
    res.json({ success: true });
  });

  // ─── Reviews: Get all reviews (public) ───
  app.get("/api/reviews", async (req, res) => {
    const all = await db.select().from(reviews).orderBy(reviews.createdAt);
    res.json(all);
  });

  // ─── Reviews: Submit a review ───
  app.post("/api/reviews", async (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ message: "Login required" });
    }
    const userId = (req.user as any).id;
    const username = (req.user as any).username;

    // Check: must have at least one approved order
    const approvedOrders = await db.select().from(orders)
      .where(and(eq(orders.userId, userId), eq(orders.status, "approved")))
      .limit(1);
    if (approvedOrders.length === 0) {
      return res.status(403).json({ message: "You need a completed order to leave a review" });
    }

    // Check: only one review per user
    const existing = await db.select().from(reviews).where(eq(reviews.userId, userId)).limit(1);
    if (existing.length > 0) {
      return res.status(409).json({ message: "You have already submitted a review" });
    }

    const { rating, text } = req.body;

    // Validate rating
    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // Validate text: max 4 words
    if (!text || typeof text !== "string") {
      return res.status(400).json({ message: "Review text is required" });
    }
    const trimmed = text.trim();
    const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
    if (wordCount === 0) {
      return res.status(400).json({ message: "Review text is required" });
    }
    if (wordCount > 4) {
      return res.status(400).json({ message: "Review must be 4 words or less" });
    }

    // Validate: no links
    const linkPattern = /https?:\/\/|www\./i;
    if (linkPattern.test(trimmed)) {
      return res.status(400).json({ message: "Links are not allowed in reviews" });
    }

    const [review] = await db.insert(reviews).values({
      userId,
      username,
      rating: ratingNum,
      text: trimmed,
    }).returning();

    res.json(review);
  });

  app.post("/api/codes/redeem", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { code, amount } = req.body;

    const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
    const bruteKey = getCodeKey(ip);
    const lockStatus = isCodeLocked(bruteKey);
    if (lockStatus.locked) {
      const mins = Math.ceil(lockStatus.remainingMs / 60000);
      return res.status(429).json({ message: `محاولات كثيرة. انتظر ${mins} دقيقة.` });
    }

    const phantomCode = await storage.getPhantomCode(code);
    if (!phantomCode) {
      recordCodeFailure(bruteKey);
      return res.status(404).json({ message: "Code not found" });
    }
    resetCodeFailures(bruteKey);

    if (phantomCode.remainingAmount < amount) return res.status(400).json({ message: "Insufficient balance in code" });

    res.json({ success: true, remaining: phantomCode.remainingAmount - amount });
  });

  return httpServer;
}
