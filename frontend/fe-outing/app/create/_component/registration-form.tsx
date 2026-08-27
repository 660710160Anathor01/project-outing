"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../../../src/_component/card-template";
import { Button } from "../../../src/_component/button";
import { createRegistration } from "../../../src/_lib/api/registrationService";
import { useRouter } from "next/navigation";

type Companion = {
  name: string;
  phone: string;
  relationship: string;
};

type RegistrationFormData = {
  name: string;
  phone: string;
  lineId: string;
  locationId: string;
  companions: Companion[];
  travelOption: "SELF_DRIVE" | "CAR_SHARE" | "PUBLIC_TRANSPORT";
  note: string;
};

type FormErrors = Record<string, string>;

const emptyCompanion = (): Companion => ({
  name: "",
  phone: "",
  relationship: "",
});

const emptyForm = (): RegistrationFormData => ({
  name: "",
  phone: "",
  lineId: "",
  locationId: "",
  companions: [],
  travelOption: "SELF_DRIVE",
  note: "",
});

const PHONE_REGEX = /^[0-9]{9,10}$/;

const validateForm = (form: RegistrationFormData): FormErrors => {
  const errors: FormErrors = {};

  if (!form.name.trim()) errors.name = "Name is required";

  if (!form.locationId) errors.locationId = "Location is required";

  if (!form.phone.trim()) {
    errors.phone = "Phone number is required";
  } else if (!PHONE_REGEX.test(form.phone.trim())) {
    errors.phone = "Enter a valid phone number";
  }

  form.companions.forEach((companion, index) => {
    if (!companion.name.trim()) {
      errors[`companion-${index}-name`] = "Name is required";
    }

    if (!companion.phone.trim()) {
      errors[`companion-${index}-phone`] = "Phone number is required";
    } else if (!PHONE_REGEX.test(companion.phone.trim())) {
      errors[`companion-${index}-phone`] = "Enter a valid phone number";
    }
  });

  return errors;
};

// Drops any key from an errors object whose prefix matches (used when
// companion indices shift after add/remove, so stale errors don't linger
// under the wrong row).
const clearErrorsWithPrefix = (errors: FormErrors, prefix: string): FormErrors => {
  const next: FormErrors = {};
  for (const key of Object.keys(errors)) {
    if (!key.startsWith(prefix)) next[key] = errors[key];
  }
  return next;
};

const clearError = (errors: FormErrors, key: string): FormErrors => {
  if (!errors[key]) return errors;
  const next = { ...errors };
  delete next[key];
  return next;
};

export default function RegistrationForm() {
  const router = useRouter();
  const [regForm, setRegForm] = useState<RegistrationFormData>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setRegForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => clearError(prev, name));
  };

  const handleFollowerChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const count = Math.max(0, parseInt(e.target.value, 10) || 0);

    setRegForm((prev) => {
      const companions = [...prev.companions];

      if (count > companions.length) {
        while (companions.length < count) {
          companions.push(emptyCompanion());
        }
      } else {
        companions.length = count;
      }

      return {
        ...prev,
        companions,
      };
    });
    setErrors((prev) => clearErrorsWithPrefix(prev, "companion-"));
  };

  const handleCompanionChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const { name, value } = e.target;

    setRegForm((prev) => {
      const companions = [...prev.companions];

      companions[index] = {
        ...companions[index],
        [name]: value,
      };

      return {
        ...prev,
        companions,
      };
    });
    setErrors((prev) => clearError(prev, `companion-${index}-${name}`));
  };

  const handleRemoveCompanion = (index: number) => {
    setRegForm((prev) => {
      const companions = [...prev.companions];
      companions.splice(index, 1);

      return {
        ...prev,
        companions,
      };
    });
    setErrors((prev) => clearErrorsWithPrefix(prev, "companion-"));
  };

  const {
    mutate: createRegistrationMutation,
    isPending,
    error,
    isSuccess,
    reset,
  } = useMutation({
    mutationFn: () => createRegistration(regForm),
    onSuccess: () => {
      router.push("/submitted");
    },
  });

  const handleSubmit = () => {
    const newErrors = validateForm(regForm);
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    reset();
    createRegistrationMutation();
  };

  const handleClear = () => {
    reset();
    setErrors({});
    setRegForm(emptyForm());
  };

  // Shared classes: red border when the field has an error, gray otherwise.
  const inputClass = (key: string) =>
    `w-full rounded-md border p-2 ${
      errors[key] ? "border-red-500 focus:border-red-500" : "border-gray-300"
    }`;

  const FieldError = ({ fieldKey }: { fieldKey: string }) =>
    errors[fieldKey] ? (
      <span className="text-sm text-red-500">{errors[fieldKey]}</span>
    ) : null;

  return (
    <div className="flex flex-col items-center justify-center p-4 text-black">
      <Card>
        <CardHeader>
          <CardTitle>Registration Form</CardTitle>
          <CardDescription>
            Register for the Khao Yai trip and let us know your travel
            preferences.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="flex flex-col gap-2"
            noValidate
          >
            <div className="mb-1 flex flex-col gap-2">
              <label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                id="name"
                name="name"
                placeholder="Eg. Many Phrom"
                className={inputClass("name")}
                value={regForm.name}
                onChange={handleChange}
              />
              <FieldError fieldKey="name" />
            </div>

            <div className="mb-1 flex flex-col gap-2">
              <label htmlFor="locationId">
                Location <span className="text-red-500">*</span>
              </label>

              <select
                id="locationId"
                name="locationId"
                className={inputClass("locationId")}
                value={regForm.locationId}
                onChange={handleChange}
              >
                <option value="">Select location</option>
                <option value="1">Khao Yai National Park</option>
                <option value="2">Toscana Valley</option>
                <option value="3">PB Valley Khao Yai Winery</option>
              </select>
              <FieldError fieldKey="locationId" />
            </div>

            <div className="mb-1 flex flex-col gap-2">
              <label htmlFor="follower">Follower</label>

              <input
                type="number"
                id="follower"
                name="follower"
                min={0}
                value={regForm.companions.length}
                onChange={handleFollowerChange}
                className="w-full rounded-md border border-gray-300 p-2"
              />

              {regForm.companions.length > 0 && (
                <div className="flex flex-col gap-3">
                  {regForm.companions.map((companion, index) => (
                    <div
                      key={index}
                      className="mb-1 flex flex-col gap-2 rounded-md border border-gray-200 p-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          Companion {index + 1}{" "}
                          <span className="text-red-500">*</span>
                        </span>

                        <button
                          type="button"
                          className="rounded-md bg-red-500 px-2 py-1 text-sm text-white"
                          onClick={() => handleRemoveCompanion(index)}
                        >
                          Remove
                        </button>
                      </div>

                      <label htmlFor={`companion-${index}-name`}>
                        Name <span className="text-red-500">*</span>
                      </label>

                      <input
                        type="text"
                        id={`companion-${index}-name`}
                        name="name"
                        placeholder="Eg. Many Phrom"
                        className={inputClass(`companion-${index}-name`)}
                        value={companion.name}
                        onChange={(e) =>
                          handleCompanionChange(e, index)
                        }
                      />
                      <FieldError fieldKey={`companion-${index}-name`} />

                      <label htmlFor={`companion-${index}-phone`}>
                        Phone <span className="text-red-500">*</span>
                      </label>

                      <input
                        type="text"
                        id={`companion-${index}-phone`}
                        name="phone"
                        placeholder="Eg. 0812345678"
                        className={inputClass(`companion-${index}-phone`)}
                        value={companion.phone}
                        onChange={(e) =>
                          handleCompanionChange(e, index)
                        }
                      />
                      <FieldError fieldKey={`companion-${index}-phone`} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-1 flex flex-col gap-2">
              <label htmlFor="lineId">
                Line <span className="text-sm text-gray-500">(Optional)</span>
              </label>

              <input
                type="text"
                id="lineId"
                name="lineId"
                className="w-full rounded-md border border-gray-300 p-2"
                value={regForm.lineId}
                onChange={handleChange}
              />
            </div>

            <div className="mb-1 flex flex-col gap-2">
              <label htmlFor="phone">
                Phone Number <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                id="phone"
                name="phone"
                placeholder="Eg. 0812345678"
                className={inputClass("phone")}
                value={regForm.phone}
                onChange={handleChange}
              />
              <FieldError fieldKey="phone" />
            </div>

            <div className="mb-1 flex flex-col gap-2">
              <label htmlFor="travelOption">Travel Option</label>

              <select
                id="travelOption"
                name="travelOption"
                className="w-full rounded-md border border-gray-300 p-2"
                value={regForm.travelOption}
                onChange={handleChange}
              >
                <option value="SELF_DRIVE">Self Drive</option>
                <option value="CAR_SHARE">Car Share</option>
                <option value="PUBLIC_TRANSPORT">Public Transport</option>
              </select>
            </div>

            <div className="mb-1 flex flex-col gap-2">
              <label htmlFor="note">Note <span className="text-sm text-gray-500">(Optional)</span></label>

              <textarea
                id="note"
                name="note"
                placeholder="(Optional)"
                className="w-full rounded-md border border-gray-300 p-2"
                value={regForm.note}
                onChange={(e) =>
                  setRegForm((prev) => ({
                    ...prev,
                    note: e.target.value,
                  }))
                }
              />
            </div>

            {error && (
              <div className="mt-2 rounded-md bg-red-50 p-3 text-sm text-red-600">
                Error: {error.message}
              </div>
            )}

            {isSuccess && (
              <div className="mt-2 rounded-md bg-green-50 p-3 text-sm text-green-600">
                Registration successful
              </div>
            )}

            <CardFooter className="mt-4 flex justify-end gap-2 p-0 pt-2">
              <Button
                variant="secondary"
                size="md"
                className="rounded-md bg-gray-500 p-2 text-white" onClick={handleClear}
              >
                Clear
              </Button>

              <Button
                variant="primary"
                size="md"
                className="rounded-md bg-blue-500 p-2 text-white"
                disabled={isPending}
              >
                {isPending ? "Submitting..." : "Submit"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}