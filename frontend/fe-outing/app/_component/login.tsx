"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Lock,
  MapPinPlus,
  UserRound,
} from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../../src/_component/card-template";

import { Button } from "../../src/_component/button";

import {
  login,
  createLocation,
} from "../../src/_lib/api/registrationService";

import type {
  LoginInput,
  CreateLocationInput,
} from "../../src/_lib/api/registration-type";

import {
  Field,
  FormSection,
  TextInput,
} from "../create/_component/form-fields";

import {
  LocationFormDialog,
  type LocationFormValues,
} from "../manage-locations/_component/location-form-dialog";

import { useAuth } from "./auth-provider";

type FormErrors = Record<string, string>;

type Role = "admin" | "USER";

const emptyForm = (): LoginInput => ({
  userName: "",
  pass: "",
});

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

  /**
   * AuthProvider
   *
   * สำคัญ:
   * หลัง login เราจะเรียก refreshAuth()
   * เพื่อให้ Sidebar render ทันที
   */
  const { refreshAuth } = useAuth();

  const [credentials, setCredentials] =
    useState<LoginInput>(emptyForm);

  const [role, setRole] = useState<Role>("USER");

  const [errors, setErrors] =
    useState<FormErrors>({});

  const [touched, setTouched] =
    useState<Set<string>>(new Set());

  const [submitAttempted, setSubmitAttempted] =
    useState(false);

  const [isPending, startTransition] =
    useTransition();

  /*
   * Location dialog
   */
  const [locationFormOpen, setLocationFormOpen] =
    useState(false);

  const [locationFormError, setLocationFormError] =
    useState<string | null>(null);

  const [isCreatingLocation, setIsCreatingLocation] =
    useState(false);

  const [locationSuccessOpen, setLocationSuccessOpen] =
    useState(false);

  /**
   * Validate individual field
   */
  const validateAndSetField = (
    fieldKey: string,
    form: LoginInput,
  ) => {
    const allErrors = validateForm(form);

    setErrors((prev) => {
      if (allErrors[fieldKey]) {
        return {
          ...prev,
          [fieldKey]: allErrors[fieldKey],
        };
      }

      if (!prev[fieldKey]) {
        return prev;
      }

      const next = { ...prev };

      delete next[fieldKey];

      return next;
    });
  };

  /**
   * Input change
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;

    setCredentials((prev) => {
      const next = {
        ...prev,
        [name]: value,
      };

      if (
        touched.has(name) ||
        submitAttempted
      ) {
        validateAndSetField(name, next);
      } else {
        setErrors((prevErrors) => {
          if (!prevErrors[name]) {
            return prevErrors;
          }

          const nextErrors = {
            ...prevErrors,
          };

          delete nextErrors[name];

          return nextErrors;
        });
      }

      return next;
    });
  };

  /**
   * Input blur
   */
  const handleBlur = (fieldKey: string) => {
    setTouched((prev) => {
      const next = new Set(prev);

      next.add(fieldKey);

      return next;
    });

    validateAndSetField(
      fieldKey,
      credentials,
    );
  };

  /**
   * Clear form
   */
  const handleClear = () => {
    setCredentials(emptyForm());
    setErrors({});
    setTouched(new Set());
    setSubmitAttempted(false);
  };

  /**
   * User flow
   */
  const handleUserLogin = () => {
    setRole("USER");

    router.push("/create");
  };

  /**
   * Switch to admin
   */
  const handleShowAdminForm = () => {
    setRole("admin");

    setErrors({});
    setSubmitAttempted(false);
  };

  /**
   * Switch to user
   */
  const handleShowUserForm = () => {
    setRole("USER");

    setErrors({});
    setSubmitAttempted(false);
  };

  /**
   * Admin login
   *
   * สำคัญ:
   *
   * localStorage
   *      ↓
   * refreshAuth()
   *      ↓
   * AuthProvider update
   *      ↓
   * Sidebar render
   *      ↓
   * dashboard
   */
  const handleAdminSubmit = () => {
    setSubmitAttempted(true);

    const validationErrors =
      validateForm(credentials);

    setErrors(validationErrors);

    /**
     * Validation failed
     */
    if (
      Object.keys(validationErrors).length > 0
    ) {
      const firstInvalid =
        formRef.current?.querySelector<HTMLElement>(
          "[aria-invalid='true']",
        );

      firstInvalid?.focus();

      return;
    }

    startTransition(async () => {
      try {
        /**
         * Call API
         */
        const response =
          await login(credentials);

        /**
         * ตรวจสอบ response
         */
        if (
          !response?.token ||
          response.role !== "admin"
        ) {
          setErrors({
            submit:
              "Invalid username or password.",
          });

          return;
        }

        /**
         * 1. Save token
         */
        localStorage.setItem(
          "token",
          response.token,
        );

        /**
         * 2. Save role
         */
        localStorage.setItem(
          "role",
          response.role,
        );

        /**
         * 3. IMPORTANT
         *
         * แจ้ง AuthProvider ว่า login สำเร็จ
         *
         * ทำให้ Sidebar render ทันที
         * โดยไม่ต้อง refresh browser
         */
        refreshAuth();

        /**
         * 4. Navigate dashboard
         *
         * replace ดีกว่า push สำหรับ login
         * เพราะกด Back แล้วไม่ควรกลับมาหน้า login
         */
        router.replace("/dashboard");

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

  /**
   * Open location dialog
   */
  const handleOpenLocationForm = () => {
    setLocationFormError(null);

    setLocationFormOpen(true);
  };

  /**
   * Location dialog open change
   */
  const handleLocationFormOpenChange = (
    open: boolean,
  ) => {
    setLocationFormOpen(open);

    if (!open) {
      setLocationFormError(null);
    }
  };

  /**
   * Create location
   */
  const handleLocationFormSubmit = (
    values: LocationFormValues,
  ) => {
    setIsCreatingLocation(true);

    setLocationFormError(null);

    createLocation(
      values as CreateLocationInput,
    )
      .then(() => {
        /**
         * Close form
         */
        setLocationFormOpen(false);

        /**
         * Show success dialog
         */
        setLocationSuccessOpen(true);
      })
      .catch((error: Error) => {
        setLocationFormError(
          error.message ||
            "Failed to create the location. Please try again.",
        );
      })
      .finally(() => {
        setIsCreatingLocation(false);
      });
  };

  return (
    <Card className="my-8 w-full max-w-md rounded-xl border-line bg-card text-card-foreground shadow-sm">

      {/* Header */}
      <CardHeader className="space-y-2 pb-4">

        <CardTitle className="text-2xl font-semibold tracking-tight">
          Sign in
        </CardTitle>

        <CardDescription className="text-base text-muted">
          {role === "admin"
            ? "Enter your username and password to access the dashboard."
            : "Continue as a user to start a new registration, or sign in as an admin."}
        </CardDescription>

      </CardHeader>

      {/* Content */}
      <CardContent className="flex flex-col justify-between gap-8">

        {/* Role switch */}
        <div
          role="group"
          aria-label="Sign in as"
          className="flex gap-2 rounded-lg bg-surface p-1"
        >

          <Button
            type="button"
            variant={
              role === "admin"
                ? "primary"
                : "ghost"
            }
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
            variant={
              role === "USER"
                ? "primary"
                : "ghost"
            }
            size="sm"
            className="flex-1"
            aria-pressed={role === "USER"}
            onClick={handleShowUserForm}
            disabled={isPending}
          >
            Login as User
          </Button>

        </div>

        <div>

          {/* ================= USER ================= */}
          {role === "USER" && (
            <form
              ref={formRef}
              onSubmit={(e) => {
                e.preventDefault();
              }}
              className="flex flex-col gap-8"
            >

              <Button
                type="button"
                onClick={handleUserLogin}
              >
                Outing Registration
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleOpenLocationForm}
              >
                <MapPinPlus
                  className="h-4 w-4"
                  aria-hidden="true"
                />

                Suggest a location
              </Button>

            </form>
          )}

          {/* ================= ADMIN ================= */}
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

                {/* Username */}
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
                      onBlur={() =>
                        handleBlur("userName")
                      }
                      error={Boolean(
                        errors.userName,
                      )}
                      describedBy={
                        describedBy
                      }
                      autoComplete="username"
                    />
                  )}
                </Field>

                {/* Password */}
                <Field
                  id="pass"
                  label="Password"
                  required
                  error={errors.pass}
                >
                  {(describedBy) => (
                    <TextInput
                      id="pass"
                      name="pass"
                      type="password"
                      icon={Lock}
                      placeholder="Enter your password"
                      value={credentials.pass}
                      onChange={handleChange}
                      onBlur={() =>
                        handleBlur("pass")
                      }
                      error={Boolean(
                        errors.pass,
                      )}
                      describedBy={
                        describedBy
                      }
                      autoComplete="current-password"
                    />
                  )}
                </Field>

              </FormSection>

              {/* Submit error */}
              {errors.submit && (
                <p
                  role="alert"
                  className="text-sm text-danger"
                >
                  {errors.submit}
                </p>
              )}

              {/* Suggest location */}
              <Button
                type="button"
                variant="outline"
                onClick={handleOpenLocationForm}
              >
                <MapPinPlus
                  className="h-4 w-4"
                  aria-hidden="true"
                />

                Suggest a location
              </Button>

              {/* Footer */}
              <CardFooter className="flex flex-col-reverse gap-3 p-0 sm:flex-row sm:justify-end">

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

                      <ArrowRight
                        className="h-4 w-4"
                        aria-hidden="true"
                      />
                    </>
                  )}
                </Button>

              </CardFooter>

            </form>
          )}

        </div>

      </CardContent>

      {/* ================= LOCATION FORM ================= */}

      <LocationFormDialog
        open={locationFormOpen}
        onOpenChange={
          handleLocationFormOpenChange
        }
        location={null}
        isSubmitting={
          isCreatingLocation
        }
        errorMessage={
          locationFormError ??
          undefined
        }
        onSubmit={
          handleLocationFormSubmit
        }
      />

      {/* ================= SUCCESS ================= */}

      {locationSuccessOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="presentation"
          onClick={() =>
            setLocationSuccessOpen(false)
          }
        >

          <Card
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="location-success-title"
            aria-describedby="location-success-description"
            className="w-full max-w-sm rounded-xl border-line bg-card text-card-foreground shadow-sm"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <CardHeader className="items-center gap-2 pb-2 text-center">

              <CheckCircle2
                className="h-10 w-10 text-green-600 dark:text-green-400"
                aria-hidden="true"
              />

              <CardTitle
                id="location-success-title"
                className="text-lg font-semibold tracking-tight"
              >
                Location suggested
              </CardTitle>

              <CardDescription
                id="location-success-description"
                className="text-base text-muted"
              >
                Thanks! Your location suggestion has
                been submitted for review.
              </CardDescription>

            </CardHeader>

            <CardFooter className="flex justify-center p-0 pt-4">

              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() =>
                  setLocationSuccessOpen(false)
                }
              >
                Close
              </Button>

            </CardFooter>

          </Card>

        </div>
      )}

    </Card>
  );
}
