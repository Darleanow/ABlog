export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api",
  endpoints: {
    articles: "/articles",
    categories: "/categories",
    comments: "/comments/article",
    tags: "/tags",
    auth: {
      signUp: "/auth/signup",
      signIn: "/auth/signin",
      signOut: "/auth/signout",
    },
    images: {
      upload: "/images/upload",
    },
  },
} as const;
