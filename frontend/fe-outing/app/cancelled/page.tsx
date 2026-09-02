import { X } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/_component/card-template";

export default function CancelledPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 py-8">
      <Card className="w-full max-w-md rounded-xl border-line bg-card text-card-foreground shadow-sm">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Your registration has been cancelled.
          </CardTitle>
          <CardDescription className="text-base text-muted">
            We&apos;re sorry to inform you that your registration has been cancelled.
            If you have any questions, please contact us.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 pb-8">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50"
            aria-hidden="true"
          >
            <X className="h-7 w-7 text-error" strokeWidth={2.5} />
          </div>
          <p className="text-center text-sm text-muted">
            Please contact us if you have any questions.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
