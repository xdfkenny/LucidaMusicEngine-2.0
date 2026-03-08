import cors from "cors";
import express from "express";
import fs from "fs-extra";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";
import { createErrorHandler } from "./middleware/error-handler.js";
import { notFoundHandler } from "./middleware/not-found.js";
import { createConsoleRouter } from "./modules/console/console-controller.js";
import { ConsoleService } from "./modules/console/console-service.js";
import { DownloadService } from "./modules/downloads/download-service.js";
import { createDownloadRouter } from "./modules/downloads/download-controller.js";
import { createFilesRouter } from "./modules/files/files-controller.js";
import { createHealthRouter } from "./modules/health/health-controller.js";
import { createMetadataRouter } from "./modules/metadata/metadata-controller.js";
import { MetadataService } from "./modules/metadata/metadata-service.js";
import { createSearchRouter } from "./modules/search/search-controller.js";
import { SearchService } from "./modules/search/search-service.js";

const app = express();
const consoleService = new ConsoleService({ bufferSize: 2000 });
const metadataService = new MetadataService({ consoleService });
const searchService = new SearchService({ consoleService, metadataService });
const downloadService = new DownloadService({ consoleService });
const searchRouter = createSearchRouter(searchService);
const downloadRouter = createDownloadRouter(downloadService);
const filesRouter = createFilesRouter(downloadService);
const metadataRouter = createMetadataRouter(metadataService);
const healthRouter = createHealthRouter();
const consoleRouter = createConsoleRouter(consoleService);

consoleService.setStatusProvider(() => downloadService.getStatusSummary());
consoleService.startStatusHeartbeat();

await fs.ensureDir(env.downloadsDir);

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const start = Date.now();
  consoleService.emit({
    type: "API_REQUEST",
    category: "API",
    level: "info",
    message: `${req.method} ${req.originalUrl}`,
    data: { method: req.method, path: req.originalUrl },
  });

  res.on("finish", () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const level = status >= 500 ? "error" : status >= 400 ? "warning" : "success";
    consoleService.emit({
      type: "API_RESPONSE",
      category: "API",
      level,
      message: `${req.method} ${req.originalUrl} ${status} (${duration}ms)`,
      data: { method: req.method, path: req.originalUrl, status, duration },
    });
  });

  next();
});

app.use("/api/search", searchRouter);
app.use("/api/downloads", downloadRouter);
app.use("/api/files", filesRouter);
app.use("/api/metadata", metadataRouter);
app.use("/api/health", healthRouter);
app.use("/api/console", consoleRouter);

app.use("/search", searchRouter);
app.use("/lucidadw", downloadRouter);

app.get("/status/:downloadId", (req, res) => {
  const job = downloadService.getById(req.params.downloadId);
  if (!job) return res.status(404).json({ success: false, error: "Download not found" });
  return res.json(job);
});

app.get("/downloads", async (_req, res, next) => {
  try {
    const data = await downloadService.listDownloadsTree();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

app.use(notFoundHandler);
app.use(createErrorHandler(consoleService));

app.listen(env.port, () => {
  logger.info({ port: env.port }, "Lucida API v2 running");
  consoleService.emit({
    type: "SYSTEM_STATUS",
    category: "System",
    level: "success",
    message: `Backend online on port ${env.port}`,
    data: { port: env.port },
  });
});
