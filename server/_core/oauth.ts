import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import { ENV } from "./env";
import { sdk } from "./sdk";
import { getSessionCookieOptions } from "./cookies";

export function registerOAuthRoutes(app: Express) {
  // Simple login endpoint — replaces Manus OAuth
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { username, password } = req.body ?? {};

    if (
      username !== ENV.adminUsername ||
      password !== ENV.adminPassword
    ) {
      res.status(401).json({ error: "Неверный логин или пароль" });
      return;
    }

    try {
      const sessionToken = await sdk.createSessionToken("admin", {
        name: username,
        role: "admin",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      res.json({ success: true });
    } catch (error) {
      console.error("[Auth] Login failed", error);
      res.status(500).json({ error: "Ошибка входа" });
    }
  });
}
