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

  schema.pre("save", function (this: any, next) {
    if (this.isNew && !this.createdBy && this._userId) {
      this.createdBy = this._userId;
    }
    if (this.modifiedPaths().length > 0 && this._userId) {
      this.updatedBy = this._userId;
    }
    next();
  });

  schema.pre("findOneAndUpdate", function (this: any, next) {
    const update = this.getUpdate();
    if (update && this._userId) {
      if (update.$set) {
        update.$set.updatedBy = this._userId;
      } else {
        this.setUpdate({ $set: { updatedBy: this._userId }, ...update });
      }
    }
    next();
  });

  schema.methods.setUserId = function (userId: string) {
    this._userId = userId;
    return this;
  };

  schema.statics.setUserIdOnQuery = function (userId: string) {
    this._userId = userId;
    return this;
  };
};
