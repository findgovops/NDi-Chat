import { DefaultSession, DefaultUser } from "next-auth";

// https://next-auth.js.org/getting-started/typescript#module-augmentation

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      isAdmin: boolean;
    } & DefaultSession["user"];
  }

  interface Token {
    isAdmin: boolean;
    
  }

  interface User extends DefaultUser{
    isAdmin: boolean;
    
  }
}


declare module "next-auth/jwt" {
  interface JWT extends NextAuthJWT {
    isAdmin?: boolean;
    accessToken?: string;
  }
}