"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Clock3,
  Eye,
  ExternalLink,
  Loader2,
  Pencil,
  RefreshCw,
  X,
} from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../src/_component/card-template";
import { Button } from "../../src/_component/button";

import {
  getActivePaymentCore,
  getPaymentHistories,
  getPaymentHistory,
  updatePaymentCore,
} from "../../src/_lib/api/paymentService";

import type {
  PaymentCore,
  UpdatePaymentCoreDto,
} from "../../src/_lib/api/payment-type";

/* =====================================================
TYPES
===================================================== */

type PaymentStatus = "PENDING" | "PAID" | "CANCELLED" | string;

type PaymentHistory = {
  id: string;
  formId: string;
  paymentCoreId: string;
  amount: number;
  peopleCount: number;
  status: PaymentStatus;
  slipUrl: string | null;
  paidAt: string | null;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt?: string;

  form?: {
    id: string;
    name: string;
    phone?: string | null;
    registrationNumber?: string | null;
    companions?: unknown;
  };

  paymentCore?: PaymentCore | null;
};

type PaymentManagementProps = {
  villaPrice?: number;
};

/* =====================================================
HELPERS
===================================================== */

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(value);

const formatDateTime = (value: string | null | undefined) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const getPaymentName = (payment: PaymentHistory) =>
  payment.form?.name ?? "-";

const getStatusClassName = (status: PaymentStatus) => {
  switch (status) {
    case "PAID":
      return "border-green-200 bg-green-100 text-green-700";

    case "PENDING":
      return "border-amber-200 bg-amber-100 text-amber-700";

    case "CANCELLED":
      return "border-gray-200 bg-gray-100 text-gray-600";

    default:
      return "border-blue-200 bg-blue-100 text-blue-700";
  }
};

const getStatusLabel = (status: PaymentStatus) => {
  switch (status) {
    case "PAID":
      return "Paid";

    case "PENDING":
      return "Pending";

    case "CANCELLED":
      return "Cancelled";

    default:
      return status;
  }
};

/* =====================================================
STAT CARD
===================================================== */

type StatCardProps = {
  title: string;
  value: string;
  description?: string;
};

function StatCard({
  title,
  value,
  description,
}: StatCardProps) {
  return (
    <Card className="border-line bg-card shadow-sm">
      <CardContent className="p-6">
        <p className="text-sm font-medium text-muted">
          {title}
        </p>

        <p className="mt-3 text-3xl font-bold tracking-tight text-card-foreground">
          {value}
        </p>

        {description && (
          <p className="mt-2 text-xs text-muted">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/* =====================================================
EDIT PAYMENT CORE DIALOG
===================================================== */

type EditPaymentCoreDialogProps = {
  open: boolean;
  paymentCore: PaymentCore | null;
  isPending: boolean;
  onClose: () => void;
  onSave: (input: UpdatePaymentCoreDto) => void;
};

function EditPaymentCoreDialog({
  open,
  paymentCore,
  isPending,
  onClose,
  onSave,
}: EditPaymentCoreDialogProps) {
  const [name, setName] = useState("");
  const [amountPerPerson, setAmountPerPerson] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [error, setError] = useState("");

  const handleOpen = () => {
    if (!paymentCore) return;

    setName(paymentCore.name ?? "");
    setAmountPerPerson(
      paymentCore.amountPerPerson?.toString() ?? "",
    );
    setQrCodeUrl(paymentCore.qrCodeUrl ?? "");
    setError("");
  };

  if (!open || !paymentCore) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const amount = Number(amountPerPerson);

    if (!trimmedName) {
      setError("Payment name is required");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setError(
        "Amount per person must be greater than 0",
      );
      return;
    }

    setError("");

    onSave({
      name: trimmedName,
      amountPerPerson: amount,
      qrCodeUrl: qrCodeUrl.trim() || null,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-payment-core-title"
      onClick={onClose}
    >
      <div
        className="w-full max-h-[90vh] overflow-y-auto max-w-lg rounded-xl border border-line bg-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <div>
            <h2
              id="edit-payment-core-title"
              className="text-lg font-semibold text-card-foreground"
            >
              Edit Payment Core
            </h2>

            <p className="mt-1 text-sm text-muted">
              Update the current payment configuration.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-md p-2 text-muted hover:bg-surface hover:text-card-foreground disabled:opacity-50"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-5 p-6">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label
                htmlFor="payment-core-name"
                className="text-sm font-medium"
              >
                Payment name
              </label>

              <input
                id="payment-core-name"
                type="text"
                value={name}
                onFocus={handleOpen}
                onChange={(e) =>
                  setName(e.target.value)
                }
                disabled={isPending}
                className="h-10 rounded-md border border-line bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                placeholder="Payment name"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="payment-core-amount"
                className="text-sm font-medium"
              >
                Amount per person
              </label>

              <input
                id="payment-core-amount"
                type="number"
                min={1}
                step={1}
                value={amountPerPerson}
                onChange={(e) =>
                  setAmountPerPerson(e.target.value)
                }
                disabled={isPending}
                className="h-10 rounded-md border border-line bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                placeholder="1500"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="payment-core-qr"
                className="text-sm font-medium"
              >
                QR Code URL
              </label>

              <input
                id="payment-core-qr"
                type="url"
                value={qrCodeUrl}
                onChange={(e) =>
                  setQrCodeUrl(e.target.value)
                }
                disabled={isPending}
                className="h-10 rounded-md border border-line bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                placeholder="https://..."
              />

              <p className="text-xs text-muted">
                Leave empty if there is no QR code.
              </p>
            </div>

            {qrCodeUrl.trim() && (
              <div className="rounded-lg border border-line bg-surface p-4">
                <p className="mb-3 text-xs font-medium text-muted">
                  QR Code preview
                </p>

                <img
                  src={qrCodeUrl}
                  alt="Payment QR code preview"
                  className="mx-auto max-h-48 rounded-md object-contain"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 border-t border-line px-6 py-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              disabled={isPending}
              aria-busy={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Save changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =====================================================
PAYMENT VIEW DIALOG
===================================================== */

type PaymentViewDialogProps = {
  open: boolean;
  payment: PaymentHistory | null;
  isLoading: boolean;
  onClose: () => void;
};

function PaymentViewDialog({
  open,
  payment,
  isLoading,
  onClose,
}: PaymentViewDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-details-title"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-line bg-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <div>
            <h2
              id="payment-details-title"
              className="text-lg font-semibold text-card-foreground"
            >
              Payment Details
            </h2>

            <p className="mt-1 text-sm text-muted">
              Payment transaction information.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-muted hover:bg-surface hover:text-card-foreground"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex min-h-60 items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        ) : !payment ? (
          <div className="p-6 text-sm text-muted">
            Payment not found.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
              <DetailItem
                label="Payment ID"
                value={payment.id}
                breakAll
              />

              <DetailItem
                label="Registration"
                value={
                  payment.form?.registrationNumber ?? "-"
                }
              />

              <DetailItem
                label="Name"
                value={payment.form?.name ?? "-"}
              />

              <DetailItem
                label="Phone"
                value={payment.form?.phone ?? "-"}
              />

              <DetailItem
                label="People count"
                value={String(payment.peopleCount)}
              />

              <DetailItem
                label="Amount"
                value={formatCurrency(payment.amount)}
                highlight
              />

              <div className="rounded-lg border border-line bg-surface p-4">
                <p className="text-xs text-muted">
                  Status
                </p>

                <div className="mt-2">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClassName(
                      payment.status,
                    )}`}
                  >
                    {getStatusLabel(payment.status)}
                  </span>
                </div>
              </div>

              <DetailItem
                label="Created"
                value={formatDateTime(payment.createdAt)}
              />

              <DetailItem
                label="Paid at"
                value={formatDateTime(payment.paidAt)}
              />

              <DetailItem
                label="Verified at"
                value={formatDateTime(payment.verifiedAt)}
              />
            </div>

            <div className="border-t border-line p-6">
              <h3 className="text-sm font-semibold">
                Payment Slip
              </h3>

              <p className="mt-1 text-xs text-muted">
                Uploaded payment slip for this transaction.
              </p>

              {payment.slipUrl ? (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-surface p-4">
                  <span className="max-w-full break-all text-sm text-muted">
                    {payment.slipUrl}
                  </span>

                  <a
                    href={payment.slipUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex shrink-0 items-center gap-2 rounded-md border border-line bg-card px-3 py-2 text-sm font-medium hover:bg-surface"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open slip
                  </a>
                </div>
              ) : (
                <div className="mt-4 rounded-lg border border-dashed border-line bg-surface p-6 text-center text-sm text-muted">
                  No payment slip uploaded.
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-line px-6 py-4">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
              >
                Close
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* =====================================================
DETAIL ITEM
===================================================== */

type DetailItemProps = {
  label: string;
  value: string;
  breakAll?: boolean;
  highlight?: boolean;
};

function DetailItem({
  label,
  value,
  breakAll = false,
  highlight = false,
}: DetailItemProps) {
  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <p className="text-xs text-muted">
        {label}
      </p>

      <p
        className={[
          "mt-1 font-medium",
          breakAll ? "break-all" : "",
          highlight
            ? "text-lg text-card-foreground"
            : "text-sm",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}

/* =====================================================
MAIN PAGE
===================================================== */

export default function PaymentManagement({
  villaPrice = 0,
}: PaymentManagementProps) {
  const queryClient = useQueryClient();

  const [editCoreOpen, setEditCoreOpen] =
    useState(false);

  const [viewPaymentOpen, setViewPaymentOpen] =
    useState(false);

  const [selectedPaymentId, setSelectedPaymentId] =
    useState<string | null>(null);

  /* =====================================================
  PAYMENT CORE
  ===================================================== */

  const paymentCoreQuery = useQuery({
    queryKey: ["payment-core", "active"],
    queryFn: () => getActivePaymentCore(),
  });

  /* =====================================================
  PAYMENT HISTORY
  ===================================================== */

  const paymentHistoryQuery = useQuery({
    queryKey: ["payment-history"],
    queryFn: () => getPaymentHistories(),
  });

  const payments =
    (paymentHistoryQuery.data ?? []) as PaymentHistory[];

  /* =====================================================
  SELECTED PAYMENT
  ===================================================== */

  const selectedPaymentQuery = useQuery({
    queryKey: [
      "payment-history",
      selectedPaymentId,
    ],
    queryFn: () =>
      getPaymentHistory(
        selectedPaymentId as string,
      ),
    enabled:
      viewPaymentOpen &&
      Boolean(selectedPaymentId),
  });

  /* =====================================================
  UPDATE PAYMENT CORE
  ===================================================== */

  const updatePaymentCoreMutation =
    useMutation({
      mutationFn: (
        input: UpdatePaymentCoreDto,
      ) => {
        if (!paymentCoreQuery.data?.id) {
          throw new Error(
            "Payment core ID is missing",
          );
        }

        return updatePaymentCore(
          paymentCoreQuery.data.id,
          input,
        );
      },

      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["payment-core", "active"],
        });

        queryClient.invalidateQueries({
          queryKey: ["payment-history"],
        });

        setEditCoreOpen(false);
      },
    });

  /* =====================================================
  SUMMARY
  ===================================================== */

  const summary = useMemo(() => {
    const paidPayments = payments.filter(
      (payment) => payment.status === "PAID",
    );

    const pendingPayments = payments.filter(
      (payment) => payment.status === "PENDING",
    );

    const paidAmount = paidPayments.reduce(
      (total, payment) =>
        total + Number(payment.amount || 0),
      0,
    );

    const pendingAmount = pendingPayments.reduce(
      (total, payment) =>
        total + Number(payment.amount || 0),
      0,
    );

    const paidPeople = paidPayments.reduce(
      (total, payment) =>
        total + Number(payment.peopleCount || 0),
      0,
    );

    const pendingPeople = pendingPayments.reduce(
      (total, payment) =>
        total + Number(payment.peopleCount || 0),
      0,
    );

    const totalPeople = payments.reduce(
      (total, payment) =>
        total + Number(payment.peopleCount || 0),
      0,
    );

    return {
      paidCount: paidPayments.length,
      pendingCount: pendingPayments.length,
      paidAmount,
      pendingAmount,
      paidPeople,
      pendingPeople,
      totalPeople,
    };
  }, [payments]);

  /* =====================================================
  HANDLERS
  ===================================================== */

  const handleViewPayment = (
    paymentId: string,
  ) => {
    setSelectedPaymentId(paymentId);
    setViewPaymentOpen(true);
  };

  const handleClosePaymentDialog = () => {
    setViewPaymentOpen(false);
    setSelectedPaymentId(null);
  };

  const handleRefresh = () => {
    paymentCoreQuery.refetch();
    paymentHistoryQuery.refetch();
  };

  /* =====================================================
  LOADING
  ===================================================== */

  const isInitialLoading =
    paymentCoreQuery.isLoading ||
    paymentHistoryQuery.isLoading;

  if (isInitialLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-3 text-muted">
          <Loader2 className="h-6 w-6 animate-spin" />
          Loading payment management...
        </div>
      </div>
    );
  }

  /* =====================================================
  ERROR
  ===================================================== */

  if (
    paymentCoreQuery.isError ||
    paymentHistoryQuery.isError
  ) {
    return (
      <Card className="border-line bg-card">
        <CardContent className="flex flex-col items-center justify-center gap-4 p-10 text-center">
          <div className="rounded-full bg-red-100 p-3 text-red-600">
            <X className="h-6 w-6" />
          </div>

          <div>
            <h2 className="font-semibold">
              Failed to load payment data
            </h2>

            <p className="mt-1 text-sm text-muted">
              Please try again.
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const paymentCore =
    paymentCoreQuery.data ?? null;

  return (
    <>
      <div className="flex flex-col gap-8">
        {/* =================================================
        HEADER
        ================================================= */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-card-foreground">
              Payment Management
            </h1>

            <p className="mt-1 text-sm text-muted">
              Manage payment configuration and payment history.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={handleRefresh}
              disabled={
                paymentCoreQuery.isFetching ||
                paymentHistoryQuery.isFetching
              }
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  paymentCoreQuery.isFetching ||
                  paymentHistoryQuery.isFetching
                    ? "animate-spin"
                    : ""
                }`}
              />
              Refresh
            </Button>

            <Button
              type="button"
              variant="primary"
              onClick={() =>
                setEditCoreOpen(true)
              }
              disabled={!paymentCore}
            >
              <Pencil className="h-4 w-4" />
              Edit payment core
            </Button>
          </div>
        </div>

        {/* =================================================
        PAYMENT CORE CARDS
        ================================================= */}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard
            title="Amount per person"
            value={
              paymentCore
                ? formatCurrency(
                    paymentCore.amountPerPerson,
                  )
                : "-"
            }
            description={
              paymentCore?.name ??
              "No active payment configuration"
            }
          />

          <StatCard
            title="Current summary"
            value={formatCurrency(
              summary.paidAmount,
            )}
            description={`${summary.paidCount} paid payment${
              summary.paidCount === 1
                ? ""
                : "s"
            }`}
          />

          <StatCard
            title="Villa Price"
            value={
              villaPrice > 0
                ? formatCurrency(villaPrice)
                : "-"
            }
            description={
              villaPrice > 0
                ? "Current villa price"
                : "No villa price"
            }
          />
        </div>

        {/* =================================================
        PAYMENT STATUS COMPARE
        ================================================= */}

        <Card className="border-line bg-card shadow-sm">
          <CardHeader>
            <CardTitle>
              Payment Status
            </CardTitle>

            <CardDescription>
              Compare pending and paid payments.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* PAID */}

              <div className="rounded-xl border border-green-200 bg-green-50 p-6">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="h-5 w-5" />

                  <span className="font-medium">
                    Paid
                  </span>
                </div>

                <div className="mt-5">
                  <p className="text-3xl font-bold text-green-800">
                    {summary.paidCount}
                  </p>

                  <p className="mt-1 text-sm text-green-700">
                    payments
                  </p>
                </div>

                <div className="mt-5 border-t border-green-200 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-700">
                      Total amount
                    </span>

                    <span className="font-semibold text-green-800">
                      {formatCurrency(
                        summary.paidAmount,
                      )}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm text-green-700">
                      People
                    </span>

                    <span className="font-semibold text-green-800">
                      {summary.paidPeople}
                    </span>
                  </div>
                </div>
              </div>

              {/* PENDING */}

              <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
                <div className="flex items-center gap-2 text-amber-700">
                  <Clock3 className="h-5 w-5" />

                  <span className="font-medium">
                    Pending
                  </span>
                </div>

                <div className="mt-5">
                  <p className="text-3xl font-bold text-amber-800">
                    {summary.pendingCount}
                  </p>

                  <p className="mt-1 text-sm text-amber-700">
                    payments
                  </p>
                </div>

                <div className="mt-5 border-t border-amber-200 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-amber-700">
                      Total amount
                    </span>

                    <span className="font-semibold text-amber-800">
                      {formatCurrency(
                        summary.pendingAmount,
                      )}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm text-amber-700">
                      People
                    </span>

                    <span className="font-semibold text-amber-800">
                      {summary.pendingPeople}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* TOTAL */}

            <div className="mt-4 rounded-xl border border-line bg-surface p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-muted">
                    Total registered people
                  </p>

                  <p className="mt-1 text-2xl font-bold text-card-foreground">
                    {summary.totalPeople}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-sm text-muted">
                    Total payment records
                  </p>

                  <p className="mt-1 text-2xl font-bold text-card-foreground">
                    {payments.length}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* =================================================
        PAYMENT HISTORY
        ================================================= */}

        <Card className="border-line bg-card shadow-sm">
          <CardHeader>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>
                  Payment History
                </CardTitle>

                <CardDescription>
                  All payment transactions.
                </CardDescription>
              </div>

              <span className="text-sm text-muted">
                {payments.length} payment
                {payments.length === 1
                  ? ""
                  : "s"}
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {payments.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-muted">
                No payment history found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-sm">
                  <thead>
                    <tr className="border-y border-line bg-surface text-left">
                      <th className="px-6 py-3 font-medium text-muted">
                        Payment ID
                      </th>

                      <th className="px-6 py-3 font-medium text-muted">
                        Name
                      </th>

                      <th className="px-6 py-3 text-center font-medium text-muted">
                        People count
                      </th>

                      <th className="px-6 py-3 text-right font-medium text-muted">
                        Amount
                      </th>

                      <th className="px-6 py-3 font-medium text-muted">
                        Status
                      </th>

                      <th className="px-6 py-3 text-right font-medium text-muted">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {payments.map((payment) => (
                      <tr
                        key={payment.id}
                        className="border-b border-line last:border-0 hover:bg-surface/50"
                      >
                        <td className="px-6 py-4">
                          <span
                            className="block max-w-[180px] truncate font-mono text-xs text-muted"
                            title={payment.id}
                          >
                            {payment.id}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-card-foreground">
                              {getPaymentName(payment)}
                            </p>

                            {payment.form?.phone && (
                              <p className="mt-1 text-xs text-muted">
                                {payment.form.phone}
                              </p>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-center">
                          {payment.peopleCount}
                        </td>

                        <td className="px-6 py-4 text-right font-medium">
                          {formatCurrency(
                            payment.amount,
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClassName(
                              payment.status,
                            )}`}
                          >
                            {getStatusLabel(
                              payment.status,
                            )}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleViewPayment(
                                payment.id,
                              )
                            }
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* =================================================
      EDIT PAYMENT CORE
      ================================================= */}

      <EditPaymentCoreDialog
        open={editCoreOpen}
        paymentCore={paymentCore}
        isPending={
          updatePaymentCoreMutation.isPending
        }
        onClose={() => {
          if (
            !updatePaymentCoreMutation.isPending
          ) {
            setEditCoreOpen(false);
          }
        }}
        onSave={(input) => {
          updatePaymentCoreMutation.mutate(input);
        }}
      />

      {/* =================================================
      VIEW PAYMENT
      ================================================= */}

      <PaymentViewDialog
        open={viewPaymentOpen}
        payment={
          (selectedPaymentQuery.data ??
            null) as PaymentHistory | null
        }
        isLoading={
          selectedPaymentQuery.isLoading
        }
        onClose={handleClosePaymentDialog}
      />
    </>
  );
}
