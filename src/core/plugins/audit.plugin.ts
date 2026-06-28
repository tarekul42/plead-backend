/* eslint-disable @typescript-eslint/no-explicit-any */
import { Schema } from "mongoose";

export interface Auditable {
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

export const auditPlugin = (schema: Schema) => {
  schema.add({
    createdBy: { type: String, default: null },
    updatedBy: { type: String, default: null },
  });

  schema.pre("save", function (this: any) {
    if (this.isNew && !this.createdBy && this._userId) {
      this.createdBy = this._userId;
    }
    if (this.modifiedPaths().length > 0 && this._userId) {
      this.updatedBy = this._userId;
    }
  });

  schema.pre("findOneAndUpdate", function (this: any) {
    const update = this.getUpdate();
    if (update && this._userId) {
      if (update.$set) {
        update.$set.updatedBy = this._userId;
      } else {
        this.setUpdate({ $set: { updatedBy: this._userId }, ...update });
      }
    }
  });

  schema.methods.setUserId = function (userId: string) {
    this._userId = userId;
    return this;
  };

  schema.statics.setUserIdOnQuery = function (this: any, userId: string) {
    this._userId = userId;
    return this;
  };
};
