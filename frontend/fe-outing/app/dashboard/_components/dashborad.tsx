"use client";

import {
  Copy,
  Eye,
  MapPin,
  X,
  Car,
  Users,
  CarFront,
  CarTaxiFront,
  CheckCircle2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import {
  getAllRegistrations,
  getLocations,
} from "../../../src/_lib/api/registrationService";

import {
  Card,
  CardContent,
} from "../../../src/_component/card-template";

import {
  Registration,
  Location,
} from "@/src/_lib/api/registration-type";

import Loading from "../../loading";
import { Button } from "@/src/_component/button";

import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/src/_component/dialog";

/* =========================================================
   TYPES
========================================================= */

type TravelOption =
  | "SELF_DRIVE"
  | "CAR_SHARE"
  | "PUBLIC_TRANSPORT";

type Filter = {
  travelOption: string;
  location: string;
  search: string;
};

type LocationVote = {
  id: string;
  name: string;
  count: number;
  percentage: number;
};

type RegistrationFilterProps = {
  filter: Filter;
  onFilterChange: (filter: Filter) => void;
  locationMapping: Record<string, string>;
};

/* =========================================================
   CONSTANTS
========================================================= */

const TravelOptionMapping: Record<string, string> = {
  SELF_DRIVE: "Self Drive",
  CAR_SHARE: "Car Share",
  PUBLIC_TRANSPORT: "Public Transport",
};

const emptyFilter = (): Filter => ({
  travelOption: "",
  location: "",
  search: "",
});

/* =========================================================
   HELPERS
========================================================= */

/**
 * รองรับกรณี API ส่ง carparkCapacity มาเป็น
 * number หรือ string
 */
const toNumber = (
  value: number | string | null | undefined,
): number => {
  const numberValue = Number(value);

  return Number.isFinite(numberValue)
    ? numberValue
    : 0;
};

/* =========================================================
   KPI CARD
========================================================= */

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconClassName = "bg-brand/10 text-brand",
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  iconClassName?: string;
}) {
  return (
    <Card className="h-full">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted">
              {title}
            </p>

            <p className="mt-2 text-3xl font-bold tracking-tight text-card-foreground">
              {value}
            </p>

            <p className="mt-1 text-xs text-muted">
              {description}
            </p>
          </div>

          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}
          >
            <Icon
              className="h-5 w-5"
              aria-hidden="true"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* =========================================================
   VOTED LOCATION
========================================================= */

function VotedLocation({
  locations,
  topLocationCars,
  topLocationCarparkCapacity,
}: {
  locations: LocationVote[];
  topLocationCars: number;
  topLocationCarparkCapacity: number;
}) {
  const topLocation = locations[0];

  const hasVotes = Boolean(topLocation);

  const parkingCapacity =
    toNumber(topLocationCarparkCapacity);

  const parkingFull =
    parkingCapacity > 0 &&
    topLocationCars >= parkingCapacity;

  const parkingPercentage =
    parkingCapacity > 0
      ? Math.min(
          (topLocationCars / parkingCapacity) *
            100,
          100,
        )
      : 0;

  return (
    <Card className="h-full">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted">
              Voted Location
            </p>

            <h2 className="mt-1 text-lg font-semibold">
              Where people are coming from
            </h2>
          </div>

          <MapPin className="h-5 w-5 text-muted" />
        </div>

        {!hasVotes ? (
          <div className="mt-8 rounded-xl bg-surface p-6 text-center">
            <MapPin className="mx-auto h-8 w-8 text-muted" />

            <p className="mt-3 text-sm font-medium">
              No location votes yet
            </p>

            <p className="mt-1 text-xs text-muted">
              Location distribution will appear here
              once registrations are received.
            </p>
          </div>
        ) : (
          <div className="mt-7">
            {/* Top 1 Location */}
            <div>
              <div className="mb-2 flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                    1
                  </span>

                  <span
                    className="truncate text-sm font-medium"
                    title={topLocation.name}
                  >
                    {topLocation.name}
                  </span>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-sm font-bold">
                    {topLocation.count}
                  </span>

                  <span className="text-xs text-muted">
                    ({topLocation.percentage}%)
                  </span>
                </div>
              </div>

              <div className="h-2.5 overflow-hidden rounded-full bg-surface">
                <div
                  className="h-full rounded-full bg-brand transition-all duration-500"
                  style={{
                    width: `${topLocation.percentage}%`,
                  }}
                />
              </div>
            </div>

            {/* Carpark comparison */}
            <div className="mt-6 rounded-xl bg-surface p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <CarFront className="h-4 w-4 text-muted" />

                  <span className="text-sm font-medium">
                    Parking Capacity
                  </span>
                </div>

                <span
                  className={`text-sm font-bold ${
                    parkingFull
                      ? "text-danger"
                      : "text-success"
                  }`}
                >
                  {topLocationCars} / {parkingCapacity}
                </span>
              </div>

              <p className="mt-1 text-xs text-muted">
                Cars / available parking spaces
              </p>

              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-card">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    parkingFull
                      ? "bg-danger"
                      : "bg-success"
                  }`}
                  style={{
                    width: `${parkingPercentage}%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* =========================================================
   TRAVEL PREFERENCE
========================================================= */

function TravelDonut({
  selfDrive,
  carShare,
}: {
  selfDrive: number;
  carShare: number;
}) {
  const total = selfDrive + carShare;

  const radius = 42;
  const circumference = 2 * Math.PI * radius;

  const selfDriveLength =
    total > 0
      ? (selfDrive / total) * circumference
      : 0;

  const selfDrivePercentage =
    total > 0
      ? Math.round((selfDrive / total) * 100)
      : 0;

  const carSharePercentage =
    total > 0
      ? Math.round((carShare / total) * 100)
      : 0;

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <div className="relative h-40 w-40 shrink-0">
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full -rotate-90"
        >
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="12"
            className="text-surface"
          />

          {total > 0 && (
            <>
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${selfDriveLength} ${circumference}`}
                className="text-brand transition-all duration-500"
              />

              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                strokeDasharray={`${
                  circumference - selfDriveLength
                } ${circumference}`}
                strokeDashoffset={-selfDriveLength}
                className="text-accent transition-all duration-500"
              />
            </>
          )}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold tracking-tight">
            {total}
          </span>

          <span className="text-xs text-muted">
            registrations
          </span>
        </div>
      </div>

      <div className="w-full space-y-4">
        {/* Self Drive */}
        <div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-brand" />

              <span className="text-sm text-card-foreground">
                Self Drive
              </span>
            </div>

            <span className="text-sm font-semibold">
              {selfDrive}
            </span>
          </div>

          <div className="mt-1 text-right text-xs text-muted">
            {selfDrivePercentage}%
          </div>
        </div>

        {/* Car Share */}
        <div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-accent" />

              <span className="text-sm text-card-foreground">
                Car Share
              </span>
            </div>

            <span className="text-sm font-semibold">
              {carShare}
            </span>
          </div>

          <div className="mt-1 text-right text-xs text-muted">
            {carSharePercentage}%
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   FILTER
========================================================= */

function RegistrationFilter({
  filter,
  onFilterChange,
  locationMapping,
}: RegistrationFilterProps) {
  const handleSearchChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    onFilterChange({
      ...filter,
      search: e.target.value,
    });
  };

  const handleTravelOptionChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    onFilterChange({
      ...filter,
      travelOption: e.target.value,
    });
  };

  const handleLocationChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    onFilterChange({
      ...filter,
      location: e.target.value,
    });
  };

  const handleClear = () => {
    onFilterChange(emptyFilter());
  };

  const hasActiveFilter = Boolean(
    filter.search ||
      filter.travelOption ||
      filter.location,
  );

  return (
    <Card>
      <CardContent>
        <div className="flex flex-col gap-4 p-4 md:flex-row md:flex-wrap md:items-end">
          {/* Search */}
          <div className="flex min-w-[200px] flex-1 flex-col gap-1.5">
            <label
              htmlFor="search"
              className="text-sm font-medium text-card-foreground"
            >
              Search registrations
            </label>

            <input
              id="search"
              type="text"
              placeholder="Search by name, phone, or Line ID"
              className="rounded-lg border border-line bg-card p-2.5 text-sm text-card-foreground outline-none transition-colors placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand/10"
              value={filter.search}
              onChange={handleSearchChange}
            />
          </div>

          {/* Travel Option */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="travelOption"
              className="text-sm font-medium text-card-foreground"
            >
              Travel Option
            </label>

            <select
              id="travelOption"
              className="rounded-lg border border-line bg-card p-2.5 text-sm text-card-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
              value={filter.travelOption}
              onChange={handleTravelOptionChange}
            >
              <option value="">All</option>

              <option value="SELF_DRIVE">
                Self Drive
              </option>

              <option value="CAR_SHARE">
                Car Share
              </option>
            </select>
          </div>

          {/* Location */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="location"
              className="text-sm font-medium text-card-foreground"
            >
              Location
            </label>

            <select
              id="location"
              className="rounded-lg border border-line bg-card p-2.5 text-sm text-card-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
              value={filter.location}
              onChange={handleLocationChange}
            >
              <option value="">All</option>

              {Object.entries(locationMapping).map(
                ([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ),
              )}
            </select>
          </div>

          {/* Clear */}
          <Button
            type="button"
            onClick={handleClear}
            disabled={!hasActiveFilter}
            variant="outline"
            className="h-fit rounded-lg disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4 w-4" />
            Clear filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* =========================================================
   REGISTRATION TABLE
========================================================= */

function RegistrationTable({
  registrations,
  locationMapping,
}: {
  registrations: Registration[];
  locationMapping: Record<string, string>;
}) {
  const router = useRouter();

  return (
    <div className="min-w-0">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            Registration List
          </h2>

          <p className="mt-1 text-sm text-muted">
            Manage and review individual registrations.
          </p>
        </div>

        <span className="text-sm text-muted">
          {registrations.length} results
        </span>
      </div>

      <div className="w-full min-w-0 overflow-x-auto rounded-xl border border-line bg-card">
        <table className="w-full min-w-[1250px] table-fixed border-collapse">
          <colgroup>
            <col className="w-[12%]" />
            <col className="w-[10%]" />
            <col className="w-[9%]" />
            <col className="w-[13%]" />
            <col className="w-[13%]" />
            <col className="w-[7%]" />
            <col className="w-[7%]" />
            <col className="w-[8%]" />
            <col className="w-[13%]" />
            <col className="w-[6%]" />
          </colgroup>

          <thead>
            <tr className="border-b border-line bg-surface/50">
              <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted">
                Name
              </th>

              <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted">
                Phone
              </th>

              <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted">
                Line ID
              </th>

              <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted">
                Location
              </th>

              <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted">
                Travel
                <br />
                Option
              </th>

              <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted">
                Can take
                <br />
                others?
              </th>

              <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted">
                Empty Seats
              </th>

              <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted">
                Companions
              </th>

              <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted">
                Note
              </th>

              <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {registrations.length === 0 ? (
              <tr className="h-16">
                <td
                  colSpan={10}
                  className="px-4 text-center text-sm text-muted"
                >
                  No registrations match your filters.
                </td>
              </tr>
            ) : (
              registrations.map((registration) => (
                <tr
                  key={registration.id}
                  className="h-16 border-b border-line last:border-0 hover:bg-surface/40"
                >
                  {/* Name */}
                  <td className="h-16 max-w-0 px-3 py-2 align-middle">
                    <div
                      className="truncate text-sm font-medium"
                      title={registration.name ?? ""}
                    >
                      {registration.name ?? "-"}
                    </div>
                  </td>

                  {/* Phone */}
                  <td className="h-16 max-w-0 px-3 py-2 align-middle">
                    <div
                      className="truncate text-sm"
                      title={registration.phone ?? ""}
                    >
                      {registration.phone ?? "-"}
                    </div>
                  </td>

                  {/* Line ID */}
                  <td className="h-16 max-w-0 px-3 py-2 align-middle">
                    <div
                      className="truncate text-sm"
                      title={registration.lineId ?? ""}
                    >
                      {registration.lineId ?? "-"}
                    </div>
                  </td>

                  {/* Location */}
                  <td className="h-16 max-w-0 px-3 py-2 align-middle">
                    <div
                      className="truncate text-sm"
                      title={
                        locationMapping[
                          registration.locationId
                        ] ?? ""
                      }
                    >
                      {locationMapping[
                        registration.locationId
                      ] ?? "-"}
                    </div>
                  </td>

                  {/* Travel */}
                  <td className="h-16 px-3 py-2 align-middle">
                    <span className="whitespace-nowrap text-sm">
                      {TravelOptionMapping[
                        registration.travelOption
                      ] ?? "-"}
                    </span>
                  </td>

                  {/* Can take others */}
                  <td className="h-16 px-3 py-2 text-right align-middle">
                    <span
                      className={
                        registration.carShare
                          ? "font-medium text-accent"
                          : "text-muted"
                      }
                    >
                      {registration.carShare
                        ? "Yes"
                        : "No"}
                    </span>
                  </td>

                  {/* Empty seats */}
                  <td className="h-16 px-3 py-2 text-right align-middle text-sm">
                    {registration.emptySeats ?? "-"}
                  </td>

                  {/* Companions */}
                  <td className="h-16 px-3 py-2 text-right align-middle text-sm">
                    {registration.companions?.length ?? 0}
                  </td>

                  {/* Note */}
                  <td className="h-16 max-w-0 px-3 py-2 align-middle">
                    {registration.note ? (
                      <p
                        className="line-clamp-2 text-sm leading-5 text-muted"
                        title={registration.note}
                      >
                        {registration.note}
                      </p>
                    ) : (
                      <span className="text-sm text-muted">
                        -
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="h-16 px-3 py-2 align-middle">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full whitespace-nowrap"
                      onClick={() => {
                        router.push(
                          `/detail/${registration.id}`,
                        );
                      }}
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* =========================================================
   SEND FORM
========================================================= */

function SentFormDialog({
  handleSentForm,
}: {
  handleSentForm: () => void;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Copy className="h-4 w-4" />
          Send Form
        </Button>
      </DialogTrigger>

      <DialogContent className="gap-4 p-6 text-card-foreground">
        <DialogHeader>
          <DialogTitle>Copy Form URL</DialogTitle>
        </DialogHeader>

        <DialogDescription className="flex flex-row items-center gap-2">
          <p className="flex-1 text-sm text-muted">
            Form URL:{" "}
            {typeof window !== "undefined"
              ? `${window.location.origin}/create`
              : "/create"}
          </p>

          <Button
            onClick={handleSentForm}
            className="w-fit"
            variant="ghost"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

export function Dashboard() {
  const [filter, setFilter] =
    useState<Filter>(emptyFilter());

  const router = useRouter();

  /* =======================================================
     REGISTRATIONS
  ======================================================= */

  const {
    data: registrations = [],
    isLoading,
    error,
  } = useQuery<Registration[]>({
    queryKey: ["registrations"],
    queryFn: () => getAllRegistrations(),
  });

  /* =======================================================
     LOCATIONS
  ======================================================= */

  const {
    data: locations = [],
    isLoading: locationsLoading,
    error: locationsError,
  } = useQuery<Location[]>({
    queryKey: ["locations"],
    queryFn: () => getLocations(),
  });

  /* =======================================================
     LOCATION MAPPING
  ======================================================= */

  const locationMapping =
    useMemo<Record<string, string>>(
      () =>
        locations.reduce(
          (acc, location) => {
            acc[location.id] = location.name;

            return acc;
          },
          {} as Record<string, string>,
        ),
      [locations],
    );

  /* =======================================================
     FILTERED REGISTRATIONS
  ======================================================= */

  const filteredRegistrations =
    useMemo(() => {
      const searchTerm = filter.search
        .trim()
        .toLowerCase();

      return registrations.filter(
        (registration) => {
          /* Travel Option */
          if (
            filter.travelOption &&
            registration.travelOption !==
              filter.travelOption
          ) {
            return false;
          }

          /* Location */
          if (
            filter.location &&
            String(registration.locationId) !==
              filter.location
          ) {
            return false;
          }

          /* Search */
          if (searchTerm) {
            const haystack = [
              registration.name,
              registration.phone,
              registration.lineId,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

            if (!haystack.includes(searchTerm)) {
              return false;
            }
          }

          return true;
        },
      );
    }, [registrations, filter]);

  /* =======================================================
     DASHBOARD DATA
  ======================================================= */

  const dashboardData = useMemo(() => {
    /*
     * Registered employees
     */
    const employees =
      filteredRegistrations.length;

    /*
     * Companions
     */
    const companions =
      filteredRegistrations.reduce(
        (sum, registration) =>
          sum +
          (registration.companions?.length ?? 0),
        0,
      );

    /*
     * Total people
     */
    const totalPeople =
      employees + companions;

    /*
     * Cars
     *
     * จำนวน registration ที่เลือก SELF_DRIVE
     */
    const totalCars =
      filteredRegistrations.filter(
        (registration) =>
          registration.travelOption ===
          "SELF_DRIVE",
      ).length;

    /*
     * Need a ride
     */
    const needRide =
      filteredRegistrations.filter(
        (registration) =>
          registration.travelOption ===
          "CAR_SHARE",
      ).length;

    /*
     * Available seats
     *
     * รวม emptySeats จากคนที่ขับรถเอง
     */
    const availableSeats =
      filteredRegistrations
        .filter(
          (registration) =>
            registration.travelOption ===
            "SELF_DRIVE",
        )
        .reduce(
          (sum, registration) =>
            sum +
            toNumber(registration.emptySeats),
          0,
        );

    /* =====================================================
       VOTED LOCATION
    ===================================================== */

    const locationMap =
      new Map<
        string,
        {
          id: string;
          name: string;
          count: number;
        }
      >();

    filteredRegistrations.forEach(
      (registration) => {
        const id = String(
          registration.locationId,
        );

        const current = locationMap.get(id);

        if (current) {
          current.count += 1;
          return;
        }

        locationMap.set(id, {
          id,
          name:
            locationMapping[id] ??
            "Unknown Location",
          count: 1,
        });
      },
    );

    const totalLocationVotes =
      filteredRegistrations.length;

    const locationVotes: LocationVote[] =
      Array.from(locationMap.values())
        .map((location) => ({
          id: location.id,
          name: location.name,
          count: location.count,
          percentage:
            totalLocationVotes > 0
              ? Math.round(
                  (location.count /
                    totalLocationVotes) *
                    100,
                )
              : 0,
        }))
        .sort(
          (a, b) =>
            b.count - a.count,
        );

    /* =====================================================
       TOP LOCATION PARKING
    ===================================================== */

    const topLocation =
      locationVotes[0];

    /*
     * Capacity ของ location อันดับ 1
     */
    const topLocationData =
      topLocation
        ? locations.find(
            (location) =>
              String(location.id) ===
              String(topLocation.id),
          )
        : undefined;

    const topLocationCarparkCapacity =
      toNumber(
        topLocationData?.carparkCapacity,
      );

    /*
     * IMPORTANT:
     *
     * นับเฉพาะรถ SELF_DRIVE
     * ที่มาจาก TOP LOCATION
     *
     * ไม่ใช่ totalCars ของทุก location
     */
    const topLocationCars =
      topLocation
        ? filteredRegistrations.filter(
            (registration) =>
              String(
                registration.locationId,
              ) === String(topLocation.id) &&
              registration.travelOption ===
                "SELF_DRIVE",
          ).length
        : 0;

    return {
      employees,
      companions,
      totalPeople,
      totalCars,
      needRide,
      availableSeats,
      locationVotes,
      topLocationCars,
      topLocationCarparkCapacity,
    };
  }, [
    filteredRegistrations,
    locations,
    locationMapping,
  ]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (
    isLoading ||
    locationsLoading
  ) {
    return <Loading />;
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <div className="rounded-xl border border-line bg-card p-6 text-danger">
        Error: {error.message}
      </div>
    );
  }

  if (locationsError) {
    return (
      <div className="rounded-xl border border-line bg-card p-6 text-danger">
        Error: {locationsError.message}
      </div>
    );
  }

  /* =======================================================
     PENDING LOCATIONS
  ======================================================= */

  const pendingLocations =
    locations.filter(
      (location) =>
        location.status === "PENDING",
    ).length;

  /* =======================================================
     SEND FORM
  ======================================================= */

  const handleSentForm = async () => {
    const url =
      `${window.location.origin}/create`;

    try {
      await window.navigator.clipboard.writeText(
        url,
      );
    } catch (error) {
      console.error(
        "Failed to copy form URL:",
        error,
      );
    }
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-full bg-card p-4 text-card-foreground sm:p-6">
      <div className="mx-auto w-full max-w-[1600px]">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Registration Dashboard
            </h1>

            <p className="mt-1 text-sm text-muted">
              Monitor the current registration
              situation and take action quickly.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <p className="hidden text-xs text-muted sm:block">
              Updated{" "}
              {new Date().toLocaleTimeString(
                [],
                {
                  hour: "2-digit",
                  minute: "2-digit",
                },
              )}
            </p>

            <Button
              onClick={() => {
                router.push(
                  "/manage-locations",
                );
              }}
              variant="outline"
            >
              <MapPin className="h-4 w-4" />

              Manage Locations

              {pendingLocations > 0 && (
                <span className="rounded-full bg-brand px-2 py-0.5 text-xs text-white">
                  {pendingLocations}
                </span>
              )}
            </Button>

            <SentFormDialog
              handleSentForm={
                handleSentForm
              }
            />
          </div>
        </div>

        {/* =================================================
            KPI
        ================================================= */}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Registered */}
          <StatCard
            title="Registered"
            value={
              dashboardData.employees
            }
            description="reply from employees"
            icon={Users}
          />

          {/* Cars */}
          <StatCard
            title="Cars"
            value={
              dashboardData.totalCars
            }
            description="Self Drive"
            icon={CarFront}
          />

          {/* Need Ride */}
          <StatCard
            title="Need a Ride"
            value={
              dashboardData.needRide
            }
            description="Car Share"
            icon={CarTaxiFront}
            iconClassName="bg-accent/15 text-accent"
          />

          {/* Open Seats */}
          <StatCard
            title="Open Seats"
            value={
              dashboardData.availableSeats
            }
            description="Seats offered by Self Drive"
            icon={CheckCircle2}
            iconClassName="bg-success-soft text-success"
          />
        </div>

        {/* =================================================
            MONITORING
        ================================================= */}

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.35fr_1fr]">
          {/* Voted Location */}
          <VotedLocation
            locations={
              dashboardData.locationVotes
            }
            topLocationCars={
              dashboardData.topLocationCars
            }
            topLocationCarparkCapacity={
              dashboardData.topLocationCarparkCapacity
            }
          />

          {/* Travel Preference */}
          <Card className="h-full">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-muted">
                    Travel Preference
                  </p>

                  <h2 className="mt-1 text-lg font-semibold">
                    How people are travelling
                  </h2>
                </div>

                <Car className="h-5 w-5 text-muted" />
              </div>

              <div className="mt-7">
                <TravelDonut
                  selfDrive={
                    dashboardData.totalCars
                  }
                  carShare={
                    dashboardData.needRide
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* =================================================
            FILTER
        ================================================= */}

        <div className="mt-8">
          <RegistrationFilter
            filter={filter}
            onFilterChange={setFilter}
            locationMapping={
              locationMapping
            }
          />
        </div>

        {/* =================================================
            REGISTRATION LIST
        ================================================= */}

        <div className="mt-8">
          <RegistrationTable
            registrations={
              filteredRegistrations
            }
            locationMapping={
              locationMapping
            }
          />
        </div>
      </div>
    </div>
  );
}
