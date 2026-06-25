import { z } from "zod";

export const createBlogSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  excerpt: z.string().max(500).optional(),
  coverImage: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(["draft", "published"]).optional(),
});

export const updateBlogSchema = createBlogSchema.partial();
