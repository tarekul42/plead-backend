import { Request, Response } from "express";
import { asyncHandler } from "../../core/utils/async-handler";
import { success } from "../../core/utils/api-response";
import { env } from "../../core/config/env";

const ACCOUNTS = {
  agent: { email: env.DEMO_AGENT_EMAIL },
  manager: { email: env.DEMO_MANAGER_EMAIL },
  admin: { email: env.DEMO_ADMIN_EMAIL },
} as const;

export const AuthController = {
  demo: asyncHandler(async (req: Request, res: Response) => {
    const { role } = req.body as { role: keyof typeof ACCOUNTS };
    const account = ACCOUNTS[role];
    if (!account) {
      res.status(400).json({ success: false, error: { code: "INVALID_ROLE", message: `Unknown role: ${role}` } });
      return;
    }

    const { createClerkClient } = await import("@clerk/express");
    const clerk = createClerkClient({ secretKey: env.CLERK_SECRET_KEY });

    const result = await clerk.users.getUserList({ emailAddress: [account.email] });
    const user = result.data?.[0];
    if (!user) {
      res.status(404).json({
        success: false,
        error: { code: "DEMO_USER_NOT_FOUND", message: `Demo ${role} not found. Run \`bun run seed\` to create demo accounts.` },
      });
      return;
    }

    const signInToken = await clerk.signInTokens.createSignInToken({
      userId: user.id,
      expiresInSeconds: 60,
    });

    res.json(success({ token: signInToken.token }));
  }),
};
