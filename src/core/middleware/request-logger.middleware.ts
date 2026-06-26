import pinoHttp from "pino-http";
import { randomUUID } from "node:crypto";
import { logger } from "../utils/logger";

export const requestLogger = pinoHttp({
  logger,
  genReqId: () => randomUUID(),
  customSuccessMessage: (req, res) => `${req.method} ${req.url} ${res.statusCode}`,
  customReceivedMessage: (req) => `${req.method} ${req.url}`,
});
