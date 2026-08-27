import { Check } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/_component/card-template";

export default function SubmittedPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 py-8">
      <Card className="w-full max-w-md rounded-xl border-line bg-card text-card-foreground shadow-sm">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-semibold tracking-tight">
            You&apos;re registered!
          </CardTitle>
          <CardDescription className="text-base text-muted">
            Thanks for signing up for the Khao Yai trip. We&apos;ll be in touch
            with details soon.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 pb-8">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50"
            aria-hidden="true"
          >
            <Check className="h-7 w-7 text-success" strokeWidth={2.5} />
          </div>
          <p className="text-center text-sm text-muted">
            You can close this page now.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
