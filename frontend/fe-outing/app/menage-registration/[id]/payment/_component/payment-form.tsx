"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  CheckCircle2,
  // FileImage,
  // Upload,
} from "lucide-react";

import {
  Card,
  CardContent,
} from "@/src/_component/card-template";

import { Button } from "@/src/_component/button";

import {
  getRegistrationPayment,
  createPaymentHistory,
  // uploadPaymentSlip,
} from "@/src/_lib/api/paymentService";

import {
  RegistrationPaymentResponse,
} from "@/src/_lib/api/payment-type";

/* =========================================================
   TYPES
========================================================= */

type PaymentStep =
  | "PAY"
  | "SUBMITTED";

/* =========================================================
   HELPERS
========================================================= */

const formatCurrency = (
  amount: number,
) =>
  new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
  }).format(amount);

/* =========================================================
   PAYMENT PAGE
========================================================= */

export default function PaymentPage() {
  const params = useParams();

  const registrationId =
    params.id as string;

  const [step, setStep] =
    useState<PaymentStep>("PAY");

  const [
    paymentData,
    setPaymentData,
  ] =
    useState<RegistrationPaymentResponse | null>(
      null,
    );

  // const [slip, setSlip] =
  //   useState<File | null>(null);

  const [error, setError] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  /* =======================================================
     LOAD PAYMENT
  ======================================================= */

  useEffect(() => {
    if (!registrationId) return;

    const loadPayment = async () => {
      try {
        setIsLoading(true);
        setError("");

        const result =
          await getRegistrationPayment(
            registrationId,
          );

        setPaymentData(result as unknown as RegistrationPaymentResponse);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load payment information.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadPayment();
  }, [registrationId]);

  /* =======================================================
     SLIP (disabled — no longer required to upload)
  ======================================================= */

  // const handleSlipChange = (
  //   event: React.ChangeEvent<HTMLInputElement>,
  // ) => {
  //   const file =
  //     event.target.files?.[0];
  //
  //   if (!file) return;
  //
  //   if (
  //     file.type !== "image/jpeg" &&
  //     file.type !== "image/png"
  //   ) {
  //     setError(
  //       "Please upload a JPG or PNG image.",
  //     );
  //     return;
  //   }
  //
  //   if (
  //     file.size >
  //     10 * 1024 * 1024
  //   ) {
  //     setError(
  //       "Payment slip must be smaller than 10MB.",
  //     );
  //     return;
  //   }
  //
  //   setError("");
  //   setSlip(file);
  // };

  /* =======================================================
     SUBMIT PAYMENT
  ======================================================= */

  const handleConfirmPayment =
    async () => {
      // if (!slip) {
      //   setError(
      //     "Please upload your payment slip.",
      //   );
      //   return;
      // }

      if (isSubmitting) return;

      try {
        setIsSubmitting(true);
        setError("");

        /*
         * Payment History อาจมีอยู่แล้ว
         */
        let paymentId =
          paymentData?.payment.id ??
          null;

        /*
         * ถ้ายังไม่มี Payment History
         * ให้สร้างก่อน
         */
        if (!paymentId) {
          const created =
            await createPaymentHistory({
              formId:
                registrationId,
            });

          paymentId = created.id;
        }

        /*
         * Upload Slip (disabled — no longer required)
         */
        // await uploadPaymentSlip(
        //   paymentId,
        //   slip,
        // );

        /*
         * สำเร็จ
         */
        setStep("SUBMITTED");
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to submit payment slip.",
        );
      } finally {
        setIsSubmitting(false);
      }
    };

  /* =======================================================
     LOADING
  ======================================================= */

  if (isLoading) {
    return (
      <main className="min-h-screen bg-surface px-4 py-8 text-card-foreground sm:px-6 sm:py-12">
        <div className="mx-auto w-full max-w-xl">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-sm text-muted">
                Loading payment information...
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error && !paymentData) {
    return (
      <main className="min-h-screen bg-surface px-4 py-8 text-card-foreground sm:px-6 sm:py-12">
        <div className="mx-auto w-full max-w-xl">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
                {error}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  if (!paymentData) {
    return null;
  }

  const {
    registration,
    payment,
    paymentCore,
  } =
    paymentData;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="min-h-screen bg-surface px-4 py-8 text-card-foreground sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-xl">

        {/* HEADER */}

        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Payment
          </h1>

          <p className="mt-2 text-sm text-muted">
            Complete your registration payment.
          </p>
        </div>

        {/* PAYMENT */}

        {step === "PAY" && (
          <div className="space-y-4">

            {/* Registration */}

            <Card>
              <CardContent className="p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  Payment for
                </p>

                <div className="mt-3">
                  <p className="text-lg font-semibold">
                    {registration.name}
                  </p>

                  <p className="mt-1 text-sm text-muted">
                    {registration.phone}
                  </p>

                  <p className="mt-2 text-xs text-muted">
                    Registration No.{" "}
                    {
                      registration.registrationNumber
                    }
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Summary */}

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">
                    People
                  </span>

                  <span className="text-sm font-medium">
                    {
                      payment.peopleCount
                    }
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-muted">
                    Price / person
                  </span>

                  <span className="text-sm font-medium">
                    {formatCurrency(
                      paymentCore.amountPerPerson,
                    )}
                  </span>
                </div>

                <div className="mt-4 border-t border-line pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">
                      Total
                    </span>

                    <span className="text-2xl font-bold">
                      {formatCurrency(
                        payment.amount,
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* QR */}

            <Card>
              <CardContent className="p-6 sm:p-8">
                <div className="text-center">

                  <p className="text-sm font-medium text-muted">
                    Scan to Pay
                  </p>

                  <div className="mx-auto mt-5 flex aspect-square w-64 items-center justify-center rounded-2xl border border-line bg-white p-5 shadow-sm">

                    {paymentCore.qrCodeUrl ? (
                      <Image
                        src={
                          paymentCore.qrCodeUrl
                        }
                        alt="Payment QR Code"
                        width={256}
                        height={256}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="text-center">
                        <p className="text-lg font-bold text-black">
                          QR Code
                        </p>

                        <p className="mt-1 text-xs text-black">
                          Payment QR is not available
                        </p>
                      </div>
                    )}

                  </div>

                  <p className="mt-6 text-xs text-muted">
                    Amount to Pay
                  </p>

                  <p className="mt-1 text-4xl font-bold tracking-tight">
                    {formatCurrency(
                      payment.amount,
                    )}
                  </p>

                  <p className="mt-2 text-xs text-muted">
                    Please make sure the amount
                    is correct before transferring.
                  </p>

                </div>
              </CardContent>
            </Card>

            {/* SLIP */}

            <Card>
              <CardContent className="p-6">

                {/*
                <div>
                  <p className="text-sm font-semibold">
                    Payment Slip
                  </p>

                  <p className="mt-1 text-xs text-muted">
                    After making the payment,
                    upload your transfer slip.
                  </p>
                </div>

                <label
                  htmlFor="slip"
                  className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-line bg-surface px-5 py-8 text-center transition-colors hover:border-brand hover:bg-brand/5"
                >
                  {slip ? (
                    <>
                      <FileImage className="h-8 w-8 text-success" />

                      <p className="mt-3 max-w-full truncate text-sm font-medium">
                        {slip.name}
                      </p>

                      <p className="mt-1 text-xs text-muted">
                        Click to replace
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted" />

                      <p className="mt-3 text-sm font-medium">
                        Upload payment slip
                      </p>

                      <p className="mt-1 text-xs text-muted">
                        JPG, PNG up to 10MB
                      </p>
                    </>
                  )}

                  <input
                    id="slip"
                    type="file"
                    accept="image/jpeg,image/png"
                    className="hidden"
                    onChange={
                      handleSlipChange
                    }
                  />
                </label>
                */}

                {error && (
                  <div className="mt-4 rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
                    {error}
                  </div>
                )}

                <Button
                  type="button"
                  onClick={
                    handleConfirmPayment
                  }
                  disabled={
                    isSubmitting
                  }
                  className="mt-5 w-full"
                >
                  {isSubmitting
                    ? "Submitting..."
                    : "Confirm Payment"}
                </Button>

              </CardContent>
            </Card>

          </div>
        )}

        {/* SUBMITTED */}

        {step === "SUBMITTED" && (
          <Card>
            <CardContent className="p-8 text-center sm:p-10">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-soft text-success">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <h2 className="mt-5 text-xl font-bold">
                Payment Submitted
              </h2>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
                Your payment slip has been
                submitted successfully. We will
                verify your payment shortly.
              </p>

              <div className="mt-7 rounded-xl bg-surface p-5 text-left">

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-muted">
                    Name
                  </span>

                  <span className="text-sm font-medium">
                    {registration.name}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-4">
                  <span className="text-sm text-muted">
                    Amount
                  </span>

                  <span className="text-sm font-semibold">
                    {formatCurrency(
                      payment.amount,
                    )}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-4">
                  <span className="text-sm text-muted">
                    Status
                  </span>

                  <span className="rounded-full bg-warning/10 px-3 py-1 text-xs font-semibold text-warning">
                    Pending Verification
                  </span>
                </div>

              </div>

            </CardContent>
          </Card>
        )}

        <p className="mt-6 text-center text-xs text-muted">
          If you have any problems with your payment,
          please contact the event organizer.
        </p>

      </div>
    </main>
  );
}