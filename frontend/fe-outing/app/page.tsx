"use client";

import LoginPage from "./_component/login";
export default function Home() {
  return (
    <div className="relative min-h-screen bg-surface flex justify-center items-center px-3 py-5 sm:px-4 sm:py-8 md:py-12">
      <LoginPage />
    </div>
  );
}
