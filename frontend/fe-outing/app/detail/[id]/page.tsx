"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  User,
  Phone,
  MessageCircle,
  MapPin,
  Car,
  Bus,
  Users,
  StickyNote,
  AlertCircle,
  Check,
} from "lucide-react";

import {
  getRegistration,
  getLocations,
} from "../../../src/_lib/api/registrationService";
import { Button } from "../../../src/_component/button";

const TRAVEL_OPTION_MAPPING: Record<string, string> = {
  SELF_DRIVE: "Self Drive",
  CAR_SHARE: "Car Share",
  PUBLIC_TRANSPORT: "Public Transport",
};

const TRAVEL_OPTION_ICON: Record<string, typeof Car> = {
  SELF_DRIVE: Car,
  CAR_SHARE: Users,
  PUBLIC_TRANSPORT: Bus,
};

/* ------------------------------------------------------------------ */
/*  Small building blocks                                             */
/* ------------------------------------------------------------------ */

function Section({
  title,
  icon: Icon,
  children,
  tone = "default",
}: {
  title: string;
  icon?: typeof Car;
  children: React.ReactNode;
  tone?: "default" | "soft";
}) {
  return (
    <section
      className={`rounded-xl border border-[#E9DED9] p-5 sm:p-6 ${
        tone === "soft" ? "bg-[#F8ECE7]" : "bg-white"
      }`}
    >
      <h2 className="flex items-center gap-2 text-[15px] font-semibold text-[#29211E] mb-4">
        {Icon && (
          <Icon
            className="w-[18px] h-[18px] text-[#B9684E]"
            strokeWidth={1.85}
            aria-hidden="true"
          />
        )}
        {title}
      </h2>
      {children}
    </section>
  );
}

function DetailField({
  label,
  value,
  fallback = "-",
}: {
  label: string;
  value: React.ReactNode;
  fallback?: string;
}) {
  const isEmpty = value === undefined || value === null || value === "";
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[13px] font-medium text-[#756C68]">{label}</span>
      <span
        className={`text-[15px] font-medium leading-snug break-words ${
          isEmpty ? "text-[#756C68] font-normal" : "text-[#29211E]"
        }`}
      >
        {isEmpty ? fallback : value}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Loading / Error / Empty states                                    */
/* ------------------------------------------------------------------ */

function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-md bg-[#E9DED9]/70 animate-pulse ${className}`} />
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-[#F8F5F0] py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <div className="flex items-center gap-4">
          <SkeletonBlock className="h-9 w-20" />
        </div>
        <SkeletonBlock className="h-8 w-64" />
        <SkeletonBlock className="h-4 w-80" />

        <div className="rounded-xl border border-[#E9DED9] bg-white p-6">
          <div className="flex items-center gap-4">
            <SkeletonBlock className="h-12 w-12 rounded-full" />
            <div className="flex flex-col gap-2">
              <SkeletonBlock className="h-5 w-40" />
              <SkeletonBlock className="h-3 w-28" />
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <SkeletonBlock className="h-40 w-full" />
          <SkeletonBlock className="h-40 w-full" />
        </div>
        <SkeletonBlock className="h-28 w-full" />
        <SkeletonBlock className="h-32 w-full" />
      </div>
    </div>
  );
}

function ErrorState({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-[#F8F5F0] py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-xl border border-[#E9DED9] bg-white p-10 text-center mt-16">
        <AlertCircle
          className="h-10 w-10 text-[#DC2626]"
          strokeWidth={1.75}
          aria-hidden="true"
        />
        <h1 className="text-lg font-semibold text-[#29211E]">
          Unable to load registration
        </h1>
        <p className="text-sm text-[#756C68]">
          Something went wrong while loading this registration. Please try
          again.
        </p>
        <Button variant="outline" onClick={onBack} className="mt-2">
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back
        </Button>
      </div>
    </div>
  );
}

function NotFoundState({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-[#F8F5F0] py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-xl border border-[#E9DED9] bg-white p-10 text-center mt-16">
        <h1 className="text-lg font-semibold text-[#29211E]">
          Registration not found
        </h1>
        <p className="text-sm text-[#756C68]">
          This registration may have been removed or the link is incorrect.
        </p>
        <Button variant="outline" onClick={onBack} className="mt-2">
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function DetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    // const role = "user";
    console.log("token", token);
    console.log("role", role);

    if (!token || role !== "admin") {
    console.log("token", token);
      router.replace("/");
      return;
    }

  }, [router]);


  const registration = useQuery({
    queryKey: ["registration", id],
    queryFn: () => getRegistration(id),
  });

  // Locations only expose an id + name on the registration record, so — same
  // as the dashboard — we fetch the full location list once and map
  // registration.locationId -> location.name ourselves.
  const locations = useQuery({
    queryKey: ["locations"],
    queryFn: () => getLocations(),
  });

  const locationMapping: Record<string, string> =
    locations.data?.reduce((acc, location) => {
      acc[location.id] = location.name;
      return acc;
    }, {} as Record<string, string>) ?? {};

  if (registration.isLoading || locations.isLoading) {
    return <LoadingState />;
  }

  if (registration.error) {
    return <ErrorState onBack={() => router.push("/")} />;
  }

  const data = registration.data;

  if (!data) {
    return <NotFoundState onBack={() => router.push("/")} />;
  }

  const travelLabel = data.travelOption
    ? TRAVEL_OPTION_MAPPING[data.travelOption] ?? data.travelOption
    : undefined;
  const TravelIcon = data.travelOption
    ? TRAVEL_OPTION_ICON[data.travelOption] ?? Car
    : undefined;
  const locationName = locationMapping[data.locationId];
  const companionCount = data.companions?.length ?? 0;



  return (
    <div className="relative min-h-screen bg-surface px-3 py-5 sm:px-4 sm:py-8 md:py-12">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div>
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Back
            </Button>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#29211E]">
              Registration Detail
            </h1>
            <p className="mt-1 text-sm text-[#756C68]">
              Review registration information and travel details.
            </p>
          </div>
        </div>

        {/* Registration summary */}
        <div className="rounded-xl border border-[#E9DED9] bg-white p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-[#F8ECE7]">
              <User
                className="h-6 w-6 text-[#B9684E]"
                strokeWidth={1.85}
                aria-hidden="true"
              />
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold text-[#29211E]">
                {data.name || "-"}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#756C68]">
                {data.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone
                      className="h-3.5 w-3.5"
                      strokeWidth={1.85}
                      aria-hidden="true"
                    />
                    {data.phone}
                  </span>
                )}
                {data.lineId && (
                  <span className="flex items-center gap-1.5">
                    <MessageCircle
                      className="h-3.5 w-3.5"
                      strokeWidth={1.85}
                      aria-hidden="true"
                    />
                    {data.lineId}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Personal information + Location & travel */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Section title="Personal Information" icon={User}>
            <div className="grid grid-cols-1 gap-4 xs:grid-cols-2">
              <DetailField label="Name" value={data.name} />
              <DetailField label="Phone" value={data.phone} />
              <DetailField label="Line ID" value={data.lineId} />
            </div>
          </Section>

          <Section title="Location & Travel" icon={MapPin}>
            <div className="flex flex-col gap-4">
              <DetailField label="Location" value={locationName} />

              <div className="flex flex-col gap-1">
                <span className="text-[13px] font-medium text-[#756C68]">
                  Travel Option
                </span>
                {travelLabel ? (
                  <span className="inline-flex w-fit items-center gap-1.5 rounded-md bg-[#F8ECE7] px-2.5 py-1 text-[13px] font-medium text-[#9F543D]">
                    {TravelIcon && (
                      <TravelIcon
                        className="h-3.5 w-3.5"
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                    )}
                    {travelLabel}
                  </span>
                ) : (
                  <span className="text-[15px] text-[#756C68]">-</span>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[13px] font-medium text-[#756C68]">
                  Can take others?
                </span>
                <span className="inline-flex w-fit items-center gap-1.5 text-[15px] font-medium text-[#29211E]">
                  {data.carShare ? (
                    <>
                      <Check
                        className="h-4 w-4 text-[#16A34A]"
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                      Yes
                    </>
                  ) : (
                    "No" 
                  )}
                </span>
              </div>
            </div>
          </Section>
        </div>

        {/* Car sharing (conditional) */}
        {data.carShare && (
          <Section title="Car Sharing" icon={Car}>
            <div className="grid grid-cols-1 gap-4 xs:grid-cols-2">
                {data.emptySeats != null && data.emptySeats > 0 && (
                    <DetailField label="Empty Seats" value={data.emptySeats} />
                )}
              <DetailField label="Address" value={data.address} />
            </div>
          </Section>
        )}


        {/* Notes */}
        <Section title="Notes" icon={StickyNote}>
          {data.note ? (
            <p className="text-[15px] leading-relaxed text-[#29211E] whitespace-pre-wrap">
              {data.note}
            </p>
          ) : (
            <p className="text-sm text-[#756C68]">No note provided</p>
          )}
        </Section>

        {/* Companions */}
        <Section title={`Companions (${companionCount})`} icon={Users}>
          {companionCount > 0 ? (
            <ul className="flex flex-col gap-2">
              {data.companions!.map((companion, index) => (
                <li
                  key={index}
                  className="rounded-lg border border-[#E9DED9] px-4 py-3"
                >
                  <p className="text-sm font-medium text-[#29211E]">
                    {companion.name || "-"}
                  </p>
                  {(companion.relationship || companion.phone) && (
                    <p className="mt-0.5 text-[13px] text-[#756C68]">
                      {[companion.relationship, companion.phone]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[#756C68]">No companions</p>
          )}
        </Section>
      </div>
    </div>
  );
}