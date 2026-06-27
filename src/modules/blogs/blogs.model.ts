import mongoose, { Schema, Document } from "mongoose";

export interface IBlog extends Document {
  agencyId: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  tags: string[];
  authorId: mongoose.Types.ObjectId;
  publishedAt?: Date;
  status: "draft" | "published";
  author?: { _id: unknown; name: string; avatarUrl?: string } | null;
  createdAt: Date;
  updatedAt: Date;
}

const blogSchema = new Schema<IBlog>(
  {
    agencyId: { type: Schema.Types.ObjectId, ref: "Agency", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, lowercase: true },
    content: { type: String, required: true },
    excerpt: { type: String, maxlength: 500 },
    coverImage: { type: String },
    tags: [{ type: String }],
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    publishedAt: { type: Date },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      index: true,
    },
  },
  { timestamps: true },
);

blogSchema.index({ agencyId: 1, status: 1, publishedAt: -1 });
blogSchema.index({ agencyId: 1, slug: 1 }, { unique: true });

export const BlogModel = mongoose.model<IBlog>("Blog", blogSchema);
