import { usersRepository } from "./users.repository";
import { IUser } from "./users.model";

export const UsersService = {
  async getByClerkId(clerkId: string): Promise<IUser | null> {
    return usersRepository.findByClerkId(clerkId);
  },

  async getById(id: string): Promise<IUser | null> {
    return usersRepository.findById(id);
  },

  async create(data: Partial<IUser>): Promise<IUser> {
    return usersRepository.create(data);
  },

  async update(clerkId: string, data: Partial<IUser>): Promise<IUser | null> {
    return usersRepository.update(clerkId, data);
  },

  async listByAgency(agencyId: string, page = 1, limit = 50) {
    return usersRepository.listByAgency(agencyId, page, limit);
  },
};
