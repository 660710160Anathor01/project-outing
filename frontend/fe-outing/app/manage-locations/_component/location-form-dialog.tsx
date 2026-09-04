"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogCloseIconButton,
} from "@/src/_component/dialog";
import { Button } from "@/src/_component/button";
import type { Location, CreateLocationInput } from "@/src/_lib/api/registration-type";

export type LocationFormValues = {
  name: string;
  description?: string;
  address: string;
  beds: string;
  residentCapacity: string;
  carparkCapacity: string;
  price: string;
  mapUrl?: string;
  imageUrl?: string[];
  sourceUrl?: string;
};


type LocationFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: Location | null;
  isSubmitting?: boolean;
  errorMessage?: string;
  onSubmit: (values: LocationFormValues) => void;
};

type FormState = {
  name: string;
  description: string;
  address: string;
  beds: string;
  residentCapacity: string;
  carparkCapacity: string;
  price: string;
  mapUrl: string;
  imageUrls: string;
  sourceUrl: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const emptyFormState = (): FormState => ({
  name: "",
  description: "",
  address: "",
  beds: "",
  residentCapacity: "",
  carparkCapacity: "",
  price: "",
  mapUrl: "",
  imageUrls: "",
  sourceUrl: "",
});

function locationToFormState(location: Location | null): FormState {
  if (!location) return emptyFormState();

  const images = Array.isArray(location.imageUrl) ? location.imageUrl : [];
  return {
    name: location.name ?? "",
    description: location.description ?? "",
    address: location.address ?? "",
    beds: location.beds ?? "",
    residentCapacity: location.residentCapacity ?? "",
    carparkCapacity: location.carparkCapacity ?? "",
    price: location.price ?? "",
    mapUrl: location.mapUrl ?? "",
    imageUrls: images.join("\n"),
    sourceUrl: location.sourceUrl ?? "",
  };
}

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!form.name.trim()) {
    errors.name = "Name is required";
  }

  const beds = Number(form.beds);
  if (form.beds.trim() === "" || Number.isNaN(beds) || beds < 0) {
    errors.beds = "Enter a valid number of bed rooms";
  }

  const residentCapacity = Number(form.residentCapacity);
  if (
    form.residentCapacity.trim() === "" ||
    Number.isNaN(residentCapacity) ||
    residentCapacity < 0
  ) {
    errors.residentCapacity = "Enter a valid guest capacity";
  }

  const carparkCapacity = Number(form.carparkCapacity);
  if (
    form.carparkCapacity.trim() === "" ||
    Number.isNaN(carparkCapacity) ||
    carparkCapacity < 0
  ) {
    errors.carparkCapacity = "Enter a valid carpark capacity";
  }

  return errors;
}

export function LocationFormDialog({
  open,
  onOpenChange,
  location,
  isSubmitting = false,
  errorMessage,
  onSubmit,
}: LocationFormDialogProps) {
  const [form, setForm] = useState<FormState>(() =>
    locationToFormState(location),
  );
  const [errors, setErrors] = useState<FormErrors>({});

  const isEditMode = location !== null;

  // Reload the form whenever the dialog opens, for whichever location (or
  // none, for "add") it was opened with — this avoids stale values from a
  // previous edit leaking into a later "add" or a different location's edit.
  useEffect(() => {
    if (open) {
      setForm(locationToFormState(location));
      setErrors({});
    }
  }, [open, location]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validate(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    onSubmit({
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      address: form.address.trim() || "",
      beds: String(form.beds),
      residentCapacity: String(form.residentCapacity),
      carparkCapacity: String(form.carparkCapacity),
      price: String(form.price),
      mapUrl: form.mapUrl.trim() || undefined,
      imageUrl: form.imageUrls
        .split("\n")
        .map((url) => url.trim())
        .filter(Boolean),
      sourceUrl: form.sourceUrl.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0">
        <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-6">
          <DialogTitle className="text-lg font-semibold">
            {isEditMode ? "Edit location" : "Add location"}
          </DialogTitle>
          <DialogCloseIconButton />
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto px-5 py-4 sm:px-6"
          noValidate
        >
          <div className="flex flex-col gap-1">
            <label
              htmlFor="location-name"
              className="text-sm font-medium text-black"
            >
              Name<span className="text-red-500"> *</span>
            </label>
            <input
              id="location-name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              className="rounded-md border-2 border-gray-300 p-2 text-sm"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "location-name-error" : undefined}
            />
            {errors.name && (
              <p id="location-name-error" className="text-xs text-red-500">
                {errors.name}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="location-description"
              className="text-sm font-medium text-black"
            >
              Description
            </label>
            <textarea
              id="location-description"
              name="description"
              rows={2}
              value={form.description}
              onChange={handleChange}
              className="rounded-md border-2 border-gray-300 p-2 text-sm"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="location-address"
              className="text-sm font-medium text-black"
            >
              Address<span className="text-red-500"> *</span>
            </label>
            <input
              id="location-address"
              name="address"
              placeholder="Enter address here"
              required
              type="text"
              value={form.address}
              onChange={handleChange}
              className="rounded-md border-2 border-gray-300 p-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="location-beds"
                className="text-sm font-medium text-black"
              >
                Bed rooms<span className="text-red-500"> *</span>
              </label>
              <input
                id="location-beds"
                name="beds"
                type="text"
                min={0}
                value={form.beds}
                onChange={handleChange}
                className="rounded-md border-2 border-gray-300 p-2 text-sm"
                aria-invalid={Boolean(errors.beds)}
              />
              {errors.beds && (
                <p className="text-xs text-red-500">{errors.beds}</p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="location-residentCapacity"
                className="text-sm font-medium text-black"
              >
                Guests<span className="text-red-500"> *</span>
              </label>
              <input
                id="location-residentCapacity"
                name="residentCapacity"
                type="text"
                min={0}
                value={form.residentCapacity}
                onChange={handleChange}
                className="rounded-md border-2 border-gray-300 p-2 text-sm"
                aria-invalid={Boolean(errors.residentCapacity)}
              />
              {errors.residentCapacity && (
                <p className="text-xs text-red-500">
                  {errors.residentCapacity}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="location-carparkCapacity"
                className="text-sm font-medium text-black"
              >
                Carpark<span className="text-red-500"> *</span>
              </label>
              <input
                id="location-carparkCapacity"
                name="carparkCapacity"
                type="text"
                min={0}
                value={form.carparkCapacity}
                onChange={handleChange}
                className="rounded-md border-2 border-gray-300 p-2 text-sm"
                aria-invalid={Boolean(errors.carparkCapacity)}
              />
              {errors.carparkCapacity && (
                <p className="text-xs text-red-500">
                  {errors.carparkCapacity}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="location-price"
                className="text-sm font-medium text-black"
              >
                Price<span className="text-red-500"> *</span>
              </label>
              <input
                id="location-price"
                name="price"
                type="text"
                min={0}
                value={form.price}
                onChange={handleChange}
                className="rounded-md border-2 border-gray-300 p-2 text-sm"
                aria-invalid={Boolean(errors.price)}
              />
              {errors.price && (
                <p className="text-xs text-red-500">
                  {errors.price}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="location-mapUrl"
              className="text-sm font-medium text-black"
            >
              Map URL
            </label>
            <input
              id="location-mapUrl"
              name="mapUrl"
              type="url"
              placeholder="https://maps.google.com/…"
              value={form.mapUrl}
              onChange={handleChange}
              className="rounded-md border-2 border-gray-300 p-2 text-sm"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="location-imageUrls"
              className="text-sm font-medium text-black"
            >
              Photo URLs
            </label>
            <textarea
              id="location-imageUrls"
              name="imageUrls"
              rows={3}
              placeholder="One image URL per line"
              value={form.imageUrls}
              onChange={handleChange}
              className="rounded-md border-2 border-gray-300 p-2 text-sm"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="location-sourceUrl"
              className="text-sm font-medium text-black"
            >
              Source URL
            </label>
            <input
              id="location-sourceUrl"
              name="sourceUrl"
              type="url"
              value={form.sourceUrl}
              onChange={handleChange}
              className="rounded-md border-2 border-gray-300 p-2 text-sm"
            />
          </div>

          {errorMessage && (
            <p role="alert" className="text-sm text-red-500">
              {errorMessage}
            </p>
          )}

          <div className="sticky bottom-0 -mx-5 mt-2 flex justify-end gap-2 border-t border-line bg-card px-5 py-4 sm:-mx-6 sm:px-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Saving…
                </>
              ) : isEditMode ? (
                "Save changes"
              ) : (
                "Add location"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}