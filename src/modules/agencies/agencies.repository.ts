import { AgencyModel, IAgency } from "./agencies.model";

export const AgenciesRepository = {
  async findById(id: string): Promise<IAgency | null> {
    return AgencyModel.findById(id);
  },

  async findBySlug(slug: string): Promise<IAgency | null> {
    return AgencyModel.findOne({ slug });
  },

  async create(data: Partial<IAgency>): Promise<IAgency> {
    return AgencyModel.create(data);
  },

  async update(id: string, data: Partial<IAgency>): Promise<IAgency | null> {
    return AgencyModel.findByIdAndUpdate(id, data, { new: true });
  },
};
