import Link from "next/link";
import Logo from "./components/Logo";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-lg">
      <Logo className="mb-md" />
      <h1 className="text-4xl font-bold text-ink mb-sm text-center">
        Get unstuck in minutes
      </h1>
      <p className="text-gray-700 text-lg mb-lg text-center max-w-xl">
        BugBuddy drops a peer coder into a Zoom call to fix your bug—free,
        friendly, fast.
      </p>
      <Link
        href="/api/auth/signin"
        className="inline-block bg-brand-yellow text-ink font-medium rounded-md px-md py-sm shadow hover:-translate-y-px transition-transform"
      >
        Sign in
      </Link>
    </main>
  );
}
