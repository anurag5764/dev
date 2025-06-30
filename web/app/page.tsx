"use client";
import Logo from "./components/Logo";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-lg py-xl">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-xl md:p-xl flex flex-col items-center">
        <Logo className="mb-xl text-4xl" />
        <h1 className="text-5xl md:text-6xl font-extrabold text-ink mb-lg text-center tracking-tight leading-tight">
          Get unstuck in minutes
        </h1>
        <p className="text-gray-700 text-xl md:text-2xl mb-xl text-center max-w-2xl mx-auto leading-relaxed px-4 md:px-6">
          BugBuddy drops a peer coder into a Zoom call to fix your bug—free, friendly, fast.
        </p>
        <a
          href="/request"
          className="inline-block bg-brand-yellow text-ink font-bold rounded-2xl px-lg py-md shadow-lg hover:bg-yellow-400 hover:shadow-xl transition-all duration-200 text-xl"
        >
          Get help now
        </a>
      </div>
    </main>
  );
}
