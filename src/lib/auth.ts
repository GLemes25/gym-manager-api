import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { openAPI } from "better-auth/plugins";
import { prisma } from "./db.js";

export const auth = betterAuth({
  // 🔥 AGORA FUNCIONA
  secret: process.env.AUTH_SECRET as string,
  baseURL: process.env.AUTH_URL as string,
  trustHost: true,

  trustedOrigins: ["http://localhost:3000"],

  cookies: {
    secure: false,
  },

  emailAndPassword: {
    enabled: true,
  },

  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  plugins: [openAPI()],
});
