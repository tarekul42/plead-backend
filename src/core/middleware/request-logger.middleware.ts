import pinoHttp from "pino-http";
import { randomUUID } from "node:crypto";
import { logger } from "../utils/logger";

interface RequestWithUser {
  user?: { id?: string; clerkId?: string; agencyId?: string };
}

export const requestLogger = pinoHttp({
  logger,
  genReqId: () => randomUUID(),
  customSuccessMessage: (req, res) => `${req.method} ${req.url} ${res.statusCode}`,
  customReceivedMessage: (req) => `${req.method} ${req.url}`,
  customProps: (req) => {
    const r = req as unknown as RequestWithUser;
    return {
      userId: r.user ? r.user.id || r.user.clerkId : undefined,
      agencyId: r.user ? r.user.agencyId : undefined,
    };
  },
});
