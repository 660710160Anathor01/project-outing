"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dashboard } from "./_components/dashborad";
import { Logout } from "../_component/logout";

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
    <div className="relative min-h-screen bg-surface px-3 py-5 sm:px-4 sm:py-8 md:py-12">
        <div className="flex justify-end mb-4">
            <Logout />
        </div>
      <Dashboard />
    </div>
  );
}
