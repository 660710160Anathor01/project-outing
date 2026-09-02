import { Check } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/_component/card-template";

import Image from "next/image";

export default function SubmittedPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 py-8">
      <Card className="w-full max-w-md rounded-xl border-line bg-card text-card-foreground shadow-sm">
        <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-2xl font-semibold tracking-tight">
        You&apos;re all set! 🎉
      </CardTitle>

      <CardDescription className="text-base text-muted">
        Thanks for signing up for the Khao Yai trip.
        Please make sure to join our LINE group below for trip updates and important information.
      </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 pb-8">
      <Image
        src="/img/lineGroup.jpg"
        alt="Join our LINE group"
        width={280}
        height={280}
      />

      <p className="text-center text-sm text-muted">
        Please make sure to join the group, then you can close this page.
      </p>

        </CardContent>
      </Card>
    </main>
  );
}
