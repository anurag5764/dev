"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Resolved() {
  const [resolved, setResolved] = useState<string>("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (resolved) {
      // Redirect to the join page with the resolved parameter
      router.push(`/join?u=${encodeURIComponent("https://meet.jit.si/bugbuddy-postcall")}&resolved=${resolved}`);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-lg py-xl">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-xl md:p-xl flex flex-col items-center">
        <h1 className="text-3xl md:text-4xl font-bold text-ink mb-lg text-center">
          Was your issue resolved?
        </h1>
        
        <form onSubmit={handleSubmit} className="w-full">
          <div className="space-y-4 mb-6">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="resolved"
                value="yes"
                checked={resolved === "yes"}
                onChange={(e) => setResolved(e.target.value)}
                className="w-4 h-4 text-brand-yellow bg-gray-100 border-gray-300 focus:ring-brand-yellow focus:ring-2"
              />
              <span className="text-lg font-medium text-ink">YES</span>
            </label>
            
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="resolved"
                value="no"
                checked={resolved === "no"}
                onChange={(e) => setResolved(e.target.value)}
                className="w-4 h-4 text-brand-yellow bg-gray-100 border-gray-300 focus:ring-brand-yellow focus:ring-2"
              />
              <span className="text-lg font-medium text-ink">NO</span>
            </label>
          </div>
          
          <button
            type="submit"
            disabled={!resolved}
            className="w-full bg-brand-yellow text-ink font-bold rounded-2xl px-lg py-md shadow-lg hover:bg-yellow-400 hover:shadow-xl transition-all duration-200 text-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit
          </button>
        </form>
      </div>
    </main>
  );
} 