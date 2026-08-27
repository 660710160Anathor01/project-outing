"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import {
  AlertCircle,
  ArrowRight,
  BedDouble,
  Car,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ImageOff,
  Loader2,
  MapPin,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogCloseIconButton,
} from "@/src/_component/dialog";
import type { Location } from "@/src/_lib/api/registration-type";

const DESCRIPTION_CLAMP_THRESHOLD = 180;
const SUCCESS_CLOSE_DELAY_MS = 900;

export type LocationDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: Location | null;
  isLoading?: boolean;
  isSubmitting?: boolean;
  errorMessage?: string;
  isSelected?: boolean;
  ctaLabel?: string;
  onSelect?: (id: string) => void;
  onViewMap?: (location: Location) => void;
};

function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) return `1 ${singular}`;
  return `${count} ${plural ?? `${singular}s`}`;
}

function buildMapUrl(location: Location): string {
  const query = encodeURIComponent(
    location.address ?? location.name,
  );
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

function LocationSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col animate-pulse">
      <div className="aspect-[16/10] shrink-0 bg-surface" />
      <div className="flex flex-col gap-4 p-5 sm:p-6">
        <div className="h-7 w-3/4 rounded-lg bg-surface" />
        <div className="h-4 w-full rounded bg-surface" />
        <div className="h-4 w-5/6 rounded bg-surface" />
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-surface" />
          <div className="h-3 w-full rounded bg-surface" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="h-16 rounded-[10px] bg-surface" />
          <div className="h-16 rounded-[10px] bg-surface" />
          <div className="h-16 rounded-[10px] bg-surface" />
        </div>
      </div>
      <div className="border-t border-line p-4 sm:p-5">
        <div className="h-11 w-full rounded-xl bg-surface" />
      </div>
    </div>
  );
}

function LocationImage({
  location,
}: {
  location: Location;
}) {
  return (
    <div className="relative aspect-[16/10] shrink-0 overflow-hidden bg-surface">
      {location.imageUrl ? (
        <Image
          src={location.imageUrl}
          alt={location.name}
          fill
          sizes="(max-width: 640px) 100vw, 512px"
          className="object-cover"
          priority
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-muted">
          <ImageOff className="h-8 w-8" aria-hidden="true" strokeWidth={1.5} />
          <span className="text-sm">No photo yet</span>
        </div>
      )}
      <div className="absolute right-3 top-3">
        <DialogCloseIconButton />
      </div>
    </div>
  );
}

function DescriptionBlock({ text }: { text: string }) {
  const descriptionId = useId();
  const [expanded, setExpanded] = useState(false);
  const needsToggle = text.length > DESCRIPTION_CLAMP_THRESHOLD;

  return (
    <div>
      <p
        id={descriptionId}
        className={`text-sm leading-relaxed text-muted ${
          !expanded && needsToggle ? "line-clamp-3" : ""
        }`}
      >
        {text}
      </p>
      {needsToggle && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-brand transition-colors hover:text-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          aria-expanded={expanded}
          aria-controls={descriptionId}
        >
          {expanded ? (
            <>
              Show less
              <ChevronUp className="h-4 w-4" aria-hidden="true" strokeWidth={2} />
            </>
          ) : (
            <>
              Read more
              <ChevronDown className="h-4 w-4" aria-hidden="true" strokeWidth={2} />
            </>
          )}
        </button>
      )}
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-[10px] bg-surface px-2 py-3 text-center">
      <Icon
        className="h-[18px] w-[18px] text-muted"
        aria-hidden="true"
        strokeWidth={2}
      />
      <dt className="sr-only">{label}</dt>
      <dd className="text-sm font-medium text-card-foreground">{value}</dd>
    </div>
  );
}

function LocationStats({ location }: { location: Location }) {
  const stats: { icon: LucideIcon; label: string; value: string }[] = [];

  if (location.beds > 0) {
    stats.push({
      icon: BedDouble,
      label: "Beds",
      value: pluralize(location.beds, "bed"),
    });
  }

  if (location.residentCapacity > 0) {
    stats.push({
      icon: Users,
      label: "Guest capacity",
      value: `Up to ${pluralize(location.residentCapacity, "guest")}`,
    });
  }

  if (location.carparkCapacity > 0) {
    stats.push({
      icon: Car,
      label: "Car park",
      value: pluralize(location.carparkCapacity, "car park", "car parks"),
    });
  }

  if (stats.length === 0) return null;

  return (
    <section aria-labelledby="location-stats-heading">
      <h3
        id="location-stats-heading"
        className="mb-2 text-sm font-medium text-card-foreground"
      >
        At a glance
      </h3>
      <dl
        className={`grid gap-2 ${
          stats.length === 1
            ? "grid-cols-1"
            : stats.length === 2
              ? "grid-cols-2"
              : "grid-cols-3"
        }`}
      >
        {stats.map((stat) => (
          <StatTile
            key={stat.label}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
          />
        ))}
      </dl>
    </section>
  );
}

export function LocationDetailDialog({
  open,
  onOpenChange,
  location,
  isLoading = false,
  isSubmitting = false,
  errorMessage,
  isSelected = false,
  ctaLabel = "Select this location",
  onSelect,
  onViewMap,
}: LocationDetailDialogProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  useEffect(() => clearCloseTimer, [clearCloseTimer]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      clearCloseTimer();
      setShowSuccess(false);
    }
    onOpenChange(nextOpen);
  };

  const handleSelect = () => {
    if (!location || isSelected || isSubmitting || showSuccess) return;

    onSelect?.(location.id);
    setShowSuccess(true);

    closeTimerRef.current = setTimeout(() => {
      onOpenChange(false);
      setShowSuccess(false);
    }, SUCCESS_CLOSE_DELAY_MS);
  };

  const mapHref = location
    ? onViewMap
      ? undefined
      : buildMapUrl(location)
    : undefined;

  const handleViewMap = () => {
    if (!location) return;
    if (onViewMap) {
      onViewMap(location);
      return;
    }
    if (mapHref) {
      window.open(mapHref, "_blank", "noopener,noreferrer");
    }
  };

  const ctaDisabled =
    isLoading || isSubmitting || showSuccess || isSelected || !location;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-0">
        {isLoading || !location ? (
          <LocationSkeleton />
        ) : (
          <>
            <LocationImage location={location} />

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <DialogTitle className="text-xl font-semibold leading-tight">
                      {location.name}
                    </DialogTitle>

                    {location.address && (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-start gap-2">
                          <MapPin
                            className="mt-0.5 h-4 w-4 shrink-0 text-muted"
                            aria-hidden="true"
                            strokeWidth={2}
                          />
                          <address className="text-sm not-italic text-muted">
                            {location.address}
                          </address>
                        </div>
                        {onViewMap || mapHref ? (
                          <button
                            type="button"
                            onClick={handleViewMap}
                            className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-brand transition-colors hover:text-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                          >
                            View map
                            <ExternalLink
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                              strokeWidth={2}
                            />
                          </button>
                        ) : null}
                      </div>
                    )}
                  </div>

                  {location.description && (
                    <DescriptionBlock text={location.description} />
                  )}

                  <LocationStats location={location} />
                </div>
              </div>

              <div className="shrink-0 border-t border-line bg-card px-5 py-4 sm:px-6">
                {errorMessage && (
                  <p
                    role="alert"
                    className="mb-3 flex items-start gap-2 text-sm text-danger"
                  >
                    <AlertCircle
                      className="mt-0.5 h-4 w-4 shrink-0"
                      aria-hidden="true"
                      strokeWidth={2}
                    />
                    <span>{errorMessage}</span>
                  </p>
                )}

                {showSuccess && (
                  <p
                    aria-live="polite"
                    className="mb-3 flex items-center justify-center gap-2 text-sm font-medium text-success"
                  >
                    <CheckCircle2
                      className="h-4 w-4 shrink-0"
                      aria-hidden="true"
                      strokeWidth={2}
                    />
                    Location selected
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleSelect}
                  disabled={ctaDisabled}
                  aria-busy={isSubmitting}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2
                        className="h-4 w-4 animate-spin"
                        aria-hidden="true"
                        strokeWidth={2}
                      />
                      Selecting…
                    </>
                  ) : isSelected ? (
                    <>
                      <Check
                        className="h-4 w-4"
                        aria-hidden="true"
                        strokeWidth={2.5}
                      />
                      Selected
                    </>
                  ) : showSuccess ? (
                    <>
                      <CheckCircle2
                        className="h-4 w-4"
                        aria-hidden="true"
                        strokeWidth={2}
                      />
                      Location selected
                    </>
                  ) : (
                    <>
                      {ctaLabel}
                      <ArrowRight
                        className="h-4 w-4"
                        aria-hidden="true"
                        strokeWidth={2}
                      />
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
