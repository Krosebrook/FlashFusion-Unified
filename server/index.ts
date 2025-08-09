import express from "express";
import { createServer } from "vite";
import { registerRoutes } from "./routes";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
import { RateLimiterMemory } from "rate-limiter-flexible";

// Load environment variables
dotenv.config();

async function startServer() {
  const app = express();

  // Trust proxy (for correct IPs/rate limiting behind proxies)
  app.set("trust proxy", 1);

  // Security + utility middleware
  app.use(
    helmet({
      contentSecurityPolicy: process.env.NODE_ENV === "production" ? undefined : false,
    })
  );

  const allowedOrigins = (process.env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
  app.use(
    cors({
      origin: allowedOrigins.length > 0 ? allowedOrigins : true,
      credentials: true,
    })
  );

  app.use(compression());
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

  // JSON parsing middleware
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));

  // Basic in-memory rate limiter for API routes
  const apiRateLimiter = new RateLimiterMemory({ points: 100, duration: 15 * 60 });
  app.use(async (req, res, next) => {
    // Skip health checks
    if (req.path === "/health") return next();
    // Limit only API and WebSocket HTTP upgrade paths
    if (!req.path.startsWith("/api") && !req.path.startsWith("/ws")) return next();

    try {
      const key = (req.ip || "unknown-ip") + (req.headers["x-user-id"] ? `:${req.headers["x-user-id"]}` : "");
      await apiRateLimiter.consume(key, 1);
      next();
    } catch {
      res.status(429).json({ message: "Too many requests. Please try again later." });
    }
  });

  // Lightweight health endpoint
  app.get("/health", (_req, res) => {
    res.json({
      status: "healthy",
      env: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString(),
    });
  });

  if (process.env.NODE_ENV === "production") {
    // In production, serve the built static files
    app.use(express.static("dist"));
  } else {
    // In development, use Vite's dev server
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.ssrFixStacktrace);
    app.use(vite.middlewares);
  }

  // Setup API routes and WebSocket
  const httpServer = await registerRoutes(app);

  // Global 404 handler (after routes)
  app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.originalUrl} not found` });
  });

  // Global error handler
  app.use((err: any, _req: any, res: any, _next: any) => {
    console.error("Unhandled error:", err);
    res.status(err?.status || 500).json({ message: "Internal server error" });
  });

  const port = parseInt(process.env.PORT || "3000", 10);
  httpServer.listen(port, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://0.0.0.0:${port}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`💾 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
    console.log(`📧 SMS: ${process.env.TWILIO_ACCOUNT_SID ? 'Configured' : 'Not configured'}`);
    console.log(`💳 Stripe: ${process.env.STRIPE_SECRET_KEY ? 'Configured' : 'Not configured'}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});