export interface BlogResponse {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  tags: string[];
  authorId: string;
  publishedAt?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}
