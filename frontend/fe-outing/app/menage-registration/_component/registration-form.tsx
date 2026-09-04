"use client";

import { useCallback, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Ban,
  Car,
  Loader2,
  MessageCircle,
  Phone,
  Plus,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../../../src/_component/card-template";
import { Button } from "../../../src/_component/button";
import {
  cancelRegistrationByRegistrationNumber,
  getLocations,
  updateRegistrationByRegistrationNumber,
} from "../../../src/_lib/api/registrationService";
import {
  ApiError,
  type CompanionInput,
  type Registration,
} from "../../../src/_lib/api/registration-type";
import {
  ErrorSummary,
  Field,
  FormSection,
  RadioCardGroup,
  TextArea,
  TextInput,
  type RadioCardOption,
} from "./form-fields";
import ConformationDialog from "./conformation-dialog";

type Companion = {
  id: string;
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
  travelOption: "SELF_DRIVE" | "CAR_SHARE";
  carShare?: boolean;
  emptySeats?: number;
  address?: string;
  note: string;
};

type FormErrors = Record<string, string>;

const MAX_COMPANIONS = 10;
const MAX_NOTE_LENGTH = 1000;
const PHONE_REGEX = /^0\d{8,9}$/;

const TRAVEL_OPTIONS: RadioCardOption[] = [
  {
    value: "SELF_DRIVE",
    label: "Self drive",
    description: "I'll drive my own car to the destination.",
    icon: Car,
  },
  {
    value: "CAR_SHARE",
    label: "Car share",
    description: "Happy to share a ride with other attendees.",
    icon: Users,
  },
];

const FIELD_FOCUS_ORDER = [
  "locationId",
  "name",
  "phone",
  "lineId",
  "travelOption",
  "emptySeats",
  "address",
  "note",
] as const;

const emptyCompanion = (): Companion => ({
  id: crypto.randomUUID(),
  name: "",
  phone: "",
  relationship: "",
});

const companionFromInput = (
  companion: CompanionInput,
): Companion => ({
  id: crypto.randomUUID(),
  name: companion.name ?? "",
  phone: companion.phone ?? "",
  relationship: companion.relationship ?? "",
});

const formFromRegistration = (
  registration: Registration,
): RegistrationFormData => ({
  name: registration.name ?? "",
  phone: registration.phone ?? "",
  lineId: registration.lineId ?? "",
  locationId: registration.locationId ?? "",
  companions: (registration.companions ?? []).map(
    companionFromInput,
  ),
  travelOption: registration.travelOption,
  carShare: registration.carShare ?? false,
  emptySeats: registration.emptySeats ?? 1,
  address: registration.address ?? "",
  note: registration.note ?? "",
});

function normalizePhone(value: string): string {
  const compact = value.replace(/[\s\-().]/g, "");

  if (compact.startsWith("+66")) {
    return `0${compact.slice(3)}`;
  }

  if (compact.startsWith("66") && compact.length === 11) {
    return `0${compact.slice(2)}`;
  }

  return compact;
}

function isValidPhone(value: string): boolean {
  return PHONE_REGEX.test(normalizePhone(value.trim()));
}

function validateForm(form: RegistrationFormData): FormErrors {
  const errors: FormErrors = {};

  if (!form.locationId) {
    errors.locationId = "Pick a destination to continue";
  }

  const trimmedName = form.name.trim();
  const words = trimmedName.split(/\s+/);

  if (!trimmedName) {
    errors.name = "Name is required";
  } else if (trimmedName.length < 2 || trimmedName.length > 120) {
    errors.name = "Name must be between 2 and 120 characters";
  } else if (words.length < 2) {
    errors.name = "Please enter your first and last name";
  }

  if (!form.phone.trim()) {
    errors.phone = "Phone number is required";
  } else if (!isValidPhone(form.phone)) {
    errors.phone = "Enter a valid Thai phone number, e.g. 0812345678";
  }

  /*
   * CAR_SHARE
   * --------------------------------
   * carShare ต้องเป็น false
   * แต่ address ยังเป็น required
   */
  if (form.travelOption === "CAR_SHARE") {
    const trimmedAddress = (form.address ?? "").trim();

    if (!trimmedAddress) {
      errors.address = "Pickup address is required";
    } else if (trimmedAddress.length < 10) {
      errors.address = "Pickup address must be at least 10 characters";
    }
  }

  /*
   * SELF_DRIVE + Able to take other people
   * --------------------------------
   * carShare = true
   * ต้องมี emptySeats และ address
   */
  if (
    form.travelOption === "SELF_DRIVE" &&
    form.carShare === true
  ) {
    const seatsValue = form.emptySeats;
    const seats = Number(seatsValue);

    if (
      seatsValue === undefined ||
      seatsValue === null ||
      `${seatsValue}`.trim() === "" ||
      Number.isNaN(seats) ||
      seats <= 0
    ) {
      errors.emptySeats = "Enter the number of empty seats";
    }

    const trimmedAddress = (form.address ?? "").trim();

    if (!trimmedAddress) {
      errors.address = "Pickup address is required";
    } else if (trimmedAddress.length < 10) {
      errors.address = "Pickup address must be at least 10 characters";
    }
  }

  form.companions.forEach((companion) => {
    const nameKey = `companion-${companion.id}-name`;
    const phoneKey = `companion-${companion.id}-phone`;
    const trimmedCompanionName = companion.name.trim();

    if (!trimmedCompanionName) {
      errors[nameKey] = "Companion name is required";
    } else if (
      trimmedCompanionName.length < 2 ||
      trimmedCompanionName.length > 120
    ) {
      errors[nameKey] = "Name must be between 2 and 120 characters";
    }

    if (companion.phone.trim() && !isValidPhone(companion.phone)) {
      errors[phoneKey] =
        "Enter a valid Thai phone number, e.g. 0812345678";
    }
  });

  if (form.note.length > MAX_NOTE_LENGTH) {
    errors.note = `Note must be ${MAX_NOTE_LENGTH} characters or fewer`;
  }

  return errors;
}

const clearErrorsWithPrefix = (
  errors: FormErrors,
  prefix: string,
): FormErrors => {
  const next: FormErrors = {};

  for (const key of Object.keys(errors)) {
    if (!key.startsWith(prefix)) {
      next[key] = errors[key];
    }
  }

  return next;
};

const clearError = (
  errors: FormErrors,
  key: string,
): FormErrors => {
  if (!errors[key]) return errors;

  const next = { ...errors };
  delete next[key];

  return next;
};

function getFirstErrorKey(
  errors: FormErrors,
  form: RegistrationFormData,
): string | null {
  for (const key of FIELD_FOCUS_ORDER) {
    if (errors[key]) return key;
  }

  for (const companion of form.companions) {
    const nameKey = `companion-${companion.id}-name`;

    if (errors[nameKey]) return nameKey;

    const phoneKey = `companion-${companion.id}-phone`;

    if (errors[phoneKey]) return phoneKey;
  }

  return null;
}

function focusField(
  fieldKey: string,
  form: RegistrationFormData,
) {
  if (fieldKey === "locationId") {
    document
      .getElementById(`locationId-${form.locationId}`)
      ?.focus();

    return;
  }

  if (fieldKey === "travelOption") {
    document
      .getElementById(`travelOption-${form.travelOption}`)
      ?.focus();

    return;
  }

  document.getElementById(fieldKey)?.focus();
}

type ManageRegistrationFormProps = {
  registrationData: Registration;
};

export default function ManageRegistrationForm({
  registrationData,
}: ManageRegistrationFormProps) {
  const router = useRouter();

  const formRef = useRef<HTMLFormElement>(null);

  /*
   * name/phone identify the registration on the API
   * (update-by-registration-number / cancel-by-registration-number).
   * Keep the original values fetched before redirect so editing the
   * name/phone fields in the form doesn't change which record we
   * update or cancel.
   */
  const registrationIdentity = useRef({
    name: registrationData.name,
    phone: registrationData.phone,
  });

  const [regForm, setRegForm] =
    useState<RegistrationFormData>(() =>
      formFromRegistration(registrationData),
    );

  const [errors, setErrors] =
    useState<FormErrors>({});

  const [touched, setTouched] =
    useState<Set<string>>(new Set());

  const [submitAttempted, setSubmitAttempted] =
    useState(false);

  const [confirmOpen, setConfirmOpen] =
    useState(false);

  const [rejectConfirmOpen, setRejectConfirmOpen] =
    useState(false);

  const locations = useQuery({
    queryKey: ["locations"],
    queryFn: () => getLocations(),
  });

  const LOCATIONS =
    locations.data
      ?.filter(
        (location) =>
          location.status === "APPROVED",
      )
      .map((location) => ({
        value: location.id,
        label: location.name,
        description:
          location.description ?? "",
        mapUrl: location.mapUrl ?? "",
        imageUrl: location.imageUrl ?? "",
        sourceUrl: location.sourceUrl ?? "",
        address: location.address ?? "",
        beds: location.beds,
        residentCapacity:
          location.residentCapacity,
        carparkCapacity:
          location.carparkCapacity,
      })) ?? [];

  const validateAndSetField = useCallback(
    (
      fieldKey: string,
      form: RegistrationFormData,
    ) => {
      const allErrors =
        validateForm(form);

      setErrors((prev) => {
        if (allErrors[fieldKey]) {
          return {
            ...prev,
            [fieldKey]:
              allErrors[fieldKey],
          };
        }

        return clearError(
          prev,
          fieldKey,
        );
      });
    },
    [],
  );

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >,
  ) => {
    const {
      name,
      value,
    } = e.target;

    setRegForm((prev) => {
      const next = {
        ...prev,
        [name]: value,
      };

      if (
        touched.has(name) ||
        submitAttempted
      ) {
        validateAndSetField(
          name,
          next,
        );
      } else {
        setErrors(
          (prevErrors) =>
            clearError(
              prevErrors,
              name,
            ),
        );
      }

      return next;
    });
  };

  const handleBlur = (
    fieldKey: string,
  ) => {
    setTouched((prev) => {
      const next = new Set(prev);
      next.add(fieldKey);
      return next;
    });

    validateAndSetField(
      fieldKey,
      regForm,
    );
  };

  const handleCompanionChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    companionId: string,
  ) => {
    const {
      name,
      value,
    } = e.target;

    const fieldKey =
      `companion-${companionId}-${name}`;

    setRegForm((prev) => {
      const next = {
        ...prev,
        companions:
          prev.companions.map(
            (companion) =>
              companion.id ===
              companionId
                ? {
                    ...companion,
                    [name]: value,
                  }
                : companion,
          ),
      };

      if (
        touched.has(fieldKey) ||
        submitAttempted
      ) {
        validateAndSetField(
          fieldKey,
          next,
        );
      } else {
        setErrors(
          (prevErrors) =>
            clearError(
              prevErrors,
              fieldKey,
            ),
        );
      }

      return next;
    });
  };

  const handleCompanionBlur = (
    companionId: string,
    fieldName: string,
  ) => {
    const fieldKey =
      `companion-${companionId}-${fieldName}`;

    setTouched((prev) => {
      const next = new Set(prev);
      next.add(fieldKey);
      return next;
    });

    validateAndSetField(
      fieldKey,
      regForm,
    );
  };

  const handleAddCompanion = () => {
    if (
      regForm.companions.length >=
      MAX_COMPANIONS
    ) {
      return;
    }

    setRegForm((prev) => ({
      ...prev,
      companions: [
        ...prev.companions,
        emptyCompanion(),
      ],
    }));
  };

  const handleRemoveCompanion = (
    companionId: string,
  ) => {
    setRegForm((prev) => ({
      ...prev,
      companions:
        prev.companions.filter(
          (companion) =>
            companion.id !==
            companionId,
        ),
    }));

    setErrors((prev) =>
      clearErrorsWithPrefix(
        prev,
        `companion-${companionId}-`,
      ),
    );
  };

  /*
   * =====================================================
   * SUBMIT LOGIC
   * =====================================================
   *
   * CAR_SHARE:
   *   travelOption = "CAR_SHARE"
   *   carShare     = false
   *   address      = required
   *
   * SELF_DRIVE + checkbox:
   *   travelOption = "SELF_DRIVE"
   *   carShare     = true
   *   emptySeats   = required
   *   address      = required
   *
   * SELF_DRIVE only:
   *   travelOption = "SELF_DRIVE"
   *   carShare     = false
   *   no address
   *   no emptySeats
   */
  const {
    mutate: updateRegistrationMutation,
    isPending,
    error,
    reset,
  } = useMutation({
    mutationFn: () => {
        const payload = {
          name: regForm.name.trim(),
          phone: regForm.phone.trim(),
          lineId: regForm.lineId.trim(),
          locationId: regForm.locationId,
          travelOption: regForm.travelOption,
          note: regForm.note.trim() || undefined,
      
          carShare:
            regForm.travelOption === "CAR_SHARE"
              ? false
              : regForm.travelOption === "SELF_DRIVE" &&
                  regForm.carShare === true
                ? true
                : false,
      
          ...(regForm.travelOption === "CAR_SHARE"
            ? {
                address: (regForm.address ?? "").trim(),
              }
            : regForm.travelOption === "SELF_DRIVE" &&
                regForm.carShare === true
              ? {
                  address: (regForm.address ?? "").trim(),
                  emptySeats: Number(regForm.emptySeats),
                }
              : {}),
      
          companions: regForm.companions.map(
            ({ name, phone, relationship }) => ({
              name: name.trim(),
              ...(phone.trim() ? { phone: phone.trim() } : {}),
              ...(relationship.trim()
                ? { relationship: relationship.trim() }
                : {}),
            }),
          ),
        };
      
        console.log("[UPDATE] identity:", registrationIdentity.current);
        console.log("[UPDATE] payload:", payload);
      
        return updateRegistrationByRegistrationNumber(
          registrationIdentity.current.name,
          registrationIdentity.current.phone,
          payload,
        );
      },
      

    onSuccess: () => {
      router.push("/submitted");
    },
  });

  const {
    mutate: rejectRegistrationMutation,
    isPending: isRejectPending,
    error: rejectError,
    reset: resetReject,
  } = useMutation({
    mutationFn: () =>
      cancelRegistrationByRegistrationNumber(
        registrationIdentity.current.name,
        registrationIdentity.current.phone,
      ),

    onSuccess: () => {
      router.push("/cancelled");
    },
  });

  const handleValidate = () => {
    setSubmitAttempted(true);

    const newErrors =
      validateForm(regForm);

    setErrors(newErrors);

    if (
      Object.keys(newErrors)
        .length > 0
    ) {
      const firstKey =
        getFirstErrorKey(
          newErrors,
          regForm,
        );

      if (firstKey) {
        requestAnimationFrame(
          () =>
            focusField(
              firstKey,
              regForm,
            ),
        );
      }

      return false;
    }

    return true;
  };

  const handleSaveClick = () => {
    if (!handleValidate()) {
      return;
    }

    setConfirmOpen(true);
  };

  const handleSubmit = () => {
    if (!handleValidate()) {
      setConfirmOpen(false);
      return;
    }
  
    setConfirmOpen(false);
  
    reset();
    updateRegistrationMutation();
  };

  const handleRejectClick = () => {
    setRejectConfirmOpen(true);
  };

  const handleReject = () => {
    setRejectConfirmOpen(false);

    resetReject();
    rejectRegistrationMutation();
  };

  const handleClear = () => {
    reset();
    setErrors({});
    setTouched(new Set());
    setSubmitAttempted(false);
    setConfirmOpen(false);
    setRegForm(formFromRegistration(registrationData));
  };

  const handleCancel = () => {
    router.push("/");
  };

  const visibleErrors =
    submitAttempted
      ? Object.values(errors)
      : Array.from(touched)
          .map(
            (key) =>
              errors[key],
          )
          .filter(Boolean);

  const activeError = error ?? rejectError;

  const serverMessages =
    activeError instanceof ApiError
      ? activeError.isRateLimited
        ? [
            "Too many requests. Please wait a moment and try again.",
          ]
        : activeError.messages
      : activeError
        ? [activeError.message]
        : [];

  return (
    <Card className="w-full rounded-xl border-line bg-card text-card-foreground shadow-sm">
      <CardHeader className="space-y-2 pb-4">
        <CardTitle className="text-2xl font-semibold tracking-tight">
          Manage your registration
        </CardTitle>

        <CardDescription className="text-base text-muted">
          Update your details below, or reject your spot
          on the Khao Yai trip.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          ref={formRef}
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveClick();
          }}
          className="flex flex-col gap-8"
          noValidate
        >
          <FormSection
            title="Pool Villa"
            description="Where would you like to stay?"
          >
            <RadioCardGroup
              legend="Choose a pool villa"
              name="locationId"
              value={regForm.locationId}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
              horizontal
              onChange={(value) => {
                setRegForm((prev) => {
                  const next = {
                    ...prev,
                    locationId:
                      value,
                  };

                  if (
                    touched.has(
                      "locationId",
                    ) ||
                    submitAttempted
                  ) {
                    validateAndSetField(
                      "locationId",
                      next,
                    );
                  } else {
                    setErrors(
                      (prevErrors) =>
                        clearError(
                          prevErrors,
                          "locationId",
                        ),
                    );
                  }

                  return next;
                });
              }}
              options={LOCATIONS}
              required
              error={
                errors.locationId
              }
            />
          </FormSection>

          <FormSection
            title="Your details"
            description="We'll use this to confirm your spot."
          >
            <Field
              id="name"
              label="Full name"
              required
              error={errors.name}
            >
              {(describedBy) => (
                <TextInput
                  id="name"
                  name="name"
                  type="text"
                  icon={UserRound}
                  placeholder="e.g. Many Phrom"
                  value={regForm.name}
                  onChange={
                    handleChange
                  }
                  onBlur={() =>
                    handleBlur(
                      "name",
                    )
                  }
                  error={Boolean(
                    errors.name,
                  )}
                  describedBy={
                    describedBy
                  }
                  autoComplete="name"
                />
              )}
            </Field>

            <Field
              id="phone"
              label="Phone number"
              required
              hint="Thai mobile or landline, e.g. 0812345678"
              error={errors.phone}
            >
              {(describedBy) => (
                <TextInput
                  id="phone"
                  name="phone"
                  type="tel"
                  icon={Phone}
                  placeholder="0812345678"
                  value={
                    regForm.phone
                  }
                  onChange={
                    handleChange
                  }
                  onBlur={() =>
                    handleBlur(
                      "phone",
                    )
                  }
                  error={Boolean(
                    errors.phone,
                  )}
                  describedBy={
                    describedBy
                  }
                  autoComplete="tel"
                  inputMode="tel"
                />
              )}
            </Field>

            <Field
              id="lineId"
              label="LINE ID"
              optional
            >
              {(describedBy) => (
                <TextInput
                  id="lineId"
                  name="lineId"
                  type="text"
                  icon={
                    MessageCircle
                  }
                  placeholder="Your LINE ID for quick updates"
                  value={
                    regForm.lineId
                  }
                  onChange={
                    handleChange
                  }
                  onBlur={() =>
                    handleBlur(
                      "lineId",
                    )
                  }
                  describedBy={
                    describedBy
                  }
                />
              )}
            </Field>
          </FormSection>

          <FormSection
            title="Getting there"
            description="How do you plan to travel?"
          >
            <RadioCardGroup
              legend="Travel option"
              name="travelOption"
              value={
                regForm.travelOption
              }
              onChange={(value) => {
                const nextTravelOption =
                  value as RegistrationFormData["travelOption"];

                setRegForm(
                  (prev) => ({
                    ...prev,

                    travelOption:
                      nextTravelOption,

                    /*
                     * เปลี่ยน travel option
                     * ต้อง reset carShare เสมอ
                     */
                    carShare:
                      false,

                    emptySeats: 1,
                    address: "",
                  }),
                );

                /*
                 * clear validation ของ
                 * address / emptySeats
                 */
                setErrors(
                  (prev) => {
                    const next = {
                      ...prev,
                    };

                    delete next.address;
                    delete next.emptySeats;

                    return next;
                  },
                );
              }}
              options={
                TRAVEL_OPTIONS
              }
            />

            {regForm.travelOption ===
              "SELF_DRIVE" && (
              <div className="flex flex-row items-center gap-4">
                <label htmlFor="carShare">
                  Able to take other people?
                </label>

                <input
                  id="carShare"
                  name="carShare"
                  type="checkbox"
                  checked={
                    regForm.carShare
                  }
                  onChange={() =>
                    setRegForm(
                      (prev) => ({
                        ...prev,
                        carShare:
                          !prev.carShare,
                      }),
                    )
                  }
                />
              </div>
            )}

            {regForm.carShare &&
              regForm.travelOption ===
                "SELF_DRIVE" && (
                <div>
                  <Field
                    id="emptySeats"
                    label="Empty seats"
                    required
                    error={
                      errors.emptySeats
                    }
                  >
                    {(describedBy) => (
                      <TextInput
                        id="emptySeats"
                        name="emptySeats"
                        type="number"
                        value={
                          regForm.emptySeats
                        }
                        onChange={
                          handleChange
                        }
                        min={1}
                        onBlur={() =>
                          handleBlur(
                            "emptySeats",
                          )
                        }
                        error={Boolean(
                          errors.emptySeats,
                        )}
                        describedBy={
                          describedBy
                        }
                      />
                    )}
                  </Field>

                  <Field
                    id="address"
                    label="Address"
                    required
                    error={
                      errors.address
                    }
                  >
                    {(describedBy) => (
                      <TextInput
                        id="address"
                        name="address"
                        type="text"
                        placeholder="e.g. 123 Main St, Anytown, USA"
                        value={
                          regForm.address
                        }
                        onChange={
                          handleChange
                        }
                        onBlur={() =>
                          handleBlur(
                            "address",
                          )
                        }
                        error={Boolean(
                          errors.address,
                        )}
                        describedBy={
                          describedBy
                        }
                      />
                    )}
                  </Field>
                </div>
              )}

            {regForm.travelOption ===
              "CAR_SHARE" && (
              <div>
                <Field
                  id="address"
                  label="Address"
                  required
                  hint="Where should the driver pick you up?"
                  error={
                    errors.address
                  }
                >
                  {(describedBy) => (
                    <TextInput
                      id="address"
                      name="address"
                      type="text"
                      placeholder="e.g. 123 Main St, Anytown, USA"
                      value={
                        regForm.address
                      }
                      onChange={
                        handleChange
                      }
                      onBlur={() =>
                        handleBlur(
                          "address",
                        )
                      }
                      error={Boolean(
                        errors.address,
                      )}
                      describedBy={
                        describedBy
                      }
                    />
                  )}
                </Field>
              </div>
            )}
          </FormSection>

          <FormSection
            title="Companions"
            description="Bringing anyone along? Add them here."
          >
            {regForm.companions
              .length === 0 ? (
              <p className="text-sm text-muted">
                Traveling solo? You can skip
                this section.
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {regForm.companions.map(
                  (
                    companion,
                    index,
                  ) => (
                    <div
                      key={
                        companion.id
                      }
                      className="rounded-[10px] border border-line bg-surface/50 p-4"
                    >
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <h3 className="text-sm font-medium text-card-foreground">
                          Companion{" "}
                          {index + 1}
                        </h3>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleRemoveCompanion(
                              companion.id,
                            )
                          }
                          className="text-danger hover:bg-red-50 hover:text-danger"
                        >
                          <Trash2
                            className="h-4 w-4"
                            aria-hidden="true"
                          />
                          Remove
                        </Button>
                      </div>

                      <div className="flex flex-col gap-4">
                        <Field
                          id={`companion-${companion.id}-name`}
                          label="Full name"
                          required
                          error={
                            errors[
                              `companion-${companion.id}-name`
                            ]
                          }
                        >
                          {(
                            describedBy,
                          ) => (
                            <TextInput
                              id={`companion-${companion.id}-name`}
                              name="name"
                              type="text"
                              placeholder="e.g. Jane Doe"
                              value={
                                companion.name
                              }
                              onChange={(
                                e,
                              ) =>
                                handleCompanionChange(
                                  e,
                                  companion.id,
                                )
                              }
                              onBlur={() =>
                                handleCompanionBlur(
                                  companion.id,
                                  "name",
                                )
                              }
                              error={Boolean(
                                errors[
                                  `companion-${companion.id}-name`
                                ],
                              )}
                              describedBy={
                                describedBy
                              }
                            />
                          )}
                        </Field>

                        <Field
                          id={`companion-${companion.id}-phone`}
                          label="Phone number"
                          optional
                          hint="Optional — helps us reach them if needed"
                          error={
                            errors[
                              `companion-${companion.id}-phone`
                            ]
                          }
                        >
                          {(
                            describedBy,
                          ) => (
                            <TextInput
                              id={`companion-${companion.id}-phone`}
                              name="phone"
                              type="tel"
                              icon={Phone}
                              placeholder="0812345678"
                              value={
                                companion.phone
                              }
                              onChange={(
                                e,
                              ) =>
                                handleCompanionChange(
                                  e,
                                  companion.id,
                                )
                              }
                              onBlur={() =>
                                handleCompanionBlur(
                                  companion.id,
                                  "phone",
                                )
                              }
                              error={Boolean(
                                errors[
                                  `companion-${companion.id}-phone`
                                ],
                              )}
                              describedBy={
                                describedBy
                              }
                              inputMode="tel"
                            />
                          )}
                        </Field>

                        <Field
                          id={`companion-${companion.id}-relationship`}
                          label="Relationship"
                          optional
                        >
                          {(
                            describedBy,
                          ) => (
                            <TextInput
                              id={`companion-${companion.id}-relationship`}
                              name="relationship"
                              type="text"
                              placeholder="e.g. Friend, partner, family"
                              value={
                                companion.relationship
                              }
                              onChange={(
                                e,
                              ) =>
                                handleCompanionChange(
                                  e,
                                  companion.id,
                                )
                              }
                              describedBy={
                                describedBy
                              }
                            />
                          )}
                        </Field>
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={
                handleAddCompanion
              }
              disabled={
                regForm.companions
                  .length >=
                MAX_COMPANIONS
              }
              className="w-full sm:w-auto"
            >
              <Plus
                className="h-4 w-4"
                aria-hidden="true"
              />
              Add companion

              {regForm.companions
                .length >=
                MAX_COMPANIONS && (
                <span className="sr-only">
                  {" "}
                  — maximum of{" "}
                  {
                    MAX_COMPANIONS
                  }{" "}
                  reached
                </span>
              )}
            </Button>

            {regForm.companions
              .length >=
              MAX_COMPANIONS && (
              <p className="text-sm text-muted">
                You can add up to{" "}
                {
                  MAX_COMPANIONS
                }{" "}
                companions.
              </p>
            )}
          </FormSection>

          <FormSection title="Anything we should know?">
            <Field
              id="note"
              label="Notes"
              optional
              hint="Dietary needs, accessibility requests, or other details"
              error={errors.note}
            >
              {(describedBy) => (
                <>
                  <TextArea
                    id="note"
                    name="note"
                    rows={3}
                    placeholder="Let us know if there's anything we should prepare for"
                    value={
                      regForm.note
                    }
                    onChange={
                      handleChange
                    }
                    onBlur={() =>
                      handleBlur(
                        "note",
                      )
                    }
                    error={Boolean(
                      errors.note,
                    )}
                    describedBy={
                      describedBy
                    }
                    maxLength={
                      MAX_NOTE_LENGTH
                    }
                  />

                  <p
                    className={`text-right text-xs ${
                      regForm.note
                        .length >=
                      MAX_NOTE_LENGTH
                        ? "text-danger"
                        : "text-muted"
                    }`}
                    aria-live="polite"
                  >
                    {
                      regForm.note
                        .length
                    }
                    /
                    {
                      MAX_NOTE_LENGTH
                    }
                  </p>
                </>
              )}
            </Field>
          </FormSection>

          
          <FormSection title="Join our LINE group">
            <img src="/img/lineGroup.jpg" alt="Line Group" width={280} height={280} />
            <p className="text-sm text-muted">Please join the group, to get information or payment details.</p>
          </FormSection>

          <CardFooter className="flex gap-3 p-0 sm:flex-row pt-8 justify-between">
            <div className="flex justify-end mb-4 gap-4">
              <Button
                variant="secondary"
                size="md"
                onClick={
                  handleCancel
                }
              >
                Cancel
              </Button>

              <ConformationDialog
                open={rejectConfirmOpen}
                onOpenChange={
                  setRejectConfirmOpen
                }
                handleSubmit={
                  handleReject
                }
              >
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  disabled={
                    isRejectPending
                  }
                  aria-busy={
                    isRejectPending
                  }
                  className="text-danger hover:bg-red-50 hover:text-danger"
                  onClick={
                    handleRejectClick
                  }
                >
                  {isRejectPending ? (
                    <>
                      <Loader2
                        className="h-4 w-4 animate-spin"
                        aria-hidden="true"
                      />
                      Rejecting…
                    </>
                  ) : (
                    <>
                      <Ban
                        className="h-4 w-4"
                        aria-hidden="true"
                      />
                      Reject
                    </>
                  )}
                </Button>
              </ConformationDialog>
            </div>

            <div className="flex justify-end mb-4 gap-4">
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={
                  handleClear
                }
              >
                Reset changes
              </Button>

              <ConformationDialog
                open={confirmOpen}
                onOpenChange={
                  setConfirmOpen
                }
                handleSubmit={
                  handleSubmit
                }
              >
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  disabled={
                    isPending
                  }
                  aria-busy={
                    isPending
                  }
                  className="w-full sm:w-auto"
                  onClick={
                    handleSaveClick
                  }
                >
                  {isPending ? (
                    <>
                      <Loader2
                        className="h-4 w-4 animate-spin"
                        aria-hidden="true"
                      />
                      Saving…
                    </>
                  ) : (
                    <>
                      Save changes
                      <ArrowRight
                        className="h-4 w-4"
                        aria-hidden="true"
                      />
                    </>
                  )}
                </Button>
              </ConformationDialog>
            </div>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}