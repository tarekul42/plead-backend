import { UserModel, IUser } from "./users.model";

export class UsersRepository {
  async findByClerkId(clerkId: string): Promise<IUser | null> {
    return UserModel.findOne({ clerkId, isActive: true });
  }

  async findById(id: string): Promise<IUser | null> {
    return UserModel.findById(id);
  }

  async create(data: Partial<IUser>): Promise<IUser> {
    return UserModel.create(data);
  }

  async update(clerkId: string, data: Partial<IUser>): Promise<IUser | null> {
    return UserModel.findOneAndUpdate({ clerkId }, data, { new: true });
  }

  async listByAgency(agencyId: string): Promise<IUser[]> {
    return UserModel.find({ agencyId });
  }
}

export const usersRepository = new UsersRepository();
