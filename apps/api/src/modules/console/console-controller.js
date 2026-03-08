import { Router } from "express";

export function createConsoleRouter(consoleService) {
  const router = Router();

  router.get("/stream", (_req, res) => {
    consoleService.attachClient(res);
  });

  return router;
}
