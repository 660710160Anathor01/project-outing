"use client";

import { useState } from "react";
import {
  CheckCircle2,
  CreditCard,
  FileImage,
  Phone,
  User,
  Upload,
} from "lucide-react";

import { Card, CardContent } from "@/src/_component/card-template";
import { Button } from "@/src/_component/button";

/* =========================================================
   TYPES
========================================================= */

type PaymentStep = "CHECK" | "PAY" | "SUBMITTED";

type RegistrationPayment = {
  id: string;
  name: string;
  phone: string;
  amount: number;
};

/* =========================================================
   HELPERS
========================================================= */

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
  }).format(amount);

/* =========================================================
   PAYMENT PAGE
========================================================= */

export default function PaymentPage() {
  const [step, setStep] =
    useState<PaymentStep>("CHECK");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [payment, setPayment] =
    useState<RegistrationPayment | null>(
      null,
    );

  const [slip, setSlip] =
    useState<File | null>(null);

  const [error, setError] =
    useState("");

  /* =======================================================
     CHECK REGISTRATION
  ======================================================= */

  const handleCheckPayment = () => {
    setError("");

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    /*
     * TODO:
     * Replace this mock data with API call.
     *
     * Example:
     *
     * const result =
     *   await getRegistrationForPayment({
     *     name,
     *     phone,
     *   });
     */

    setPayment({
      id: "REG-001",
      name: name.trim(),
      phone: phone.trim(),
      amount: 2500,
    });

    setStep("PAY");
  };

  /* =======================================================
     SLIP
  ======================================================= */

  const handleSlipChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    setSlip(file);
  };

  /* =======================================================
     SUBMIT PAYMENT
  ======================================================= */

  const handleConfirmPayment = () => {
    if (!slip) {
      setError(
        "Please upload your payment slip.",
      );
      return;
    }

    setError("");

    /*
     * TODO:
     * Upload slip + update payment status
     * through API.
     */

    setStep("SUBMITTED");
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="min-h-screen bg-surface px-4 py-8 text-card-foreground sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Payment
          </h1>

          <p className="mt-2 text-sm text-muted">
            Complete your registration payment.
          </p>
        </div>

        {/* =================================================
            STEP 1 — CHECK
        ================================================= */}

        {step === "CHECK" && (
          <Card>
            <CardContent className="p-6 sm:p-8">

              <div className="mb-7 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-brand">
                  <CreditCard className="h-6 w-6" />
                </div>

                <h2 className="mt-4 text-lg font-semibold">
                  Check your payment
                </h2>

                <p className="mt-1 text-sm text-muted">
                  Enter the same name and phone
                  number used during registration.
                </p>
              </div>

              <div className="space-y-5">

                {/* Full Name */}

                <div>
                  <label
                    htmlFor="name"
                    className="mb-1.5 block text-sm font-medium"
                  >
                    Full Name
                  </label>

                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) =>
                        setName(e.target.value)
                      }
                      placeholder="Enter your full name"
                      className="w-full rounded-lg border border-line bg-card py-2.5 pl-10 pr-3 text-sm outline-none transition-colors placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand/10"
                    />
                  </div>
                </div>

                {/* Phone */}

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-1.5 block text-sm font-medium"
                  >
                    Phone Number
                  </label>

                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) =>
                        setPhone(e.target.value)
                      }
                      placeholder="Enter your phone number"
                      className="w-full rounded-lg border border-line bg-card py-2.5 pl-10 pr-3 text-sm outline-none transition-colors placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand/10"
                    />
                  </div>
                </div>

                {/* Error */}

                {error && (
                  <div className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
                    {error}
                  </div>
                )}

                <Button
                  type="button"
                  onClick={handleCheckPayment}
                  className="w-full"
                >
                  Check Payment
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* =================================================
            STEP 2 — PAYMENT
        ================================================= */}

        {step === "PAY" &&
          payment && (
            <div className="space-y-4">

              {/* Registration */}

              <Card>
                <CardContent className="p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted">
                    Payment for
                  </p>

                  <div className="mt-3">
                    <p className="text-lg font-semibold">
                      {payment.name}
                    </p>

                    <p className="mt-1 text-sm text-muted">
                      {payment.phone}
                    </p>
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
                      {/*
                       * TODO:
                       * Replace this placeholder with
                       * actual PromptPay QR image.
                       */}

                      <div className="flex h-full w-full items-center justify-center border-4 border-black">
                        <div className="text-center">
                          <p className="text-2xl font-black text-black">
                            QR
                          </p>

                          <p className="mt-1 text-xs text-black">
                            PROMPTPAY
                          </p>
                        </div>
                      </div>
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

              {/* Slip */}

              <Card>
                <CardContent className="p-6">

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
                    className="mt-5 w-full"
                  >
                    Confirm Payment
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

        {/* =================================================
            STEP 3 — SUBMITTED
        ================================================= */}

        {step === "SUBMITTED" &&
          payment && (
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
                      {payment.name}
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

        {/* =================================================
            FOOTER
        ================================================= */}

        <p className="mt-6 text-center text-xs text-muted">
          If you have any problems with your payment,
          please contact the event organizer.
        </p>
      </div>
    </main>
  );
}
