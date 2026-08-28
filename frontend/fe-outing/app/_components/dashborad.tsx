"use client";
import { Copy, Eye, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { getAllRegistrations, getLocations } from "../../src/_lib/api/registrationService";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../src/_component/card-template";
import { Registration } from "@/src/_lib/api/registration-type";
import { useState } from "react";
import Loading from "../loading";
import { Button } from "@/src/_component/button";
import { Dialog, DialogHeader, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/src/_component/dialog";

type TravelOption =
  | "SELF_DRIVE"
  | "CAR_SHARE"
  | "PUBLIC_TRANSPORT";

const TravelOptionMapping: Record<string, string> = {
  "SELF_DRIVE": "Self Drive",
  "CAR_SHARE": "Car Share",
  "PUBLIC_TRANSPORT": "Public Transport",
};



type Filter = {
  travelOption: string; // "" means "All"
  location: string; // "" means "All"
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
  selfDriveCount,
  carShareCount,
  companionsCount,
  mostLocationPicked,
  locationMapping,
}: {
  submitted: number;
  mostTravelOption: string;
  selfDriveCount: number;
  carShareCount: number;
  companionsCount: number;
  mostLocationPicked: string;
  locationMapping: Record<string, string>;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4 bg-card text-card-foreground my-4 ">
      <Card>
        <CardHeader>
          <CardTitle>Submitted Registrations</CardTitle>
        </CardHeader>
        <CardContent>
          <h1>{submitted}</h1>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Most Travel Option</CardTitle>
        </CardHeader>
        <CardContent>
          <h1>{TravelOptionMapping[mostTravelOption] ?? "-"}</h1>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Self Drive</CardTitle>
        </CardHeader>
        <CardContent>
          <h1>{selfDriveCount}</h1>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Car Share</CardTitle>
        </CardHeader>
        <CardContent>
          <h1>{carShareCount}</h1>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Most Location Picked</CardTitle>
        </CardHeader>
        <CardContent>
          <h1>{locationMapping?.[mostLocationPicked] ?? '-'}</h1>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>People Count</CardTitle>
        </CardHeader>
        <CardContent>
          <h1>{companionsCount}</h1>
        </CardContent>
      </Card>
    </div>
  );
}

function RegistrationFilter({ filter, onFilterChange, locationMapping }: RegistrationFilterProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filter, search: e.target.value });
  };

  const handleTravelOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filter, travelOption: e.target.value });
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filter, location: e.target.value });
  };

  const handleClear = () => {
    onFilterChange(emptyFilter());
  };

  const hasActiveFilter = Boolean(
    filter.search || filter.travelOption || filter.location
  );

  return (
    <div>
      <Card>
        <CardContent>
          <div className="flex flex-col gap-3 p-4 text-black md:flex-row md:flex-wrap md:items-end">
            <div className="flex flex-1 min-w-[200px] flex-col gap-1">
              <label htmlFor="search">Search</label>
              <input
                id="search"
                type="text"
                placeholder="Search by name, phone, or Line ID"
                className="border-2 border-gray-300 rounded-md p-2"
                value={filter.search}
                onChange={handleSearchChange}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="travelOption">Travel Option</label>
              <select
                id="travelOption"
                className="border-2 border-gray-300 rounded-md p-2"
                value={filter.travelOption}
                onChange={handleTravelOptionChange}
              >
                <option value="">All</option>
                <option value="SELF_DRIVE">Self Drive</option>
                <option value="CAR_SHARE">Car Share</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="location">Location</label>
              <select
                id="location"
                className="border-2 border-gray-300 rounded-md p-2"
                value={filter.location}
                onChange={handleLocationChange}
              >
                <option value="">All</option>
                {Object.entries(locationMapping ?? {}).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <Button
              type="button"
              onClick={handleClear}
              disabled={!hasActiveFilter}
              variant="outline"
              className="h-fit rounded-md p-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              Clear filters
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
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
      <h1 className="text-2xl font-bold text-black">Registration List</h1>
    <div className="text-black border-2 border-gray-300 rounded-md p-4 my-4">

      <table className="w-full">
        <thead>
          <tr className="text-right border-b-2 border-gray-300 grid grid-cols-8">
            <th className="p-2 col-span-1">Name</th>
            <th className="p-2 col-span-1">Phone</th>
            <th className="p-2 col-span-1">Line ID</th>
            <th className="p-2 col-span-1">Location</th>
            <th className="p-2 col-span-1">Travel Option</th>
            <th className="p-2 col-span-1">Companions</th>
            <th className="p-2 col-span-1">Note</th>
            <th className="p-2 col-span-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {registrations.length === 0 ? (
            <tr className="grid grid-cols-1">
              <td className="p-4 text-center text-gray-500">
                No registrations match your filters.
              </td>
            </tr>
          ) : (
            registrations.map((registration, index) => (
              <tr
                key={index}
                className="grid grid-cols-8 text-right items-center justify-center"
              >
                <td className="p-2 col-span-1">{registration.name ?? "-"}</td>
                <td className="p-2 col-span-1">{registration.phone ?? "-"}</td>
                <td className="p-2 col-span-1">{registration.lineId ?? "-"}</td>
                <td className="p-2 col-span-1">{locationMapping[registration.locationId] ?? "-"}</td>
                <td className="p-2 col-span-1">{TravelOptionMapping[registration.travelOption] ?? "-"}</td>
                <td className="p-2 col-span-1">{registration.companions?.length ?? "-"}</td>
                <td className="p-2 col-span-1">{registration.note ?? "-"}</td>
                <td className="p-2 col-span-1">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      router.push(`/detail/${registration.id}`);
                    }}
                  >
                    <Eye className="w-4 h-4" />
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

function SentFormDialog({ handleSentForm }: { handleSentForm: () => void }) {
  return (
    <Dialog >
      <DialogTrigger>
      <Button>Sent Form</Button>
      </DialogTrigger>
      <DialogContent className="gap-4 p-6 text-black">
        <DialogHeader>
          <DialogTitle>Copy Form URL</DialogTitle>
        </DialogHeader>
        <DialogDescription className="flex flex-row gap-2">
          <p className=" text-gray-500">Form URL: {window.location.origin}/create</p>
          <Button onClick={() => {
            handleSentForm();
          }} className="w-fit" variant="ghost"><Copy className="w-4 h-4" /></Button>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}

export function Dashboard() {
  const [filter, setFilter] = useState<Filter>(emptyFilter());

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
  const locationMapping: Record<string, string> = (locations?.reduce((acc, location) => {
      acc[location.id] = location.name;
      return acc;
    }, {} as Record<string, string>) ?? {}) ;

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="text-red-500">
        Error: {error.message}
      </div>
    );
  }

  // Apply the search box + both dropdowns to the raw list once, then derive
  // every summary stat and the table rows from this filtered set so they
  // always agree with each other.
  const filteredRegistrations = (registrations ?? []).filter((registration) => {
    if (filter.travelOption && registration.travelOption !== filter.travelOption) {
      return false;
    }

    if (filter.location && String(registration.locationId) !== filter.location) {
      return false;
    }

    if (filter.search.trim()) {
      const term = filter.search.trim().toLowerCase();
      const haystack = [
        registration.name,
        registration.phone,
        registration.lineId,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(term)) return false;
    }

    return true;
  });

  const submittedRegistrations = filteredRegistrations.length;

  const travelCounts = filteredRegistrations.reduce(
    (acc, curr) => {
      acc[curr.travelOption] = (acc[curr.travelOption] ?? 0) + 1;
      return acc;
    },
    {} as Record<TravelOption, number>,
  );

  const mostTravelOption =
    Object.entries(travelCounts).reduce(
      (most, current) => {
        return current[1] as number > (most[1] as number) ? current : most;
      },
      ["-", 0],
    )[0];

  const selfDriveCount = filteredRegistrations.reduce((acc, curr) => {
    if (curr.travelOption === "SELF_DRIVE") {
      return acc + 1;
    }
    return acc;
  }, 0);

  const carShareCount = filteredRegistrations.reduce((acc, curr) => {
    if (curr.travelOption === "CAR_SHARE") {
      return acc + 1;
    }
    return acc;
  }, 0);

  // คนลงทะเบียน + companions
  const companionsCount = filteredRegistrations.reduce((acc, curr) => {
    return acc + 1 + (curr.companions?.length ?? 0);
  }, 0);

  const locationCounts = filteredRegistrations.reduce(
    (acc, curr) => {
      acc[curr.locationId] = (acc[curr.locationId] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const mostLocationPicked =
    Object.entries(locationCounts).reduce(
      (most, current) => {
        return current[1] > most[1] ? current : most;
      },
      ["-", 0],
    )[0] as string;

  const handleSentForm = () => {
    window.navigator.clipboard.writeText(window.location.origin + "/create");
  }

  return (
    <div className="flex flex-col gap-4 bg-card p-6 rounded-md">
      <div className="flex flex-row gap-4 items-center justify-between">
        <h1 className="text-2xl font-bold text-black">Registration Dashboard</h1>
        <SentFormDialog handleSentForm={handleSentForm} />
      </div>
      
      <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
      <SummaryCard
        submitted={submittedRegistrations}
        mostTravelOption={mostTravelOption}
        selfDriveCount={selfDriveCount}
        carShareCount={carShareCount}
        companionsCount={companionsCount}
        mostLocationPicked={mostLocationPicked}
        locationMapping={locationMapping}
      />
      <RegistrationFilter filter={filter} onFilterChange={setFilter} locationMapping={locationMapping} />
      <RegistrationTable registrations={filteredRegistrations} locationMapping={locationMapping} />
    </div>
  );
}