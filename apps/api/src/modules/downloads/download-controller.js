import { Router } from "express";
import { validateDownloadPayload } from "../../utils/validators.js";

export function createDownloadRouter(downloadService) {
  const router = Router();

  router.post("/", (req, res) => {
    const validation = validateDownloadPayload(req.body);
    if (!validation.ok) {
      return res.status(400).json({ success: false, error: validation.error });
    }

    const job = downloadService.startDownload(validation.value);

    return res.status(202).json({
      success: true,
      message: "Download queued",
      downloadId: job.id,
      data: job,
    });
  });

  router.get("/", (_req, res) => {
    const jobs = downloadService.list();
    res.json({ success: true, total: jobs.length, data: jobs });
  });

  router.get("/:downloadId", (req, res) => {
    const job = downloadService.getById(req.params.downloadId);
    if (!job) return res.status(404).json({ success: false, error: "Download not found" });
    return res.json({ success: true, data: job });
  });

  router.post("/:downloadId/pause", (req, res) => {
    const job = downloadService.pause(req.params.downloadId);
    if (!job) return res.status(404).json({ success: false, error: "Download not found" });
    return res.json({ success: true, data: job });
  });

  router.post("/:downloadId/resume", (req, res) => {
    const job = downloadService.resume(req.params.downloadId);
    if (!job) return res.status(404).json({ success: false, error: "Download not found" });
    return res.json({ success: true, data: job });
  });

  router.post("/:downloadId/cancel", (req, res) => {
    const job = downloadService.cancel(req.params.downloadId);
    if (!job) return res.status(404).json({ success: false, error: "Download not found" });
    return res.json({ success: true, data: job });
  });

  router.post("/:downloadId/retry", (req, res) => {
    const job = downloadService.retry(req.params.downloadId);
    if (!job) return res.status(404).json({ success: false, error: "Download not found" });
    return res.json({ success: true, data: job });
  });

  router.delete("/cleanup", (req, res) => {
    const olderThan = Number(req.query.olderThan ?? 60 * 60 * 1000);
    const cleaned = downloadService.cleanup(olderThan);
    res.json({ success: true, cleanedCount: cleaned });
  });

  return router;
}
