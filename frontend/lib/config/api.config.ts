export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api",
  endpoints: {
    articles: "/articles",
    categories: "/categories",
    tags: "/tags",
  },
} as const;
