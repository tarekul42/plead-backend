import { UserModel, IUser } from "./users.model";

export const usersRepository = {
  findByClerkId(clerkId: string) {
    return UserModel.findOne({ clerkId, isActive: true });
  },

  findById(id: string) {
    return UserModel.findById(id);
  },

  create(data: Partial<IUser>) {
    return UserModel.create(data);
  },

  update(clerkId: string, data: Partial<IUser>) {
    return UserModel.findOneAndUpdate({ clerkId }, data, { new: true });
  },

  listByAgency(agencyId: string) {
    return UserModel.find({ agencyId });
  },
};
