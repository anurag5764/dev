import { TwitterApi } from 'twitter-api-v2';

export async function createTwitterClient() {
    const client = new TwitterApi({
        clientId: process.env.X_CLIENT_ID!,
        clientSecret: process.env.X_CLIENT_SECRET!,
    });
    return client;
}

export async function generateOAuthUrl() {
    const client = await createTwitterClient();

    const authLink = await client.generateOAuth2AuthLink(
        'http://localhost:3000/api/auth/callback/twitter',
        {
            scope: ['tweet.read', 'tweet.write', 'users.read']
        }
    );

    return authLink;
} 