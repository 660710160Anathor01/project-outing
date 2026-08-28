"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/src/_component/button";
import { LogOut } from "lucide-react";

export function Logout() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("expiresAt");

    router.replace("/");
  };

  return (
    <Button onClick={handleLogout} variant="danger" size="sm">
      <LogOut className="h-4 w-4" aria-hidden="true" />
      Logout
    </Button>
  );
}
