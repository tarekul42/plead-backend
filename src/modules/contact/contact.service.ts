import { ContactModel } from "./contact.model";

export const ContactService = {
  async create(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
    propertyId?: string;
  }) {
    return ContactModel.create(data);
  },

  async list(page = 1, limit = 20) {
    const [data, total] = await Promise.all([
      ContactModel.find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      ContactModel.countDocuments(),
    ]);
    return { data, total };
  },
};
