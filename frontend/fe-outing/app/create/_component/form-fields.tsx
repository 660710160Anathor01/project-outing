"use client";

import { AlertCircle, Check, Maximize2, type LucideIcon } from "lucide-react";
import {
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
  useId,
  useState,
} from "react";
import Image from "next/image";
import { LocationDetailDialog } from "../../_component/location-dialog";
import { Location } from "@/src/_lib/api/registration-type";

const inputBase =
  "w-full rounded-[10px] border bg-white text-[15px] text-card-foreground placeholder:text-muted/70 transition-shadow focus:outline-none";
const inputDefault = `${inputBase} border-line focus:border-brand focus:ring-4 focus:ring-brand/15`;
const inputError = `${inputBase} border-danger focus:border-danger focus:ring-4 focus:ring-danger/15`;

type FieldProps = {
  id: string;
  label: string;
  required?: boolean;
  optional?: boolean;
  hint?: string;
  error?: string;
  children: (describedBy: string | undefined) => ReactNode;
  className?: string;
};

export function Field({
  id,
  label,
  required,
  optional,
  hint,
  error,
  children,
  className = "",
}: FieldProps) {
  const hintId = useId();
  const errorId = useId();

  const describedBy =
    [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-sm font-medium text-card-foreground">
        {label}
        {required && (
          <>
            <span aria-hidden="true" className="ml-0.5 text-danger">
              *
            </span>
            <span className="sr-only"> (required)</span>
          </>
        )}
        {optional && (
          <span className="ml-1.5 text-sm font-normal text-muted">
            Optional
          </span>
        )}
      </label>
      {hint && (
        <p id={hintId} className="text-sm text-muted">
          {hint}
        </p>
      )}
      {children(describedBy)}
      {error && <FieldError id={errorId} message={error} />}
    </div>
  );
}

type TextInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "className"
> & {
  icon?: LucideIcon;
  error?: boolean;
  describedBy?: string;
};

export function TextInput({
  icon: Icon,
  error,
  describedBy,
  id,
  ...props
}: TextInputProps) {
  return (
    <div className="relative">
      {Icon && (
        <Icon
          className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted"
          aria-hidden="true"
          strokeWidth={2}
        />
      )}
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`h-11 ${error ? inputError : inputDefault} ${Icon ? "pl-10 pr-3.5" : "px-3.5"}`}
        {...props}
      />
    </div>
  );
}

type TextAreaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "className"
> & {
  error?: boolean;
  describedBy?: string;
};

export function TextArea({
  error,
  describedBy,
  id,
  ...props
}: TextAreaProps) {
  return (
    <textarea
      id={id}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy}
      className={`min-h-[88px] resize-y px-3.5 py-2.5 ${error ? inputError : inputDefault}`}
      {...props}
    />
  );
}

export function FieldError({ id, message }: { id?: string; message: string }) {
  return (
    <p
      id={id}
      role="alert"
      className="flex items-start gap-1.5 text-sm text-danger"
    >
      <AlertCircle
        className="mt-0.5 h-4 w-4 shrink-0"
        aria-hidden="true"
        strokeWidth={2}
      />
      <span>{message}</span>
    </p>
  );
}

// Keep whatever you already have for this one — only shown here so the file
// is self-contained. Adjust the path to match your project.
type IconComponent = LucideIcon;
export type RadioCardOption = {
  value: string;
  label: string;
  description?: string;
  beds?: string;
  residentCapacity?: string;
  carparkCapacity?: string;
  price?: string;
  address?: string;
  icon?: IconComponent;
  // New, for the image-card style (room/venue picker, etc.)
  mapUrl?: string;
  imageUrl?: string[];
  sourceUrl?: string;
  badge?: string; // e.g. "Available now"
  meta?: string; // e.g. "Max. 15 seats  |  10 m2"
  amenities?: IconComponent[]; // small icons over the image, e.g. [Camera, Bluetooth]
  status?: "PENDING" | "APPROVED";
};

type RadioCardGroupProps = {
  legend: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: RadioCardOption[];
  required?: boolean;
  horizontal?: boolean;
  error?: string;
  className?: string;
};

export function RadioCardGroup({
  legend,
  name,
  value,
  onChange,
  options,
  required,
  horizontal,
  error,
  className = "",
}: RadioCardGroupProps) {
  const errorId = useId();

  return (
    <fieldset
      className="flex flex-col gap-3"
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? errorId : undefined}
    >
      <legend className="mb-1 text-sm font-medium text-card-foreground">
        {legend}
        {required && (
          <>
            <span aria-hidden="true" className="ml-0.5 text-danger">
              *
            </span>
            <span className="sr-only"> (required)</span>
          </>
        )}
      </legend>

      <div
        className={`${
          horizontal ? "flex flex-row flex-wrap gap-3" : "grid grid-cols-1 gap-3"
        } ${className}`}
      >
        {options.map((option) => {
          const inputId = `${name}-${option.value}`;
          const checked = value === option.value;

          return option.imageUrl ? (
            <ImageRadioCard
              key={option.value}
              inputId={inputId}
              name={name}
              option={option}
              checked={checked}
              required={required}
              onChange={onChange}
            />
          ) : (
            <IconRadioCard
              key={option.value}
              inputId={inputId}
              name={name}
              option={option}
              checked={checked}
              required={required}
              horizontal={horizontal}
              onChange={onChange}
            />
          );
        })}
      </div>

      {error && <FieldError id={errorId} message={error} />}
    </fieldset>
  );
}

// Your original card, unchanged in behavior — just pulled out into its own
// component so RadioCardGroup can pick between this and ImageRadioCard.
function IconRadioCard({
  inputId,
  name,
  option,
  checked,
  required,
  horizontal,
  onChange,
}: {
  inputId: string;
  name: string;
  option: RadioCardOption;
  checked: boolean;
  required?: boolean;
  horizontal?: boolean;
  onChange: (value: string) => void;
}) {
  const Icon = option.icon;

  return (
    <label
      htmlFor={inputId}
      className={`relative flex ${
        horizontal ? "flex-row " : "flex-col"
      } cursor-pointer items-start gap-3 rounded-[10px] border p-4 transition-colors ${
        checked
          ? "border-brand bg-brand/5"
          : "border-line bg-white hover:border-brand/40 hover:bg-surface"
      }`}
    >
      <input
        type="radio"
        id={inputId}
        name={name}
        value={option.value}
        checked={checked}
        onChange={() => onChange(option.value)}
        className="peer sr-only"
        required={required}
      />
      {Icon && (
        <div>
          {horizontal ? (
            <Icon
              className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted"
              aria-hidden="true"
              strokeWidth={2}
            />
          ) : (
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                checked ? "bg-brand/10 text-brand" : "bg-surface text-muted"
              }`}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
            </span>
          )}
        </div>
      )}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5 pt-0.5">
        <span className="text-sm font-medium text-card-foreground">
          {option.label}
        </span>
        {option.description && (
          <span className="text-sm text-muted">{option.description}</span>
        )}
      </span>
      {checked && (
        <Check
          className="absolute right-3 top-3 h-4 w-4 text-brand"
          aria-hidden="true"
          strokeWidth={2.5}
        />
      )}
      <span className="pointer-events-none absolute inset-0 rounded-[10px] ring-2 ring-transparent peer-focus-visible:ring-brand peer-focus-visible:ring-offset-2" />
    </label>
  );
}

// New: the room-card style from the screenshot — image on top with a badge
// and amenity icons overlaid, then title / meta / a view-details trigger below.
function toLocation(option: RadioCardOption): Location {
  return {
    id: option.value,
    name: option.label,
    description: option.description ?? null,
    address: option.address ?? "",
    beds: option.beds ?? "",
    residentCapacity: option.residentCapacity ?? "",
    carparkCapacity: option.carparkCapacity ?? "",
    price: option.price ?? "",
    mapUrl: option.mapUrl ?? "",
    imageUrl: option.imageUrl ?? [],
    sourceUrl: option.sourceUrl ?? "",
    status: option.status ?? "PENDING",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function ImageRadioCard({
  inputId,
  name,
  option,
  checked,
  required,
  onChange,
}: {
  inputId: string;
  name: string;
  option: RadioCardOption;
  checked: boolean;
  required?: boolean;
  onChange: (value: string) => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const location = toLocation(option);

  return (
    <div
      className={`relative flex h-full w-full min-w-0 flex-col overflow-hidden rounded-2xl border bg-white transition-all ${
        checked
          ? "border-brand ring-1 ring-brand"
          : "border-line hover:border-brand/40 hover:shadow-sm"
      }`}
    >
      <label
        htmlFor={inputId}
        className="relative flex min-h-0 flex-1 cursor-pointer flex-col"
      >
        <input
          type="radio"
          id={inputId}
          name={name}
          value={option.value}
          checked={checked}
          onChange={() => onChange(option.value)}
          className="peer sr-only"
          required={required}
        />

        {/* Image */}
        <div className="relative h-32 w-full shrink-0 bg-surface">
          {option.imageUrl ? (
            <Image
              src={option.imageUrl[0]}
              alt={option.label}
              fill
              sizes="(max-width: 640px) 100vw, 256px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted">
              No image
            </div>
          )}

          {option.badge && (
            <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-brand shadow-sm backdrop-blur-sm">
              {option.badge}
            </span>
          )}

          {option.amenities && option.amenities.length > 0 && (
            <div className="absolute bottom-2 left-2 flex gap-1.5">
              {option.amenities.map((Amenity, index) => (
                <span
                  key={index}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm"
                >
                  <Amenity
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                    strokeWidth={2}
                  />
                </span>
              ))}
            </div>
          )}

          {checked && (
            <span className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-brand text-white shadow-sm">
              <Check
                className="h-4 w-4"
                aria-hidden="true"
                strokeWidth={2.5}
              />
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-3 pb-2">
          <div className="min-w-0">
            <span className="block text-sm font-semibold text-card-foreground">
              {option.label}
            </span>

            {option.description && (
              <span className="mt-1 block text-xs leading-5 text-muted line-clamp-2">
                {option.description}
              </span>
            )}

            {option.meta && (
              <span className="mt-1 block text-xs text-muted">
                {option.meta}
              </span>
            )}
          </div>
        </div>

        <span className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-transparent peer-focus-visible:ring-brand peer-focus-visible:ring-offset-2" />
      </label>

      <div className="px-3 pb-3">
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className={`flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${
            checked
              ? "bg-brand text-white hover:bg-brand-hover"
              : "bg-brand/10 text-brand hover:bg-brand/15"
          }`}
        >
          <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={2} />
          View details
          <span className="sr-only"> for {option.label}</span>
        </button>
      </div>

      <LocationDetailDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        location={location}
        isSelected={checked}
        onSelect={(id) => onChange(id)}
        isSelect={true}
      />
    </div>
  );
}



export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-base font-semibold text-card-foreground">{title}</h2>
        {description && (
          <p className="mt-0.5 text-sm text-muted">{description}</p>
        )}
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

export function ErrorSummary({ errors }: { errors: string[] }) {
  if (errors.length === 0) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="rounded-[10px] border border-danger/30 bg-red-50 p-4"
    >
      <p className="flex items-center gap-2 text-sm font-medium text-danger">
        <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
        Please fix the following before submitting:
      </p>
      <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-danger">
        {errors.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    </div>
  );
}
