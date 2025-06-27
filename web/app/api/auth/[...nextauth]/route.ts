import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';

if (!process.env.GITHUB_ID || !process.env.GITHUB_SECRET) {
  throw new Error('Missing GITHUB_ID or GITHUB_SECRET environment variables');
}

export const { handlers: { GET, POST } } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
});