import { UserModel, IUser } from "./users.model";
import { QueryBuilder } from "../../core/utils/query-builder";

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

  async listByAgency(agencyId: string, page = 1, limit = 50) {
    return new QueryBuilder(UserModel)
      .where("agencyId", agencyId)
      .sortDesc("createdAt")
      .paginate(page, limit, 100, 50)
      .exec();
  },
};
