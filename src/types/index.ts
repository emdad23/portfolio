export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  readTime: number;
  publishedAt: Date | null;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  type: "hiring" | "junior";
  read: boolean;
  createdAt: Date;
}
