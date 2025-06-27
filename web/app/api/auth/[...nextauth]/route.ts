import NextAuth from "next-auth";
import { AuthOptions } from "next-auth";
import GitHub from "next-auth/providers/github";
export const authOptions: AuthOptions = {
  providers: [GitHub({
    clientId: process.env.GITHUB_ID!,
    clientSecret: process.env.GITHUB_SECRET!,
  })],
};
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
