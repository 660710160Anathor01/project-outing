"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Lock, UserRound } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../../src/_component/card-template";
import { Button } from "../../src/_component/button";
import { login } from "../../src/_lib/api/registrationService";
import type { LoginInput } from "../../src/_lib/api/registration-type";
import {
  Field,
  FormSection,
  TextInput,
} from "../create/_component/form-fields";

type FormErrors = Record<string, string>;
type Role = "admin" | "USER";

const emptyForm = (): LoginInput => ({
  userName: "",
  pass: "",
});

// Only reached for the admin flow — user login has no fields to validate.
function validateForm(form: LoginInput): FormErrors {
  const errors: FormErrors = {};

  if (!form.userName.trim()) {
    errors.userName = "Username is required";
  }

  if (!form.pass) {
    errors.pass = "Password is required";
  }

  return errors;
}

export default function LoginPage() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const [credentials, setCredentials] = useState<LoginInput>(emptyForm);
  const [role, setRole] = useState<Role>("USER");
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const validateAndSetField = (fieldKey: string, form: LoginInput) => {
    const allErrors = validateForm(form);

    setErrors((prev) => {
      if (allErrors[fieldKey]) {
        return { ...prev, [fieldKey]: allErrors[fieldKey] };
      }
      if (!prev[fieldKey]) return prev;
      const next = { ...prev };
      delete next[fieldKey];
      return next;
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setCredentials((prev) => {
      const next = { ...prev, [name]: value };

      if (touched.has(name) || submitAttempted) {
        validateAndSetField(name, next);
      } else {
        setErrors((prevErrors) => {
          if (!prevErrors[name]) return prevErrors;
          const nextErrors = { ...prevErrors };
          delete nextErrors[name];
          return nextErrors;
        });
      }

      return next;
    });
  };

  const handleBlur = (fieldKey: string) => {
    setTouched((prev) => {
      const next = new Set(prev);
      next.add(fieldKey);
      return next;
    });

    validateAndSetField(fieldKey, credentials);
  };

  const handleClear = () => {
    setCredentials(emptyForm());
    setErrors({});
    setTouched(new Set());
    setSubmitAttempted(false);
  };

  // No credentials needed — just go straight to the create-registration flow.
  const handleUserLogin = () => {
    setRole("USER");
    router.push("/create");
  };

  const handleShowAdminForm = () => {
    setRole("admin");
  };
  const handleShowUserForm = () => {
    setRole("USER");
  };

  const handleAdminSubmit = () => {
    setSubmitAttempted(true);

    const validationErrors = validateForm(credentials);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      const firstInvalid = formRef.current?.querySelector<HTMLElement>(
        "[aria-invalid='true']",
      );
      firstInvalid?.focus();
      return;
    }

    startTransition(async () => {
      try {
        const response = await login(credentials);

        if (response?.token && response?.role === "admin") {
            localStorage.setItem("token", response.token);
            localStorage.setItem("role", response.role);
          
            router.push("/dashboard");
          } else {
            setErrors({ submit: "Invalid username or password." });
          }
          
      } catch (error) {
        setErrors({
          submit:
            error instanceof Error
              ? error.message
              : "Something went wrong. Please try again.",
        });
      }
    });
  };

  return (
    <Card className="w-full max-w-md rounded-xl border-line bg-card text-card-foreground shadow-sm">
      <CardHeader className="space-y-2 pb-4">
        <CardTitle className="text-2xl font-semibold tracking-tight">
          Sign in
        </CardTitle>

        <CardDescription className="text-base text-muted">
          {role === "admin"
            ? "Enter your username and password to access the dashboard."
            : "Continue as a guest to start a new registration, or sign in as an admin."}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-8">
        <div
          role="group"
          aria-label="Sign in as"
          className="flex gap-2 rounded-lg bg-surface p-1"
        >
          <Button
            type="button"
            variant={role === "admin" ? "primary" : "ghost"}
            size="sm"
            className="flex-1"
            aria-pressed={role === "admin"}
            onClick={handleShowAdminForm}
            disabled={isPending}
          >
            Login as Admin
          </Button>
          <Button
            type="button"
            variant={role === "USER" ? "primary" : "ghost"}
            size="sm"
            className="flex-1"
            aria-pressed={role === "USER"}
            onClick={handleShowUserForm}
            disabled={isPending}
          >
            Login as User
          </Button>
        </div>

        {role === "USER" && (
          <form
            ref={formRef}
            onSubmit={(e) => {
              e.preventDefault();
            }}
            className="flex flex-col gap-8"
          >
            <Button onClick={handleUserLogin}>Outing Registration</Button>
          </form>
        )}

        {role === "admin" && (
          <form
            ref={formRef}
            onSubmit={(e) => {
              e.preventDefault();
              handleAdminSubmit();
            }}
            className="flex flex-col gap-8"
            noValidate
          >
            <FormSection title="Admin details">
              <Field
                id="userName"
                label="Username"
                required
                error={errors.userName}
              >
                {(describedBy) => (
                  <TextInput
                    id="userName"
                    name="userName"
                    type="text"
                    icon={UserRound}
                    placeholder="e.g. admin"
                    value={credentials.userName}
                    onChange={handleChange}
                    onBlur={() => handleBlur("userName")}
                    error={Boolean(errors.userName)}
                    describedBy={describedBy}
                    autoComplete="username"
                  />
                )}
              </Field>

              <Field id="pass" label="Password" required error={errors.pass}>
                {(describedBy) => (
                  <TextInput
                    id="pass"
                    name="pass"
                    type="password"
                    icon={Lock}
                    placeholder="Enter your password"
                    value={credentials.pass}
                    onChange={handleChange}
                    onBlur={() => handleBlur("pass")}
                    error={Boolean(errors.pass)}
                    describedBy={describedBy}
                    autoComplete="current-password"
                  />
                )}
              </Field>
            </FormSection>

            {errors.submit && (
              <p role="alert" className="text-sm text-danger">
                {errors.submit}
              </p>
            )}

            <CardFooter className="flex flex-col-reverse gap-3 p-0 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={handleClear}
                disabled={isPending}
              >
                Clear
              </Button>

              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isPending}
                aria-busy={isPending}
                className="w-full sm:w-auto"
              >
                {isPending ? (
                  <>
                    <Loader2
                      className="h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        )}
      </CardContent>
    </Card>
  );
}