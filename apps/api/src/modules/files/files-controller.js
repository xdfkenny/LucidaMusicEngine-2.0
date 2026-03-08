import path from "node:path";
import fs from "fs-extra";
import { Router } from "express";
import { env } from "../../config/env.js";
import { pickCoverFile } from "./library-cache.js";

export function createFilesRouter(downloadService) {
  const router = Router();

  router.get("/", async (_req, res, next) => {
    try {
      const tree = await downloadService.listDownloadsTree();
      res.json({ success: true, data: tree, total: tree.length });
    } catch (error) {
      next(error);
    }
  });

  router.get("/album", async (req, res, next) => {
    try {
      const artist = String(req.query.artist ?? "");
      const album = String(req.query.album ?? "");

      if (!artist || !album) {
        return res.status(400).json({ success: false, error: "Artist and album are required" });
      }

      const data = await downloadService.getAlbumDetail(artist, album);
      if (!data) {
        return res.status(404).json({ success: false, error: "Album not found" });
      }

      return res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  });

  router.get("/cover", async (req, res) => {
    const artist = String(req.query.artist ?? "");
    const album = String(req.query.album ?? "");

    if (!artist || !album) {
      return res.status(400).json({ success: false, error: "Artist and album are required" });
    }

    const baseDir = env.downloadsDir;
    const albumPath = path.resolve(baseDir, artist, album);
    if (!albumPath.startsWith(baseDir)) {
      return res.status(400).json({ success: false, error: "Invalid cover path" });
    }

    if (!await fs.pathExists(albumPath)) {
      return res.status(404).json({ success: false, error: "Album not found" });
    }

    const files = await fs.readdir(albumPath);
    const coverFile = pickCoverFile(files);
    if (!coverFile) {
      return res.status(404).json({ success: false, error: "Cover not found" });
    }

    return res.sendFile(path.join(albumPath, coverFile));
  });

  return router;
}
