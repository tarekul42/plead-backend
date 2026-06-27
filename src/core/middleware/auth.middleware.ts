import { type Request, type Response, type NextFunction } from "express";
import { requireAuth as clerkRequireAuth } from "@clerk/express";
import { UsersService } from "../../modules/users";
import { UnauthorizedError } from "../utils/app-error";
import type { Role } from "../constants";

type AuthRequest = Request & { auth?: { userId?: string } };

interface CachedUser {
  id: string;
  clerkId: string;
  email: string;
  role: Role;
  agencyId: string;
}

const userCache = new Map<string, { user: CachedUser; expiresAt: number }>();
const USER_CACHE_TTL = 5 * 60 * 1000;

function getCachedUser(clerkId: string): CachedUser | undefined {
  const entry = userCache.get(clerkId);
  if (entry && entry.expiresAt > Date.now()) return entry.user;
  userCache.delete(clerkId);
  return undefined;
}

function setCachedUser(clerkId: string, user: CachedUser): void {
  userCache.set(clerkId, { user, expiresAt: Date.now() + USER_CACHE_TTL });
}

function invalidateUser(clerkId: string): void {
  userCache.delete(clerkId);
}

function clearUserCache(): void {
  userCache.clear();
}

export { invalidateUser, clearUserCache };

export const requireAuth = [
  clerkRequireAuth(),
  async (req: AuthRequest, _res: Response, next: NextFunction) => {
    try {
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) throw UnauthorizedError("Invalid token");

      const cached = getCachedUser(clerkUserId);
      if (cached) {
        req.user = cached;
        return next();
      }

      const dbUser = await UsersService.getByClerkId(clerkUserId);
      if (!dbUser || !dbUser.isActive) throw UnauthorizedError("User not found or inactive");

      const userData: CachedUser = {
        id: dbUser._id.toString(),
        clerkId: dbUser.clerkId,
        email: dbUser.email,
        role: dbUser.role,
        agencyId: dbUser.agencyId?.toString() || "",
      };
      setCachedUser(clerkUserId, userData);
      req.user = userData;
      next();
    } catch (err) {
      next(err);
    }
  },
];
