"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LocationManage } from "./_component/location-manege";



export default function LocationManagePage() {
    const router = useRouter();
    const [checking, setChecking] = useState(true);
  
    useEffect(() => {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");
      // const role = "user";
      console.log("token", token);
      console.log("role", role);
  
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
            <LocationManage />
        </div>
    )
}