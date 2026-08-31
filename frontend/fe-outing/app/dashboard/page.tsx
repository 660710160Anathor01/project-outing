"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dashboard } from "./_components/dashborad";

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    // const role = "user";

    if (!token || role !== "admin") {
    console.log("token", token);
      router.replace("/");
      return;
    }

    setChecking(false);
  }, [router]);
  
  if (checking) {
    return null;
  }

  return (
    <div className="relative min-h-screen bg-surface px-3 py-4 sm:px-4">
      <Dashboard />
    </div>
  );
}
