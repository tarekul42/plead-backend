import { type Request, type Response, type NextFunction } from "express";
import { requireAuth as clerkRequireAuth } from "@clerk/express";
import mongoose from "mongoose";
import { UnauthorizedError } from "../utils/app-error";
import { env } from "../config/env";
import type { Role } from "../constants";

type AuthRequest = Request & { auth?: () => { userId?: string } };

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

async function getOrCreateDefaultAgency(): Promise<string> {
  const { AgencyModel } = await import("../../modules/agencies/agencies.model");
  const agency = await AgencyModel.findOne({}).lean();
  if (agency) return (agency as any)._id.toString();
  const created = await AgencyModel.create({
    name: "Default Agency",
    slug: "default-agency",
    plan: "free",
  });
  return created._id.toString();
}

export const requireAuth = [
  clerkRequireAuth(),
  async (req: AuthRequest, _res: Response, next: NextFunction) => {
    try {
      const clerkUserId = req.auth?.()?.userId;
      if (!clerkUserId) throw UnauthorizedError("Invalid token");

      const cached = getCachedUser(clerkUserId);
      if (cached) {
        req.user = cached;
        return next();
      }

      const { UsersService } = await import("../../modules/users");
      let dbUser = await UsersService.getByClerkId(clerkUserId);

      // Auto-create user on first login if not found in MongoDB
      if (!dbUser) {
        const { createClerkClient } = await import("@clerk/express");
        const clerk = createClerkClient({ secretKey: env.CLERK_SECRET_KEY });
        let email = `${clerkUserId}@clerk.auth`;
        let name = "New User";
        try {
          const clerkUser = await clerk.users.getUser(clerkUserId);
          const primaryEmail = clerkUser.emailAddresses?.find((e: { id: string; emailAddress: string }) => e.id === clerkUser.primaryEmailAddressId);
          if (primaryEmail) email = primaryEmail.emailAddress;
          if (clerkUser.firstName || clerkUser.lastName) {
            name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ");
          }
        } catch {
          // fall back to defaults if Clerk API fails
        }

        const agencyId = await getOrCreateDefaultAgency();
        dbUser = await UsersService.create({
          clerkId: clerkUserId,
          email,
          name,
          role: "agent" as Role,
          agencyId: new mongoose.Types.ObjectId(agencyId),
          isActive: true,
        });
      }

      if (!dbUser.isActive) throw UnauthorizedError("User not found or inactive");

      const agencyIdStr = dbUser.agencyId?.toString() || "";
      if (!agencyIdStr || !mongoose.Types.ObjectId.isValid(agencyIdStr)) {
        throw UnauthorizedError("User account not fully configured — contact support");
      }

      const userData: CachedUser = {
        id: dbUser._id.toString(),
        clerkId: dbUser.clerkId,
        email: dbUser.email,
        role: dbUser.role,
        agencyId: agencyIdStr,
      };
      setCachedUser(clerkUserId, userData);
      req.user = userData;
      next();
    } catch (err) {
      next(err);
    }
  },
];
