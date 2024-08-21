import { createHash } from "crypto";
import { getServerSession } from "next-auth";
import { RedirectToPage } from "../common/navigation-helpers";
import { isRedirectError, redirect} from "next/dist/client/components/redirect";
import { options } from "./auth-api";



export const userSession = async (): Promise<UserModel | null> => {
  const session = await getServerSession(options);
  if (session && session.user) {
    return {
      name: session.user.name!,
      image: session.user.image!,
      email: session.user.email!,
      isAdmin: session.user.isAdmin!,
    };
  }

  return null;
};

export const getCurrentUser = async (): Promise<UserModel> => {
  const user = await userSession();
  if (user) {
    return user;
  }
  throw new Error("User not found");
};

export const userHashedId = async (): Promise<string> => {
  const user = await userSession();
  if (user) {
    return hashValue(user.email);
  }

  throw new Error("User not found");
};

export const hashValue = (value: string): string => {
  const hash = createHash("sha256");
  hash.update(value);
  return hash.digest("hex");
};

export const redirectIfAuthenticated = async () => {
  try {
    const user = await userSession();
    if (user) {
      redirect("chat");  // This will throw an error that needs to be caught 
    }   
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;  // Re-throw the redirect error to stop further execution
    } else {
      console.error("Unexpected error during authentication redirect:", error);
    }
  }
};

export type UserModel = {
  name: string;
  image: string;
  email: string;
  isAdmin: boolean;
};
