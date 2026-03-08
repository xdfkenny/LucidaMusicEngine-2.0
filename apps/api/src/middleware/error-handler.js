import { logger } from "../lib/logger.js";

export function createErrorHandler(consoleService) {
  return function errorHandler(err, req, res, _next) {
    logger.error({ err, path: req.path, method: req.method }, "Unhandled request error");

    consoleService?.emit({
      type: "ERROR",
      category: "Errors",
      level: "error",
      message: `${req.method} ${req.path} ${err.message}`,
      data: { path: req.path, method: req.method, error: err.message },
    });

    res.status(err.statusCode ?? 500).json({
      success: false,
      error: err.publicMessage ?? "Internal server error",
      details: err.message,
    });
  };
}
