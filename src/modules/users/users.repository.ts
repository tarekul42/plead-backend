import { UserModel, IUser } from "./users.model";
import { QueryBuilder } from "../../core/utils/query-builder";

export const UsersRepository = {
  findByClerkId(clerkId: string) {
    return UserModel.findOne({ clerkId, isActive: true }).lean();
  },

  findById(id: string) {
    return UserModel.findOne({ _id: id, isActive: true }).lean();
  },

  create(data: Partial<IUser>) {
    return UserModel.create(data);
  },

  update(clerkId: string, data: Partial<IUser>) {
    return UserModel.findOneAndUpdate({ clerkId }, data, { new: true, lean: true });
  },

  updateById(id: string, agencyId: string, data: Partial<IUser>) {
    return UserModel.findOneAndUpdate({ _id: id, agencyId }, data, { new: true, lean: true });
  },

  async listByAgency(agencyId: string, page = 1, limit = 50) {
    return new QueryBuilder(UserModel)
      .where("agencyId", agencyId)
      .where("isActive", true)
      .sortDesc("createdAt")
      .paginate(page, limit, 100, 50)
      .exec();
  },
};
