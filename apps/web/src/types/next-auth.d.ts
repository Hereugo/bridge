import "next-auth";

declare module "next-auth" {
  interface Session {
    apiToken?: string;
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
  }

  interface User {
    apiToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    apiToken?: string;
  }
}
