"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Phone,
  User,
} from "lucide-react";

import {
  Card,
  CardContent,
} from "@/src/_component/card-template";

import { Button } from "@/src/_component/button";

import {
  findByRegistrationNumber,
} from "@/src/_lib/api/registrationService";

import {
  ApiError,
} from "@/src/_lib/api/registration-type";

/* =========================================================
   TYPES
========================================================= */

type ManageRegistrationInput = {
  name: string;
  phone: string;
};

/* =========================================================
   COMPONENT
========================================================= */

export default function ManageRegistration() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  /* =======================================================
     VALIDATE
  ======================================================= */

  const validateForm = (): boolean => {
    setError("");

    if (!name.trim()) {
      setError("Please enter your full name.");
      return false;
    }

    if (!phone.trim()) {
      setError("Please enter your phone number.");
      return false;
    }

    return true;
  };

  /* =======================================================
     FIND REGISTRATION
  ======================================================= */

  const findRegistration = async (
    input: ManageRegistrationInput,
  ) => {
    return findByRegistrationNumber(
      input.name,
      input.phone,
    );
  };

  /* =======================================================
     MANAGE REGISTRATION
  ======================================================= */

  const handleManageRegistration = async () => {
    if (!validateForm()) {
      return;
    }
  
    setIsLoading(true);
    setError("");
  
    try {
      const registration = await findByRegistrationNumber(
        name.trim(),
        phone.trim(),
      );
  
      if (!registration) {
        setError(
          "Registration not found. Please check your name and phone number.",
        );
        return;
      }
  
      router.push(`/menage-registration/${registration.id}`);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        setError(
          "Registration not found. Please check your name and phone number.",
        );
        return;
      }
  
      setError(
        error instanceof Error
          ? error.message
          : "Unable to find your registration. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  /* =======================================================
     CHECK PAYMENT
  ======================================================= */

  const handleCheckPayment = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const registration =
        await findRegistration({
          name: name.trim(),
          phone: phone.trim(),
        });

      router.push(
        `/menage-registration/${registration.id}/payment`,
      );
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.status === 404
      ) {
        setError(
          "Registration not found. Please check your name and phone number.",
        );
        return;
      }

      setError(
        error instanceof Error
          ? error.message
          : "Unable to find your registration. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="min-h-screen bg-surface px-4 py-8 text-card-foreground sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-xl">

        {/* Header */}

        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Manage Registration
          </h1>

          <p className="mt-2 text-sm text-muted">
            Enter the name and phone number used
            during registration.
          </p>
        </div>

        {/* Form */}

        <Card>
          <CardContent className="p-6 sm:p-8">

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
                  <User
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                    aria-hidden="true"
                  />

                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);

                      if (error) {
                        setError("");
                      }
                    }}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    disabled={isLoading}
                    className="w-full rounded-lg border border-line bg-card py-2.5 pl-10 pr-3 text-sm outline-none transition-colors placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand/10 disabled:cursor-not-allowed disabled:opacity-60"
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
                  <Phone
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                    aria-hidden="true"
                  />

                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);

                      if (error) {
                        setError("");
                      }
                    }}
                    placeholder="Enter your phone number"
                    autoComplete="tel"
                    disabled={isLoading}
                    className="w-full rounded-lg border border-line bg-card py-2.5 pl-10 pr-3 text-sm outline-none transition-colors placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Error */}

              {error && (
                <div
                  role="alert"
                  className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger"
                >
                  {error}
                </div>
              )}

              {/* Actions */}

              <div className="space-y-3 pt-2">

                <Button
                  type="button"
                  onClick={
                    handleManageRegistration
                  }
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading
                    ? "Checking..."
                    : "Manage Registration"}
                </Button>

                {/* <Button
                  type="button"
                  variant="outline"
                  onClick={handleCheckPayment}
                  disabled={isLoading}
                  className="w-full"
                >
                  <CreditCard
                    className="h-4 w-4"
                    aria-hidden="true"
                  />

                  Check Payment
                </Button> */}

              </div>
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-muted">
          Please use the same name and phone number
          provided during registration.
        </p>

      </div>
    </main>
  );
}
