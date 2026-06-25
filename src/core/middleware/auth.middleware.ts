import { requireAuth as clerkRequireAuth } from "@clerk/express";
import { UsersService } from "../../modules/users";
import { UnauthorizedError } from "../utils/app-error";

export const requireAuth = [
  clerkRequireAuth(),
  async (req: any, _res: any, next: any) => {
    const clerkUserId = req.auth?.userId;
    if (!clerkUserId) throw UnauthorizedError("Invalid token");

    const dbUser = await UsersService.getByClerkId(clerkUserId);
    if (!dbUser || !dbUser.isActive) throw UnauthorizedError("User not found or inactive");

    req.user = {
      id: dbUser._id.toString(),
      clerkId: dbUser.clerkId,
      email: dbUser.email,
      role: dbUser.role,
      agencyId: dbUser.agencyId.toString(),
    };
    next();
  },
];
