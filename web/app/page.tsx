"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";
export default function Home() {
  const { data: session } = useSession();
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-lg">
      <h1 className="text-4xl font-bold text-ink mb-sm">BugBuddy</h1>
      {session?.user ? (
        <p>Signed in as {session.user.name ?? "User"}</p>
      ) : (
        <Link
          href="/api/auth/signin"
          className="mt-sm bg-sky-500 text-white font-medium rounded-md px-md py-sm shadow hover:-translate-y-px transition-transform"
        >
          Sign in with GitHub
        </Link>
      )}
      <button className="bg-brand-yellow text-ink font-medium rounded-md px-md py-sm shadow hover:-translate-y-px transition-transform">
        Get Started
      </button>
    </main>
  );
}
