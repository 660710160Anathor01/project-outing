"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Car,
  MapPin,
  Users,
  UserRound,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

import {
  getAllRegistrations,
  getLocations,
} from "@/src/_lib/api/registrationService";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/src/_component/card-template";

import type { Registration } from "@/src/_lib/api/registration-type";
import Loading from "../loading";

type Location = {
  id: string;
  name: string;
  status?: string;
};

type LocationReport = {
  id: string;
  name: string;
  registrations: number;
  cars: number;
  needRide: number;
};

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
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted">{title}</p>

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
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SectionTitle({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-card-foreground">
          {title}
        </h2>

        {description && (
          <p className="mt-0.5 text-sm text-muted">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

function TransportationCard({
  availableSeats,
  needRide,
  totalCars,
}: {
  availableSeats: number;
  needRide: number;
  totalCars: number;
}) {
  const balance = availableSeats - needRide;

  const maxValue = Math.max(
    availableSeats,
    needRide,
    1,
  );

  const availableWidth =
    (availableSeats / maxValue) * 100;

  const needRideWidth =
    (needRide / maxValue) * 100;

  const enoughSeats = balance >= 0;

  return (
    <Card>
      <CardContent className="p-6">
        <SectionTitle
          icon={Car}
          title="Transportation"
          description="Compare available seats with people who need a ride."
        />

        <div className="grid gap-6 md:grid-cols-2">
          {/* Available */}
          <div>
            <div className="mb-2 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm text-muted">
                  Available seats
                </p>

                <p className="text-2xl font-bold text-card-foreground">
                  {availableSeats}
                </p>
              </div>

              <p className="text-xs text-muted">
                {totalCars} totalCars
              </p>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-surface">
              <div
                className="h-full rounded-full bg-brand transition-all"
                style={{
                  width: `${availableWidth}%`,
                }}
              />
            </div>
          </div>

          {/* Need ride */}
          <div>
            <div className="mb-2 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm text-muted">
                  People needing a ride
                </p>

                <p className="text-2xl font-bold text-card-foreground">
                  {needRide}
                </p>
              </div>

              <p className="text-xs text-muted">
                Car Share
              </p>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-surface">
              <div
                className="h-full rounded-full bg-accent transition-all"
                style={{
                  width: `${needRideWidth}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div
    className={`mt-6 flex items-center justify-between gap-4 rounded-xl border p-4 ${
        enoughSeats
        ? "border-success-border bg-success-soft"
        : "border-danger-border bg-danger-soft"
    }`}
    >
    <div className="flex items-center gap-3">
        {enoughSeats ? (
        <CheckCircle2
            className="h-5 w-5 shrink-0 text-success"
            aria-hidden="true"
        />
        ) : (
        <AlertTriangle
            className="h-5 w-5 shrink-0 text-danger"
            aria-hidden="true"
        />
        )}

        <div>
        <p
            className={`font-semibold ${
            enoughSeats
                ? "text-success"
                : "text-danger"
            }`}
        >
            {enoughSeats
            ? "Enough capacity"
            : "Not enough seats"}
        </p>

        <p className="text-xs text-muted">
            {enoughSeats
            ? `${balance} seat${
                balance === 1 ? "" : "s"
                } remaining`
            : `${Math.abs(balance)} more seat${
                Math.abs(balance) === 1
                    ? ""
                    : "s"
                } needed`}
        </p>
        </div>
    </div>

    <p
        className={`text-xl font-bold ${
        enoughSeats
            ? "text-success"
            : "text-danger"
        }`}
    >
        {balance > 0 ? "+" : ""}
        {balance}
    </p>
    </div>

      </CardContent>
    </Card>
  );
}

function TopLocations({
  locations,
}: {
  locations: LocationReport[];
}) {
  const topLocations = locations
    .sort(
      (a, b) =>
        b.registrations - a.registrations,
    )
    .slice(0, 3);

  const maxVotes =
    topLocations[0]?.registrations ?? 1;

  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <SectionTitle
          icon={MapPin}
          title="Top 3 Voted Locations"
          description="Most selected locations by registration."
        />

        <div className="space-y-5">
          {topLocations.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">
              No location data available.
            </p>
          ) : (
            topLocations.map((location, index) => {
              const percentage =
                (location.registrations /
                  maxVotes) *
                100;

              return (
                <div
                  key={location.id}
                  className="flex gap-3"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-sm font-bold text-card-foreground">
                    {index === 0
                      ? "🥇"
                      : index === 1
                        ? "🥈"
                        : "🥉"}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-medium text-card-foreground">
                        {location.name}
                      </p>

                      <span className="shrink-0 text-sm font-semibold text-card-foreground">
                        {location.registrations}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-surface">
                      <div
                        className="h-full rounded-full bg-brand transition-all"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function TravelOptionCard({
  totalCars,
  needRide,
  total,
}: {
  totalCars: number;
  needRide: number;
  total: number;
}) {
  const driverPercentage =
    total > 0
      ? Math.round((totalCars / total) * 100)
      : 0;

  const ridePercentage =
    total > 0
      ? Math.round((needRide / total) * 100)
      : 0;

  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <SectionTitle
          icon={Car}
          title="Travel Option"
          description="How registered employees plan to travel."
        />

        <div className="flex flex-col gap-5">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-brand" />
                <span className="text-sm text-card-foreground">
                  Self Drive
                </span>
              </div>

              <div className="text-right">
                <span className="font-semibold text-card-foreground">
                  {totalCars}
                </span>

                <span className="ml-2 text-xs text-muted">
                  ({driverPercentage}%)
                </span>
              </div>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-surface">
              <div
                className="h-full rounded-full bg-brand"
                style={{
                  width: `${driverPercentage}%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-accent" />                <span className="text-sm text-card-foreground">
                  Car Share
                </span>
              </div>

              <div className="text-right">
                <span className="font-semibold text-card-foreground">
                  {needRide}
                </span>

                <span className="ml-2 text-xs text-muted">
                  ({ridePercentage}%)
                </span>
              </div>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-surface">
              <div
                className="h-full rounded-full bg-orange-500"
                style={{
                  width: `${ridePercentage}%`,
                }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PeopleBreakdown({
  employees,
  companions,
}: {
  employees: number;
  companions: number;
}) {
  const total = employees + companions;

  return (
    <Card>
      <CardContent className="p-6">
        <SectionTitle
          icon={Users}
          title="People Breakdown"
          description="Registered employees and additional companions."
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-surface p-4">
            <p className="text-sm text-muted">
              Registered Employees
            </p>

            <p className="mt-2 text-2xl font-bold text-card-foreground">
              {employees}
            </p>
          </div>

          <div className="rounded-xl bg-surface p-4">
            <p className="text-sm text-muted">
              Companions
            </p>

            <p className="mt-2 text-2xl font-bold text-card-foreground">
              {companions}
            </p>
          </div>

          <div className="rounded-xl bg-brand/10 p-4">
            <p className="text-sm text-brand">
              Total People
            </p>

            <p className="mt-2 text-2xl font-bold text-brand">
              {total}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LocationBreakdown({
  locations,
}: {
  locations: LocationReport[];
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <SectionTitle
          icon={MapPin}
          title="Location Breakdown"
          description="Registration and transportation demand by location."
        />

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px]">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
                  Location
                </th>

                <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted">
                  Registrations
                </th>

                <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted">
                  Cars
                </th>

                <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted">
                  Need Ride
                </th>
              </tr>
            </thead>

            <tbody>
              {locations.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-8 text-center text-sm text-muted"
                  >
                    No location data available.
                  </td>
                </tr>
              ) : (
                locations.map((location) => (
                  <tr
                    key={location.id}
                    className="border-b border-line last:border-0"
                  >
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted" />
                        <span className="font-medium text-card-foreground">
                          {location.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-3 py-3 text-right font-medium text-card-foreground">
                      {location.registrations}
                    </td>

                    <td className="px-3 py-3 text-right font-medium text-card-foreground">
                      {location.cars}
                    </td>

                    <td className="px-3 py-3 text-right font-medium text-card-foreground">
                      {location.needRide}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function TripInsights({
  totalCars,
  availableSeats,
  needRide,
  companions,
  topLocation,
}: {
  totalCars: number;
  availableSeats: number;
  needRide: number;
  companions: number;
  topLocation?: string;
}) {
  const balance =
    availableSeats - needRide;

  const enoughSeats = balance >= 0;

  return (
    <Card>
      <CardContent className="p-6">
        <SectionTitle
          icon={CheckCircle2}
          title="Trip Insights"
          description="Quick overview for trip planning."
        />

        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl bg-surface p-4">
            <Car className="h-5 w-5 shrink-0 text-brand" />

            <p className="text-sm text-card-foreground">
                <strong>{totalCars}</strong>{" "}
                {totalCars === 1 ? "car" : "cars"} from Self Drive
            </p>
          </div>

          <div
            className={`flex items-center gap-3 rounded-xl p-4 ${
                enoughSeats
                ? "border border-success-border bg-success-soft"
                : "border border-danger-border bg-danger-soft"
            }`}
            >

            {enoughSeats ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
            ) : (
              <AlertTriangle className="h-5 w-5 shrink-0 text-danger" />
            )}

            <p className="text-sm text-card-foreground">
              {enoughSeats ? (
                <>
                  <strong>{availableSeats}</strong>{" "}
                  seats available,{" "}
                  <strong>{balance}</strong> remaining
                </>
              ) : (
                <>
                  Need{" "}
                  <strong>
                    {Math.abs(balance)}
                  </strong>{" "}
                  more seats
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-surface p-4">
            <UserRound className="h-5 w-5 shrink-0 text-brand" />

            <p className="text-sm text-card-foreground">
              <strong>{needRide}</strong>{" "}
              {needRide === 1
                ? "person needs"
                : "people need"}{" "}
              a ride
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-surface p-4">
            <Users className="h-5 w-5 shrink-0 text-brand" />

            <p className="text-sm text-card-foreground">
              <strong>{companions}</strong>{" "}
              {companions === 1
                ? "companion"
                : "companions"}{" "}
              will join
            </p>
          </div>

          {topLocation && (
            <div className="flex items-center gap-3 rounded-xl bg-brand/10 p-4 md:col-span-2">
              <MapPin className="h-5 w-5 shrink-0 text-brand" />

              <p className="text-sm text-card-foreground">
                <strong>{topLocation}</strong>{" "}
                is the most popular location
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ReportsPage() {
  const {
    data: registrations = [],
    isLoading: registrationsLoading,
    error: registrationsError,
  } = useQuery<Registration[]>({
    queryKey: ["registrations"],
    queryFn: () => getAllRegistrations(),
  });

  const {
    data: locations = [],
    isLoading: locationsLoading,
    error: locationsError,
  } = useQuery<Location[]>({
    queryKey: ["locations"],
    queryFn: () => getLocations(),
  });

  const report = useMemo(() => {
    const employees = registrations.length;

    const companions = registrations.reduce(
      (sum, registration) =>
        sum +
        (registration.companions?.length ?? 0),
      0,
    );

    const totalPeople =
      employees + companions;

    /*
    * Self Drive = 1 registration = 1 car
    */
    const totalCars = registrations.filter(
        (registration) =>
        registration.travelOption === "SELF_DRIVE",
    ).length;
  

    /*
     * Car Share = person who needs
     * to ride with someone else.
     */
    const needRide = registrations.filter(
      (registration) =>
        registration.travelOption ===
        "CAR_SHARE",
    ).length;

    /*
     * emptySeats belongs only to
     * Self Drive registrations.
     */
    const availableSeats =
      registrations
        .filter(
          (registration) =>
            registration.travelOption ===
            "SELF_DRIVE",
        )
        .reduce(
          (sum, registration) =>
            sum +
            (registration.emptySeats ?? 0),
          0,
        );

    const locationMap = new Map<
      string,
      Location
    >();

    locations.forEach((location) => {
      locationMap.set(location.id, location);
    });

    const locationStats = new Map<
      string,
      LocationReport
    >();

    registrations.forEach((registration) => {
      const locationId =
        registration.locationId;

      const existing =
        locationStats.get(locationId);

      if (existing) {
        existing.registrations += 1;

        if (
          registration.travelOption ===
          "SELF_DRIVE"
        ) {
          existing.cars += 1;
        }

        if (
          registration.travelOption ===
          "CAR_SHARE"
        ) {
          existing.needRide += 1;
        }

        return;
      }

      locationStats.set(locationId, {
        id: locationId,
        name:
          locationMap.get(locationId)?.name ??
          "Unknown Location",
        registrations: 1,
        cars:
          registration.travelOption ===
          "SELF_DRIVE"
            ? 1
            : 0,
        needRide:
          registration.travelOption ===
          "CAR_SHARE"
            ? 1
            : 0,
      });
    });

    const locationReports = Array.from(
      locationStats.values(),
    ).sort(
      (a, b) =>
        b.registrations -
        a.registrations,
    );

    const topLocation =
      locationReports[0]?.name;

    return {
      employees,
      companions,
      totalPeople,
      totalCars,
      needRide,
      availableSeats,
      locationReports,
      topLocation,
    };
  }, [registrations, locations]);

  if (
    registrationsLoading ||
    locationsLoading
  ) {
    return <Loading />;
  }

  if (registrationsError) {
    return (
      <div className="p-6 text-red-500">
        Error loading registrations:{" "}
        {registrationsError.message}
      </div>
    );
  }

  if (locationsError) {
    return (
      <div className="p-6 text-red-500">
        Error loading locations:{" "}
        {locationsError.message}
      </div>
    );
  }

  return (
    <div className="min-h-full bg-card p-4 text-card-foreground sm:p-6">
      <div className="mx-auto w-full max-w-[1600px]">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Trip Report
              </h1>

              <p className="mt-1 text-sm text-muted">
                Overview of registrations,
                people and transportation.
              </p>
            </div>

            <p className="text-xs text-muted">
              Last updated:{" "}
              {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* KPI */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total People"
            value={report.totalPeople}
            description={`${report.employees} employees + ${report.companions} companions`}
            icon={Users}
          />

          <StatCard
            title="Total Cars"
            value={report.totalCars}
            description="Total cars from Self Drive"
            icon={Car}
          />

          <StatCard
            title="Need a Ride"
            value={report.needRide}
            description="People using Car Share"
            icon={UserRound}
            iconClassName="bg-accent/15 text-accent" 
           />

          <StatCard
            title="Available Seats"
            value={report.availableSeats}
            description="Seats offered by Self Drive"
            icon={CheckCircle2}
            iconClassName="bg-success-soft text-success"
          />
        </div>

        {/* Transportation */}
        <div className="mt-4">
          <TransportationCard
            availableSeats={
              report.availableSeats
            }
            needRide={report.needRide}
            totalCars={report.totalCars}
          />
        </div>

        {/* Top locations + travel */}
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <TopLocations
            locations={[
              ...report.locationReports,
            ]}
          />

          <TravelOptionCard
            totalCars={report.totalCars}
            needRide={report.needRide}
            total={report.employees}
          />
        </div>

        {/* Location */}
        <div className="mt-4">
          <LocationBreakdown
            locations={report.locationReports}
          />
        </div>

        {/* People */}
        <div className="mt-4">
          <PeopleBreakdown
            employees={report.employees}
            companions={report.companions}
          />
        </div>

        {/* Insights */}
        <div className="mt-4">
          <TripInsights
            totalCars={report.totalCars}
            availableSeats={
              report.availableSeats
            }
            needRide={report.needRide}
            companions={report.companions}
            topLocation={report.topLocation}
          />
        </div>
      </div>
    </div>
  );
}
