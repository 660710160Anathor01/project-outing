import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/_component/card-template";

export default function SubmittedPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 p-4">
            <Card className="w-full max-w-md rounded-lg border-2 border-gray-200 text-black shadow-lg">
                <CardHeader>
                    <CardTitle className="text-center text-2xl font-bold">Submitted Complaints</CardTitle>
                    <CardDescription className="text-center">
                        Thank you for your submission. We will get back to you soon.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                        <svg
                            className="h-8 w-8 text-green-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                            aria-hidden="true"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <p className="text-center text-sm text-gray-500">You can close this page now.</p>
                </CardContent>
            </Card>
        </div>
    )
}