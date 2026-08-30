"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Pencil, Plus, Trash2 } from "lucide-react";

import {
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation,
} from "@/src/_lib/api/registrationService";
import type {
  Location,
  CreateLocationInput,
  UpdateLocationInput,
} from "@/src/_lib/api/registration-type";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/src/_component/card-template";
import { Button } from "@/src/_component/button";
import {
  LocationFormDialog,
  type LocationFormValues,
} from "./location-form-dialog";
import { DeleteLocationDialog } from "./delete-location-dialog";
import { LocationDetailDialog } from "../../_component/location-dialog";
import { useRouter } from "next/navigation";

export function LocationManage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(
    null,
  );
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Location | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [viewingLocation, setViewingLocation] = useState<Location | null>(
    null,
  );

  const [statusFilter, setStatusFilter] = useState<"APPROVED" | "PENDING">(
    "APPROVED",
  );

  const {
    data: locations,
    isLoading: isLoadingLocations,
    error: locationsError,
  } = useQuery({
    queryKey: ["locations"],
    queryFn: () => getLocations(),
  });

  const invalidateLocations = () =>
    queryClient.invalidateQueries({ queryKey: ["locations"] });

  const { mutate: createLocationMutation, isPending: isCreating } =
    useMutation({
      mutationFn: (input: CreateLocationInput) => createLocation(input),
      onSuccess: () => {
        invalidateLocations();
        setFormOpen(false);
        setEditingLocation(null);
        setFormError(null);
      },
      onError: (err: Error) => {
        setFormError(
          err.message || "Failed to create the location. Please try again.",
        );
      },
    });

  const { mutate: updateLocationMutation, isPending: isUpdating } =
    useMutation({
      // react-query's mutate() only ever passes ONE variables argument, so
      // id + input must travel together as a single object rather than as
      // two separate function parameters.
      mutationFn: ({
        id,
        input,
      }: {
        id: string;
        input: UpdateLocationInput;
      }) => updateLocation(id, input),
      onSuccess: () => {
        invalidateLocations();
        setFormOpen(false);
        setEditingLocation(null);
        setFormError(null);
      },
      onError: (err: Error) => {
        setFormError(
          err.message || "Failed to update the location. Please try again.",
        );
      },
    });

  const { mutate: deleteLocationMutation, isPending: isDeleting } =
    useMutation({
      mutationFn: (id: string) => deleteLocation(id),
      onSuccess: () => {
        invalidateLocations();
        setDeleteTarget(null);
        setDeleteError(null);
      },
      onError: (err: Error) => {
        setDeleteError(
          err.message || "Failed to delete the location. Please try again.",
        );
      },
    });

  const { mutate: approveLocationMutation, isPending: isApproving } =
    useMutation({
      mutationFn: (id: string) => updateLocation(id, { status: "APPROVED" } as UpdateLocationInput),
      onSuccess: () => {
        invalidateLocations();
      },
    });

  const handleOpenCreate = () => {
    setEditingLocation(null);
    setFormError(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (location: Location) => {
    setEditingLocation(location);
    setFormError(null);
    setFormOpen(true);
  };

  const handleFormOpenChange = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditingLocation(null);
      setFormError(null);
    }
  };

  const handleFormSubmit = (values: LocationFormValues) => {
    if (editingLocation) {
      updateLocationMutation({ id: editingLocation.id, input: values });
    } else {
      createLocationMutation(values);
    }
  };

  const handleDeleteOpenChange = (open: boolean) => {
    if (!open) {
      setDeleteTarget(null);
      setDeleteError(null);
    }
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteLocationMutation(deleteTarget.id);
  };

  const handleDelete = (location: Location) => {
    setDeleteError(null);
    setDeleteTarget(location);
  };

  const handleApprove = (location: Location) => {
    approveLocationMutation(location.id);
  };

  const handleCardClick = (location: Location) => {
    setViewingLocation(location);
  };

  const handleViewOpenChange = (open: boolean) => {
    if (!open) {
      setViewingLocation(null);
    }
  };

  const handleEditFromDialog = (location: Location) => {
    setViewingLocation(null);
    handleOpenEdit(location);
  };

  const handleDeleteFromDialog = (location: Location) => {
    setViewingLocation(null);
    handleDelete(location);
  };

  const handleApproveFromDialog = (location: Location) => {
    approveLocationMutation(location.id);
  };

  const filteredLocations = locations?.filter(
    (location) => location.status === statusFilter,
  );

  const totalApprovedLocations = locations?.filter(location => location.status === "APPROVED").length;
  const totalPendingLocations = locations?.filter(location => location.status === "PENDING").length;

  return (
    <div className="flex flex-col gap-6 bg-card p-6 rounded-md">
      <div className="flex items-center justify-between gap-4">
      
        <div>
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Back
            </Button>
          <h1 className="text-2xl font-bold text-black mt-4">Manage locations</h1>
          <p className="text-sm text-gray-500">
            Add, edit, or remove the destinations attendees can choose from.
          </p>
        </div>

        <Button type="button" onClick={handleOpenCreate}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add location
        </Button>
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant={statusFilter === "APPROVED" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setStatusFilter("APPROVED")}
        >
          Approved<span className="text-xs text-green-500 bg-green-500/10 rounded-full px-2 py-1">{totalApprovedLocations}</span>
        </Button>
        <Button
          type="button"
          variant={statusFilter === "PENDING" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setStatusFilter("PENDING")}
        >
          Pending<span className="text-xs text-yellow-500 bg-yellow-500/10 rounded-full px-2 py-1">{totalPendingLocations}</span>
        </Button>
      </div>

      {isLoadingLocations && (
        <p className="text-sm text-gray-500">Loading locations…</p>
      )}

      {locationsError && (
        <p className="text-sm text-red-500">
          Error: {(locationsError as Error).message}
        </p>
      )}

      {!isLoadingLocations && !locationsError && (
        <>
          {filteredLocations?.length === 0 ? (
            <p className="text-sm text-gray-500">
              {statusFilter === "PENDING"
                ? "No pending locations."
                : "No locations yet. Add one to get started."}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredLocations?.map((location) => (
                <Card
                  key={location.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleCardClick(location)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleCardClick(location);
                    }
                  }}
                  className="cursor-pointer transition-colors hover:border-gray-300"
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <MapPin
                        className="h-4 w-4 shrink-0 text-gray-400"
                        aria-hidden="true"
                      />
                      <span className="truncate">{location.name}</span>
                      <span className={`text-xs justify-end rounded-full px-2 py-1 ${location.status === "PENDING" ? "text-yellow-500 bg-yellow-500/10" : "text-green-500 bg-green-500/10"}`}>{location.status}</span>
             
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    {location.address && (
                      <p className="text-sm text-gray-500">
                        {location.address}
                      </p>
                    )}

                    <div
                      className="flex gap-2 justify-between"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {location.status === "PENDING" ? (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEdit(location)}
                          >
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                            Edit
                          </Button>
                          <div className="flex gap-2 justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(location)}
                            className="text-red-600 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => handleApprove(location)}
                            disabled={isApproving}
                          >
                            Approve
                          </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEdit(location)}
                          >
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(location)}
                            className="text-red-600 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      <LocationFormDialog
        open={formOpen}
        onOpenChange={handleFormOpenChange}
        location={editingLocation}
        isSubmitting={editingLocation ? isUpdating : isCreating}
        errorMessage={formError ?? undefined}
        onSubmit={handleFormSubmit}
      />

      <DeleteLocationDialog
        open={deleteTarget !== null}
        onOpenChange={handleDeleteOpenChange}
        location={deleteTarget}
        isDeleting={isDeleting}
        errorMessage={deleteError ?? undefined}
        onConfirm={handleDeleteConfirm}
      />

      <LocationDetailDialog
        open={viewingLocation !== null}
        onOpenChange={handleViewOpenChange}
        location={viewingLocation}
        onEdit={handleEditFromDialog}
        onDelete={handleDeleteFromDialog}
        onApprove={handleApproveFromDialog}
        isApproving={isApproving}
      />
    </div>
  );
}