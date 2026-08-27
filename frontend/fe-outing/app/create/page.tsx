import type { Metadata } from "next";
import RegistrationForm from "./_component/registration-form";

export const metadata: Metadata = {
  title: "Register — Khao Yai Trip",
  description: "Sign up for the Khao Yai outing and share your travel preferences.",
};

export default function CreateRegistration() {
  return (
    <main className="relative min-h-screen bg-surface px-3 py-5 sm:px-4 sm:py-8 md:py-12">
      <div className="mx-auto w-full max-w-4xl">
        <RegistrationForm />
      </div>
  </main>
  );
}
