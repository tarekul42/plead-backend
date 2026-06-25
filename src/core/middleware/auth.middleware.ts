import { clerkClient } from "../config/clerk";
import { asyncHandler } from "../utils/async-handler";
import { UnauthorizedError } from "../utils/app-error";
import { UsersService } from "../../modules/users";

export const requireAuth = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) throw UnauthorizedError("Missing token");
  const token = authHeader.slice(7);

  const clerkUser = await clerkClient.verifyToken(token);
  if (!clerkUser) throw UnauthorizedError("Invalid token");

  const dbUser = await UsersService.getByClerkId(clerkUser.sub);
  if (!dbUser || !dbUser.isActive) throw UnauthorizedError("User not found or inactive");

  req.user = {
    id: dbUser._id.toString(),
    clerkId: dbUser.clerkId,
    email: dbUser.email,
    role: dbUser.role,
    agencyId: dbUser.agencyId.toString(),
  };
  next();
});
