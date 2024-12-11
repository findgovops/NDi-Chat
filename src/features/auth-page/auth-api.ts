import NextAuth, { NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import { Provider } from "next-auth/providers/index";
import { hashValue } from "./helpers";
import { PublicClientApplication } from '@azure/msal-browser';

// const configureIdentityProvider = () => {
//   const providers: Array<Provider> = [];

//   const adminEmails = process.env.ADMIN_EMAIL_ADDRESS?.split(",").map((email) =>
//     email.toLowerCase().trim()
//   );

//   if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
//     providers.push(
//       GitHubProvider({
  //       clientId: process.env.AUTH_GITHUB_ID!,
  //       clientSecret: process.env.AUTH_GITHUB_SECRET!,
  //       async profile(profile) {
  //         const newProfile = {
  //           ...profile,
  //           isAdmin: adminEmails?.includes(profile.email.toLowerCase()),
  //         };
  //         return newProfile;
  //       },
  //     })
  //   );
  // }

  // if (
  //   process.env.AZURE_AD_CLIENT_ID &&
  //   process.env.AZURE_AD_CLIENT_SECRET &&
  //   process.env.AZURE_AD_TENANT_ID
  // ) {
  //   providers.push(
  //     AzureADProvider({
  //       clientId: process.env.AZURE_AD_CLIENT_ID!,
  //       clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
  //       tenantId: process.env.AZURE_AD_TENANT_ID!,
  //       authorization: {
  //         params: {
  //           scope: 'openid profile email offline_access Group.Read.All',
  //         },
  //       },
  //       async profile(profile) {
  //         const newProfile = {
  //           ...profile,
  //           // throws error without this - unsure of the root cause (https://stackoverflow.com/questions/76244244/profile-id-is-missing-in-google-oauth-profile-response-nextauth)
  //           id: profile.sub,
  //           isAdmin:
  //             adminEmails?.includes(profile.email.toLowerCase()) ||
  //             adminEmails?.includes(profile.preferred_username.toLowerCase()),
  //         };
  //         return newProfile;
  //       },
  //     })
  //   );
  // }

  // // If we're in local dev, add a basic credential provider option as well
  // // (Useful when a dev doesn't have access to create app registration in their tenant)
  // // This currently takes any username and makes a user with it, ignores password
  // // Refer to: https://next-auth.js.org/configuration/providers/credentials
  // if (process.env.NODE_ENV === "development") {
  //   providers.push(
  //     CredentialsProvider({
  //       name: "localdev",
  //       credentials: {
  //         username: { label: "Username", type: "text", placeholder: "dev" },
  //         password: { label: "Password", type: "password" },
//         },
//         async authorize(credentials, req): Promise<any> {
//           // You can put logic here to validate the credentials and return a user.
//           // We're going to take any username and make a new user with it
//           // Create the id as the hash of the email as per userHashedId (helpers.ts)
//           const username = credentials?.username || "dev";
//           const email = username + "@netdes.com";
//           const user = {
//             id: hashValue(email),
//             name: username,
//             email: email,
//             isAdmin: false,
//             image: "",
//           };
//           console.log(
//             "=== DEV USER LOGGED IN:\n",
//             JSON.stringify(user, null, 2)
//           );
//           return user;
//         },
//       })
//     );
//   }

//   return providers;
// };

export const options: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
      authorization: {
        params: {
          scope: 'openid profile email offline_access Group.Read.All',
        },
      },
      async profile(profile) {
        const adminEmails = process.env.ADMIN_EMAIL_ADDRESS?.split(",").map((email) =>
          email.toLowerCase().trim()
        );

        const userEmail = profile.email?.toLowerCase().trim();
        const preferredUsername = profile.preferred_username?.toLowerCase().trim();

        const isAdmin =
          adminEmails?.includes(userEmail) ||
          adminEmails?.includes(preferredUsername);

        return {
          ...profile,
          id: profile.sub,
          isAdmin,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account) {
        token.accessToken = account.access_token as string | undefined;
        token.accessTokenExpires = account.expires_at
          ? account.expires_at * 1000
          : null; // Convert to milliseconds
      }
      if (user) {
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.user.isAdmin = token.isAdmin as boolean;
      if (typeof token.accessTokenExpires === "number") {
        session.expires = new Date(token.accessTokenExpires).toISOString();
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60,
    updateAge: 10 * 60,
  },
};
// const msalConfig = {
//   auth: {
//     clientId: process.env.AZURE_AD_CLIENT_ID, // Replace with your Azure AD app's client ID
//     authority: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}`, // Replace with your tenant ID
//     redirectUri: process.env.REDIRECT_URI, // Replace with your redirect URI
//   },
//   cache: {
//     cacheLocation: 'localStorage', // Can be 'localStorage' or 'sessionStorage'
//     storeAuthStateInCookie: false, // Set to true if using IE11 or Edge
//   },
// };


//export const msalInstance = new PublicClientApplication(msalConfig);
export const handlers = NextAuth(options);
