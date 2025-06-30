"use client";
import { SessionProvider } from "next-auth/react";
import "./globals.css";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" />
        <title>BugBuddy</title>
      </head>
      <body className="font-sans antialiased bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
        <SessionProvider>
          <div className="min-h-screen relative">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full opacity-20 blur-3xl"></div>
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-yellow-100 to-orange-200 rounded-full opacity-20 blur-3xl"></div>
            </div>
            {children}
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
