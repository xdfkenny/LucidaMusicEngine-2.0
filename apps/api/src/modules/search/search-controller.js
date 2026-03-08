import { Router } from "express";
import { validateSearchQuery } from "../../utils/validators.js";

export function createSearchRouter(searchService) {
  const router = Router();

  router.get("/", async (req, res, next) => {
    try {
      const validation = validateSearchQuery(req.query.q);
      if (!validation.ok) {
        return res.status(400).json({ success: false, error: validation.error });
      }

      const results = await searchService.search(validation.value);
      return res.json({
        success: true,
        query: validation.value,
        total: results.length,
        results,
      });
    } catch (error) {
      return next(error);
    }
  });

  router.get("/baka", async (req, res, next) => {
    try {
      const validation = validateSearchQuery(req.query.q);
      if (!validation.ok) {
        return res.status(400).json({ success: false, error: validation.error });
      }

      const service = req.query.service || 'soundcloud';
      const enrich = req.query.enrich !== 'false'; // Default to true if not explicitly disabled
      const results = await searchService.bakaSearch(validation.value, service, enrich);
      return res.json({
        success: true,
        query: validation.value,
        total: results.length,
        results,
      });
    } catch (error) {
      return next(error);
    }
  });

  return router;
}
