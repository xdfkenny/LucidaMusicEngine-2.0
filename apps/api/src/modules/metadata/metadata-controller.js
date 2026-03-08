import { Router } from "express";
import { validateMetadataPayload } from "../../utils/validators.js";

export function createMetadataRouter(metadataService) {
  const router = Router();

  router.post("/enrich", async (req, res, next) => {
    const validation = validateMetadataPayload(req.body);
    if (!validation.ok) {
      return res.status(400).json({ success: false, error: validation.error });
    }

    try {
      const data = await metadataService.enrich(validation.value);
      return res.json({ success: true, data });
    } catch (error) {
      return next(error);
    }
  });

  return router;
}
