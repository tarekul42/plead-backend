import { Schema } from "mongoose";

export const baseSchema = new Schema(
  {
    agencyId: { type: Schema.Types.ObjectId, ref: "Agency", required: true, index: true },
  },
  { timestamps: true },
);
