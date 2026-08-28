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

    if (!token || role !== "admin") {
      router.replace("/");
      return;
    }

    setChecking(false);
  }, [router]);

  // ป้องกัน Dashboard โผล่แวบหนึ่งก่อนตรวจสอบเสร็จ
  if (checking) {
    return null;
  }

  return (
    <div className="bg-surface p-8">
      <Dashboard />
    </div>
  );
}
