"use client";

import {
  Copy,
  Eye,
  MapPin,
  X,
  Mail,
  Car,
  Users,
  CarFront,
  CarTaxiFront,
  Armchair,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import {
  getAllRegistrations,
  getLocations,
} from "../../../src/_lib/api/registrationService";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../src/_component/card-template";

import { Registration } from "@/src/_lib/api/registration-type";
import { useState } from "react";
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

type TravelOption =
  | "SELF_DRIVE"
  | "CAR_SHARE"
  | "PUBLIC_TRANSPORT";

const TravelOptionMapping: Record<string, string> = {
  SELF_DRIVE: "Self Drive",
  CAR_SHARE: "Car Share",
  PUBLIC_TRANSPORT: "Public Transport",
};

type Filter = {
  travelOption: string;
  location: string;
  search: string;
};

const emptyFilter = (): Filter => ({
  travelOption: "",
  location: "",
  search: "",
});

type RegistrationFilterProps = {
  filter: Filter;
  onFilterChange: (filter: Filter) => void;
  locationMapping: Record<string, string>;
};

function SummaryCard({
  submitted,
  mostTravelOption,
  totalEmptySeats,
  selfDriveCount,
  carShareCount,
  companionsCount,
  mostLocationPicked,
  locationMapping,
}: {
  submitted: number;
  mostTravelOption: string;
  totalEmptySeats: number;
  selfDriveCount: number;
  carShareCount: number;
  companionsCount: number;
  mostLocationPicked: string;
  locationMapping: Record<string, string>;
}) {
  return (
    <div className="my-4 grid grid-cols-1 gap-4 bg-card text-card-foreground md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle>Submitted Registrations</CardTitle>
        </CardHeader>

        <CardContent className="flex items-center gap-3 text-brand">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10">
            <Mail className="h-5 w-5" />
          </div>

          <p className="text-2xl font-bold">
            {submitted}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Most Location Picked</CardTitle>
        </CardHeader>

        <CardContent className="flex items-center gap-3 text-brand">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10">
            <MapPin className="h-5 w-5" />
          </div>

          <p className="truncate text-2xl font-bold">
            {locationMapping?.[mostLocationPicked] ?? "-"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Most Travel Option</CardTitle>
        </CardHeader>

        <CardContent className="flex items-center gap-3 text-brand">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10">
            <Car className="h-5 w-5" />
          </div>

          <p className="text-2xl font-bold">
            {TravelOptionMapping[mostTravelOption] ?? "-"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Self Drive</CardTitle>
        </CardHeader>

        <CardContent className="flex items-center gap-3 text-brand">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10">
            <CarFront className="h-5 w-5" />
          </div>

          <p className="text-2xl font-bold">
            {selfDriveCount}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Car Share</CardTitle>
        </CardHeader>

        <CardContent className="flex items-center gap-3 text-brand">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
            <CarTaxiFront className="h-5 w-5" />
          </div>

          <p className="text-2xl font-bold">
            {carShareCount}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Total Empty Seats</CardTitle>
        </CardHeader>

        <CardContent className="flex items-center gap-3 text-brand">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10">
            <Armchair className="h-5 w-5" />
          </div>

          <p className="text-2xl font-bold">
            {totalEmptySeats}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>People Count</CardTitle>
        </CardHeader>

        <CardContent className="flex items-center gap-3 text-brand">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10">
            <Users className="h-5 w-5" />
          </div>

          <p className="text-2xl font-bold">
            {companionsCount}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

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
          <div className="flex min-w-[200px] flex-1 flex-col gap-1.5">
            <label
              htmlFor="search"
              className="text-sm font-medium text-card-foreground"
            >
              Search
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

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="travelOption"
              className="text-sm font-medium text-card-foreground"
            >
              Travel Option
            </label>

            <select
              id="travelOption"
              className="rounded-lg border border-line bg-card p-2.5 text-sm text-card-foreground outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/10"
              value={filter.travelOption}
              onChange={handleTravelOptionChange}
            >
              <option value="">All</option>
              <option value="SELF_DRIVE">Self Drive</option>
              <option value="CAR_SHARE">Car Share</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="location"
              className="text-sm font-medium text-card-foreground"
            >
              Location
            </label>

            <select
              id="location"
              className="rounded-lg border border-line bg-card p-2.5 text-sm text-card-foreground outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/10"
              value={filter.location}
              onChange={handleLocationChange}
            >
              <option value="">All</option>

              {Object.entries(locationMapping ?? {}).map(
                ([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ),
              )}
            </select>
          </div>

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

function RegistrationTable({
  registrations,
  locationMapping,
}: {
  registrations: Registration[];
  locationMapping: Record<string, string>;
}) {
  const router = useRouter();

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-card-foreground">
        Registration List
      </h1>

      <div className="my-4 w-full max-w-full overflow-x-auto rounded-xl border border-line bg-card p-4">
        <table className="w-full min-w-[1200px] table-fixed">
          <thead>
            <tr className="border-b border-line text-right">
              {[
                "Name",
                "Phone",
                "Line ID",
                "Location",
                "Travel Option",
                "Car Shared",
                "Empty Seats",
                "Companions",
                "Note",
                "Actions",
              ].map((heading) => (
                <th
                  key={heading}
                  className="p-3 text-xs font-semibold uppercase tracking-wide text-muted"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {registrations.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="p-8 text-center text-sm text-muted"
                >
                  No registrations match your filters.
                </td>
              </tr>
            ) : (
              registrations.map((registration, index) => (
                <tr
                  key={index}
                  className="border-b border-line text-right transition-colors last:border-0 hover:bg-surface/60"
                >
                  <td className="break-words p-3 text-sm text-card-foreground">
                    {registration.name ?? "-"}
                  </td>

                  <td className="break-words p-3 text-sm text-card-foreground">
                    {registration.phone ?? "-"}
                  </td>

                  <td className="break-words p-3 text-sm text-card-foreground">
                    {registration.lineId ?? "-"}
                  </td>

                  <td className="break-words p-3 text-sm text-card-foreground">
                    {locationMapping[registration.locationId] ?? "-"}
                  </td>

                  <td className="break-words p-3 text-sm text-card-foreground">
                    {TravelOptionMapping[
                      registration.travelOption
                    ] ?? "-"}
                  </td>

                  <td className="break-words p-3 text-sm text-card-foreground">
                    {registration.carShare ? "Yes" : "No"}
                  </td>

                  <td className="break-words p-3 text-sm text-card-foreground">
                    {registration.emptySeats ?? "-"}
                  </td>

                  <td className="break-words p-3 text-sm text-card-foreground">
                    {registration.companions?.length ?? "-"}
                  </td>

                  <td className="break-words p-3 text-sm text-muted">
                    {registration.note ?? "-"}
                  </td>

                  <td className="p-3">
                    <Button
                      variant="outline"
                      className="w-full"
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

function SentFormDialog({
  handleSentForm,
}: {
  handleSentForm: () => void;
}) {
  return (
    <Dialog>
      <DialogTrigger>
        <Button>
          <Copy className="h-4 w-4" />
          Sent Form
        </Button>
      </DialogTrigger>

      <DialogContent className="gap-4 p-6 text-card-foreground">
        <DialogHeader>
          <DialogTitle>Copy Form URL</DialogTitle>
        </DialogHeader>

        <DialogDescription className="flex flex-row items-center gap-2">
          <p className="flex-1 text-sm text-muted">
            Form URL: {window.location.origin}/create
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

export function Dashboard() {
  const [filter, setFilter] =
    useState<Filter>(emptyFilter());

  const router = useRouter();

  const {
    data: registrations,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["registrations"],
    queryFn: () => getAllRegistrations(),
  });

  const {
    data: locations,
    isLoading: locationsLoading,
    error: locationsError,
  } = useQuery({
    queryKey: ["locations"],
    queryFn: () => getLocations(),
  });

  const locationMapping: Record<string, string> =
    locations?.reduce(
      (acc, location) => {
        acc[location.id] = location.name;
        return acc;
      },
      {} as Record<string, string>,
    ) ?? {};

  if (isLoading || locationsLoading) {
    return <Loading />;
  }

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

  const filteredRegistrations = (
    registrations ?? []
  ).filter((registration) => {
    if (
      filter.travelOption &&
      registration.travelOption !==
        filter.travelOption
    ) {
      return false;
    }

    if (
      filter.location &&
      String(registration.locationId) !==
        filter.location
    ) {
      return false;
    }

    if (filter.search.trim()) {
      const term =
        filter.search.trim().toLowerCase();

      const haystack = [
        registration.name,
        registration.phone,
        registration.lineId,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(term)) {
        return false;
      }
    }

    return true;
  });

  const submittedRegistrations =
    filteredRegistrations.length;

  const travelCounts =
    filteredRegistrations.reduce(
      (acc, curr) => {
        acc[curr.travelOption] =
          (acc[curr.travelOption] ?? 0) + 1;

        return acc;
      },
      {} as Record<TravelOption, number>,
    );

  const mostTravelOption =
    Object.entries(travelCounts).reduce(
      (most, current) => {
        return current[1] >
          (most[1] as number)
          ? current
          : most;
      },
      ["-", 0],
    )[0];

  const totalEmptySeats =
    filteredRegistrations.reduce(
      (acc, curr) =>
        acc + (curr.emptySeats ?? 0),
      0,
    );

  const selfDriveCount =
    filteredRegistrations.filter(
      (curr) =>
        curr.travelOption === "SELF_DRIVE",
    ).length;

  const carShareCount =
    filteredRegistrations.filter(
      (curr) =>
        curr.travelOption === "CAR_SHARE",
    ).length;

  const companionsCount =
    filteredRegistrations.reduce(
      (acc, curr) =>
        acc + 1 + (curr.companions?.length ?? 0),
      0,
    );

  const locationCounts =
    filteredRegistrations.reduce(
      (acc, curr) => {
        acc[curr.locationId] =
          (acc[curr.locationId] ?? 0) + 1;

        return acc;
      },
      {} as Record<string, number>,
    );

  const mostLocationPicked =
    Object.entries(locationCounts).reduce(
      (most, current) => {
        return current[1] > most[1]
          ? current
          : most;
      },
      ["-", 0],
    )[0] as string;

  const pendingLocations =
    locations?.filter(
      (location) =>
        location.status === "PENDING",
    ).length ?? 0;

  const handleSentForm = () => {
    window.navigator.clipboard.writeText(
      window.location.origin + "/create",
    );
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl bg-card p-6 text-card-foreground">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Registration Dashboard
          </h1>

          <p className="mt-1 text-sm text-muted">
            Last updated:{" "}
            {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center">
          <Button
            onClick={() => {
              router.push("/manage-locations");
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
            handleSentForm={handleSentForm}
          />
        </div>
      </div>

      {/* Summary */}
      <SummaryCard
        submitted={submittedRegistrations}
        mostTravelOption={mostTravelOption}
        totalEmptySeats={totalEmptySeats}
        selfDriveCount={selfDriveCount}
        carShareCount={carShareCount}
        companionsCount={companionsCount}
        mostLocationPicked={mostLocationPicked}
        locationMapping={locationMapping}
      />

      {/* Filters */}
      <RegistrationFilter
        filter={filter}
        onFilterChange={setFilter}
        locationMapping={locationMapping}
      />

      {/* Table */}
      <RegistrationTable
        registrations={filteredRegistrations}
        locationMapping={locationMapping}
      />
    </div>
  );
}
