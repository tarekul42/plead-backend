import { UsersRepository } from "./users.repository";
import { IUser } from "./users.model";

export const UsersService = {
  async getByClerkId(clerkId: string): Promise<IUser | null> {
    return UsersRepository.findByClerkId(clerkId);
  },

  async getById(id: string): Promise<IUser | null> {
    return UsersRepository.findById(id);
  },

  async create(data: Partial<IUser>): Promise<IUser> {
    return UsersRepository.create(data);
  },

  async update(clerkId: string, data: Partial<IUser>): Promise<IUser | null> {
    return UsersRepository.update(clerkId, data);
  },

  async updateById(id: string, agencyId: string, data: Partial<IUser>): Promise<IUser | null> {
    return UsersRepository.updateById(id, agencyId, data);
  },

  async listByAgency(agencyId: string, page = 1, limit = 50) {
    return UsersRepository.listByAgency(agencyId, page, limit);
  },
};
