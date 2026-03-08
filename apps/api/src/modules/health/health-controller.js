import { Router } from "express";
import fs from "fs-extra";
import { env } from "../../config/env.js";

export function createHealthRouter() {
  const router = Router();

  router.get("/", async (_req, res) => {
    const downloadsExists = await fs.pathExists(env.downloadsDir);

    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: env.nodeEnv,
      downloadsDir: env.downloadsDir,
      downloadsDirExists: downloadsExists,
    });
  });

  router.get("/ready", (_req, res) => {
    res.json({ status: "ready", timestamp: new Date().toISOString() });
  });

  router.get("/live", (_req, res) => {
    res.json({ status: "alive", timestamp: new Date().toISOString() });
  });

  return router;
}
