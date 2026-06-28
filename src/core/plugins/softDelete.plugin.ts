/* eslint-disable @typescript-eslint/no-explicit-any */
import { Schema } from "mongoose";

export interface SoftDeletable {
  isDeleted: boolean;
  deletedAt?: Date | null;
}

export const softDeletePlugin = (schema: Schema) => {
  schema.add({
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  });

  schema.methods.softDelete = async function () {
    this.isDeleted = true;
    this.deletedAt = new Date();
    return this.save();
  };

  schema.methods.restore = async function () {
    this.isDeleted = false;
    this.deletedAt = null;
    return this.save();
  };

  schema.statics.findNotDeleted = function () {
    return this.find({ isDeleted: false });
  };

  schema.pre(/^find/, function (this: any) {
    if (!this._skipSoftDelete) {
      this.where({ isDeleted: false });
    }
  });

  schema.pre("countDocuments", function (this: any) {
    if (!this._skipSoftDelete) {
      this.where({ isDeleted: false });
    }
  });

  schema.pre("aggregate", function (this: any) {
    if (!this._skipSoftDelete) {
      this.pipeline().unshift({ $match: { isDeleted: false } });
    }
  });
};
