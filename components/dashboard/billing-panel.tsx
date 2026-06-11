"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  CreditCard,
  Download,
  FileCheck2,
  FileText,
  Home,
  Info,
  LogOut,
  QrCode,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import type { MenuRecord } from "@/lib/menu-types";

type Transaction = {
  id: string;
  date: string;
  invoiceNo: string;
  planName: string;
  amount: string;
  status: "Paid" | "Pending" | "Failed";
};

type BillingPanelProps = {
  initialBusinessName: string;
  initialMenus: MenuRecord[];
  activePlan: "free" | "monthly" | "yearly";
  endedAt: string | null;
  transactions: Transaction[];
  isPromoEligible?: boolean;
  activeChain?: {
    id: string;
    plan: string;
    startedAt: string;
    endedAt: string | null;
  }[];
  scansUsed: number;
  lastResetDate: string | null;
};

type PlanType = "free" | "monthly" | "yearly";

export default function BillingPanel({
  initialBusinessName,
  initialMenus,
  activePlan,
  endedAt,
  transactions,
  isPromoEligible = false,
  activeChain = [],
  scansUsed,
  lastResetDate,
}: BillingPanelProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(activePlan);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showQrisModal, setShowQrisModal] = useState(false);
  const [qrisData, setQrisData] = useState<{
    qr_url: string;
    qr_content: string;
    history_id: string;
    order_id: string;
    amount: number;
  } | null>(null);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [showConfirmPromoModal, setShowConfirmPromoModal] = useState(false);

  // Pagination states and values
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages || 1));
  const paginatedTransactions = transactions.slice(
    (validCurrentPage - 1) * itemsPerPage,
    validCurrentPage * itemsPerPage,
  );

  const totalMenusCount = initialMenus.length;

  const sortedChain = [...(activeChain ?? [])].sort(
    (a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime(),
  );

  // Plan Details Map
  const plans = {
    free: {
      name: "Free Plan",
      price: "Rp0",
      period: "month",
      pdfLimit: 1,
      scanLimit: 1000,
      scansUsed: scansUsed,
    },
    monthly: {
      name: "Monthly Plan",
      price: "Rp9.000,00",
      period: "month",
      pdfLimit: 10,
      scanLimit: "Unlimited",
      scansUsed: scansUsed,
    },
    yearly: {
      name: "Yearly Plan",
      price: "Rp99.000,00",
      period: "year",
      pdfLimit: 10,
      scanLimit: "Unlimited",
      scansUsed: scansUsed,
    },
  };

  const activePlanDetails = plans[activePlan];
  const currentPlanDetails = plans[selectedPlan];

  const handlePlanCheckout = async (plan: PlanType) => {
    if (plan === "free") {
      setNotice(
        "Please contact support to cancel or downgrade your active plan.",
      );
      return;
    }

    setLoading(true);
    setNotice(null);

    try {
      const res = await fetch("/api/qrisly/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to generate QRIS payment");
      }

      const data = await res.json();
      if (data.activated_free) {
        setNotice(
          "Congratulations! Your free Monthly Plan promo has been activated. Reloading page...",
        );
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setQrisData(data);
        setShowQrisModal(true);
      }
    } catch (err: unknown) {
      console.error(err);
      const errMsg =
        err instanceof Error
          ? err.message
          : "An error occurred during payment processing.";
      setNotice(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckPayment = async () => {
    if (!qrisData) return;
    setCheckingPayment(true);
    try {
      const res = await fetch(
        `/api/qrisly/status?id=${qrisData.history_id}&order_id=${qrisData.order_id}`,
      );
      if (!res.ok) throw new Error("Failed to verify status");

      const data = await res.json();
      if (data.success) {
        setNotice("Payment successful! Reloading page...");
        setShowQrisModal(false);
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        alert(
          "Payment not detected yet. Please ensure you have scanned and completed the payment.",
        );
      }
    } catch (err) {
      console.error("Status check failed:", err);
      alert("Failed to verify payment. Please try again.");
    } finally {
      setCheckingPayment(false);
    }
  };

  const handleDownloadInvoice = (id: string) => {
    window.open(`/invoice/${id}`, "_blank");
  };

  return (
    <>
      {/* Sub content page */}
      <div className="px-4 py-6 md:px-8 md:py-8">
        {notice ? (
          <div className="mb-6 flex items-center gap-2.5 rounded-2xl border border-[#cfe1cf] bg-[#eef6ed] px-4 py-3 text-sm font-medium text-[var(--green-dark)] shadow-sm transition-all duration-300">
            <CheckCircle2 size={18} className="shrink-0 text-[var(--green)]" />
            <span>{notice}</span>
          </div>
        ) : null}

        {/* Layout divided into Main Section & Usage Sidebar */}
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          {/* Left Column: Plans & History */}
          <div className="space-y-6 min-w-0">
            {/* Pricing List */}
            {/* Active Plan Card (Visible when plan is not free) */}
            {activePlan !== "free" && (
              <div className="rounded-[1.75rem] border border-[#cfe1cf] bg-white p-6 shadow-[var(--shadow-card)]">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--green-soft)] text-[var(--green)]">
                    <Sparkles size={20} />
                  </div>
                  <div className="w-full">
                    <h2 className="text-xl font-semibold tracking-tight text-[var(--green-dark)]">
                      Your Active Plan & Period
                    </h2>
                    <p className="text-sm text-[#555950] mt-1.5">
                      Your account currently has an active{" "}
                      <b>
                        {activePlan === "monthly"
                          ? "Monthly Plan (30 Days)"
                          : "Yearly Plan (1 Year)"}
                      </b>{" "}
                      active period. Thank you for supporting us!
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <div className="inline-flex items-center gap-2 rounded-xl bg-[#eef6ed] border border-[#cfe1cf] px-4 py-2 text-xs font-semibold text-[var(--green-dark)]">
                        <span>Status: Active</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--green)]"></span>
                      </div>
                      {endedAt && (
                        <div className="inline-flex items-center gap-2 rounded-xl bg-[#fbf7ef] border border-[#d9d0c2] px-4 py-2 text-xs font-semibold text-[#555950]">
                          <span>Expired Date: {endedAt}</span>
                        </div>
                      )}
                    </div>

                    {/* Display subscription chain schedule if they have multiple active/queued subscriptions */}
                    {sortedChain.length > 1 && (
                      <div className="mt-5 border-t border-[#cfe1cf]/60 pt-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--green-dark)] mb-3 flex items-center gap-1.5">
                          <Sparkles
                            size={14}
                            className="text-[var(--green)] animate-pulse"
                          />
                          Subscription Schedule (Antrean Paket)
                        </h4>
                        <div className="space-y-2.5">
                          {sortedChain.map((sub, idx) => {
                            const isFirst = idx === 0;
                            const subPlanName =
                              sub.plan === "monthly"
                                ? "Monthly Plan"
                                : "Yearly Plan";
                            const startStr = new Date(
                              sub.startedAt,
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            });
                            const endStr = sub.endedAt
                              ? new Date(sub.endedAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  },
                                )
                              : "lifetime";

                            return (
                              <div
                                key={sub.id}
                                className="flex items-center justify-between text-xs p-3 rounded-2xl bg-[#eef6ed]/60 border border-[#cfe1cf]/40"
                              >
                                <div>
                                  <span className="font-semibold text-[var(--green-dark)]">
                                    {subPlanName}
                                  </span>
                                  <span className="text-[10px] text-[#555950] block mt-0.5">
                                    {startStr} - {endStr}
                                  </span>
                                </div>
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    isFirst
                                      ? "bg-[var(--green)] text-white"
                                      : "bg-amber-100 text-amber-800 border border-amber-200"
                                  }`}
                                >
                                  {isFirst ? "Active Now" : "Queued"}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-[#777a72] mt-4 leading-relaxed">
                      Self-service downgrades are currently disabled. Please
                      contact support if you need to downgrade or cancel your
                      subscription.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Pricing / Extension List */}
            <div className="rounded-[1.75rem] border border-[#e4dbce] bg-white p-6 shadow-[var(--shadow-card)]">
              <div className="mb-6">
                <h2 className="text-xl font-semibold tracking-tight">
                  {activePlan === "free"
                    ? "Select Plan / Active Period"
                    : "Extend / Change Plan"}
                </h2>
                <p className="text-sm text-[#666a61]">
                  {activePlan === "free"
                    ? "Choose the plan that suits your publishing frequency and scan volumes."
                    : "You can purchase additional packages to extend your active subscription. They will be queued automatically."}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {/* Free Card */}
                <div
                  className={`relative flex flex-col justify-between rounded-2xl border p-5 ${
                    activePlan === "free"
                      ? "border-[var(--green)] bg-[var(--green-soft)]/20 shadow-sm"
                      : "border-[#e4dbce] bg-gray-50/50 opacity-60"
                  }`}
                >
                  {activePlan === "free" && (
                    <span className="absolute right-4 top-4 rounded-full bg-[var(--green)] px-2.5 py-0.5 text-[10px] font-semibold text-white">
                      Active Plan
                    </span>
                  )}
                  <div>
                    <h3 className="font-semibold text-[var(--charcoal)]">
                      Free
                    </h3>
                    <div className="mt-3 flex items-baseline">
                      <span className="text-2xl font-bold tracking-tight">
                        Rp0
                      </span>
                      <span className="ml-1 text-xs text-[#666a61]">
                        / lifetime
                      </span>
                    </div>
                    <ul className="mt-5 space-y-2 text-xs text-[#5f6673]">
                      <li className="flex items-center gap-1.5">
                        <Check
                          size={14}
                          className="text-[var(--green)] shrink-0"
                        />
                        <span>1x PDF upload</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check
                          size={14}
                          className="text-[var(--green)] shrink-0"
                        />
                        <span>QR Menu</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check
                          size={14}
                          className="text-[var(--green)] shrink-0"
                        />
                        <span>1000x QR Scan</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check
                          size={14}
                          className="text-[var(--green)] shrink-0"
                        />
                        <span>Owner dashboard</span>
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() => handlePlanCheckout("free")}
                    disabled={true}
                    className={`mt-6 w-full rounded-xl py-2.5 text-xs font-semibold ${
                      activePlan === "free"
                        ? "bg-[var(--green)] text-white cursor-default"
                        : "border border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {activePlan === "free"
                      ? "Current Plan"
                      : "Downgrade requires support"}
                  </button>
                </div>

                {/* Monthly Card */}
                <div
                  className={`relative flex flex-col justify-between rounded-2xl border p-5 bg-[#fffdf8] hover:border-[#cbd5e1] ${
                    activePlan === "monthly"
                      ? "border-[var(--green)] ring-2 ring-[var(--green)]/15 shadow-sm"
                      : "border-[#e4dbce]"
                  }`}
                >
                  {activePlan === "monthly" && (
                    <span className="absolute right-4 top-4 rounded-full bg-[var(--green)] px-2.5 py-0.5 text-[10px] font-semibold text-white">
                      Active Plan
                    </span>
                  )}
                  {isPromoEligible && (
                    <span className="absolute right-4 top-4 rounded-full bg-[var(--green)] px-2.5 py-0.5 text-[10px] font-semibold text-white uppercase tracking-wider">
                      Promo Rp0
                    </span>
                  )}
                  <div>
                    <h3 className="font-semibold text-[var(--charcoal)]">
                      Monthly
                    </h3>
                    <div className="mt-3 flex items-baseline">
                      {isPromoEligible ? (
                        <>
                          <span className="text-2xl font-bold tracking-tight text-[var(--green)]">
                            Rp0
                          </span>
                          <span className="ml-2 text-xs text-gray-400 line-through">
                            Rp9.000,00
                          </span>
                        </>
                      ) : (
                        <span className="text-2xl font-bold tracking-tight">
                          Rp9.000,00
                        </span>
                      )}
                      <span className="ml-1 text-xs text-[#666a61]">
                        / 30 Days
                      </span>
                    </div>
                    {isPromoEligible && (
                      <p className="mt-1 text-[10px] text-[var(--green-dark)] font-medium">
                        New user promo: First purchase is FREE!
                      </p>
                    )}
                    <ul className="mt-5 space-y-2 text-xs text-[#5f6673]">
                      <li className="flex items-center gap-1.5">
                        <Check
                          size={14}
                          className="text-[var(--green)] shrink-0"
                        />
                        <span>10x PDF upload</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check
                          size={14}
                          className="text-[var(--green)] shrink-0"
                        />
                        <span>Unlimited QR Scan</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check
                          size={14}
                          className="text-[var(--green)] shrink-0"
                        />
                        <span>Custom QR</span>
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() => {
                      if (isPromoEligible) {
                        setShowConfirmPromoModal(true);
                      } else {
                        handlePlanCheckout("monthly");
                      }
                    }}
                    disabled={loading}
                    className={`mt-6 w-full rounded-xl py-2.5 text-xs font-semibold border transition disabled:opacity-50 ${
                      activePlan === "monthly"
                        ? "border-[var(--green)] bg-[var(--green)] text-white hover:bg-[var(--green-dark)]"
                        : "border-[#d9d0c2] bg-white text-[#4d5149] hover:bg-[#fbf7ef]"
                    }`}
                  >
                    {loading
                      ? "Loading..."
                      : activePlan === "monthly"
                        ? "Extend Monthly"
                        : "Choose Monthly"}
                  </button>
                </div>

                {/* Yearly Card - Best Value */}
                <div
                  className={`relative flex flex-col justify-between rounded-2xl border p-5 bg-[#fffdf8] hover:border-[#cbd5e1] ${
                    activePlan === "yearly"
                      ? "border-[var(--green)] ring-2 ring-[var(--green)]/15 shadow-sm"
                      : "border-[#ded5c7]"
                  }`}
                >
                  {activePlan === "yearly" && (
                    <span className="absolute right-4 top-4 rounded-full bg-[var(--green)] px-2.5 py-0.5 text-[10px] font-semibold text-white">
                      Active Plan
                    </span>
                  )}
                  <span className="absolute -top-2.5 right-4 rounded-full bg-[var(--green)] px-2.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider shadow-sm">
                    Best Value
                  </span>
                  <div>
                    <h3 className="font-semibold text-[var(--charcoal)]">
                      Yearly
                    </h3>
                    <div className="mt-3 flex items-baseline">
                      <span className="text-2xl font-bold tracking-tight">
                        Rp99.000,00
                      </span>
                      <span className="ml-1 text-xs text-[#666a61]">
                        / 1 Year
                      </span>
                    </div>
                    <ul className="mt-5 space-y-2 text-xs text-[#5f6673]">
                      <li className="flex items-center gap-1.5">
                        <Check
                          size={14}
                          className="text-[var(--green)] shrink-0"
                        />
                        <span>10x PDF upload</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check
                          size={14}
                          className="text-[var(--green)] shrink-0"
                        />
                        <span>Unlimited QR Scan</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check
                          size={14}
                          className="text-[var(--green)] shrink-0"
                        />
                        <span>Custom QR</span>
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() => handlePlanCheckout("yearly")}
                    disabled={loading}
                    className={`mt-6 w-full rounded-xl py-2.5 text-xs font-semibold border transition disabled:opacity-50 ${
                      activePlan === "yearly"
                        ? "border-[var(--green)] bg-[var(--green)] text-white hover:bg-[var(--green-dark)]"
                        : "border-[#d9d0c2] bg-white text-[#4d5149] hover:bg-[#fbf7ef]"
                    }`}
                  >
                    {loading
                      ? "Loading..."
                      : activePlan === "yearly"
                        ? "Extend Yearly"
                        : "Choose Yearly"}
                  </button>
                </div>
              </div>
            </div>

            {/* History Table */}
            <div className="rounded-[1.75rem] border border-[#e4dbce] bg-[#fffdf8] shadow-[var(--shadow-card)] overflow-hidden">
              <div className="border-b border-[#e4dbce] p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">
                    Transaction History
                  </h2>
                  <p className="text-sm text-[#666a61] mt-1">
                    Review recent payments and download invoices for accounting.
                  </p>
                </div>
                {transactions.length > 0 && (
                  <div className="flex items-center gap-2 text-sm shrink-0">
                    <span className="text-xs font-semibold text-[#666a61]">
                      Tampilkan:
                    </span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="rounded-lg border border-[#d9d0c2] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#4d5149] shadow-sm outline-none focus:border-[var(--green)] focus:ring-1 focus:ring-[var(--green)]/20 transition cursor-pointer"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                )}
              </div>

              {transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-10 text-center bg-white">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fbf7ef] text-[#666a61] mb-3">
                    <FileText size={20} />
                  </div>
                  <p className="font-semibold text-sm">
                    No transaction invoices
                  </p>
                  <p className="text-xs text-[#777a72] mt-1 max-w-xs">
                    Free plans do not generate monthly billing statements.
                    Upgrade to a paid plan to see invoice records.
                  </p>
                </div>
              ) : (
                <>
                  {/* Desktop View (Table) */}
                  <div className="hidden md:block overflow-x-auto bg-white">
                    <table className="w-full border-collapse text-left text-sm">
                      <thead>
                        <tr className="border-b border-[#e4dbce] bg-[#fbf7ef]/50 text-xs font-semibold uppercase tracking-wider text-[#777a72]">
                          <th className="px-6 py-4">Billing Date</th>
                          <th className="px-6 py-4">Invoice No</th>
                          <th className="px-6 py-4">Plan Name</th>
                          <th className="px-6 py-4">Paid Amount</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Invoice</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#ece4d8] text-[#4d5149]">
                        {paginatedTransactions.map((tx) => (
                          <tr
                            key={tx.id}
                            className="transition hover:bg-[#fbf7ef]/50"
                          >
                            <td className="whitespace-nowrap px-6 py-4 font-medium">
                              {tx.date}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-[#777a72]">
                              {tx.invoiceNo}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 font-medium">
                              {tx.planName}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 font-semibold text-[var(--charcoal)]">
                              {tx.amount}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <span className="inline-flex items-center gap-1 rounded-full border border-[#cfe1cf] bg-[#eef6ed] px-2.5 py-0.5 text-xs font-medium text-[var(--green-dark)]">
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    tx.status === "Paid"
                                      ? "bg-[var(--green)]"
                                      : "bg-yellow-500"
                                  }`}
                                ></span>
                                {tx.status}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-right">
                              {tx.status === "Paid" ? (
                                <button
                                  onClick={() => handleDownloadInvoice(tx.id)}
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#d9d0c2] bg-white text-[#4d5149] transition hover:-translate-y-0.5 hover:bg-[#fbf7ef] hover:shadow-xs"
                                  title="Lihat Invoice"
                                >
                                  <Download size={14} />
                                </button>
                              ) : (
                                <span className="text-xs text-gray-400 font-medium select-none pr-3">
                                  -
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile View (Vertical List of Paginated Cards) */}
                  <div className="md:hidden flex flex-col gap-4 pb-6 pt-2 px-4 bg-white">
                    {paginatedTransactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="rounded-2xl border border-[#e4dbce] bg-[#fffdf8] p-5 shadow-xs space-y-4 flex flex-col justify-between"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <p className="text-[10px] font-bold text-[#777a72] uppercase tracking-wider">
                              {tx.date}
                            </p>
                            <h4 className="font-bold text-sm text-[var(--charcoal)] mt-1">
                              {tx.planName}
                            </h4>
                          </div>
                          <span className="inline-flex items-center gap-1 rounded-full border border-[#cfe1cf] bg-[#eef6ed] px-2.5 py-0.5 text-xs font-medium text-[var(--green-dark)] shrink-0">
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                tx.status === "Paid"
                                  ? "bg-[var(--green)]"
                                  : "bg-yellow-500"
                              }`}
                            ></span>
                            {tx.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#ece4d8] text-xs">
                          <div>
                            <p className="text-[9px] text-[#777a72] uppercase font-bold tracking-wider">
                              Invoice No
                            </p>
                            <p className="font-semibold text-[var(--charcoal)] truncate">
                              {tx.invoiceNo}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] text-[#777a72] uppercase font-bold tracking-wider">
                              Amount
                            </p>
                            <p className="font-bold text-[var(--charcoal)]">
                              {tx.amount}
                            </p>
                          </div>
                        </div>

                        {tx.status === "Paid" && (
                          <button
                            onClick={() => handleDownloadInvoice(tx.id)}
                            className="mt-2 flex w-full h-10 items-center justify-center gap-2 rounded-xl border border-[#d9d0c2] bg-white text-xs font-semibold text-[#4d5149] transition hover:bg-[#fbf7ef] active:scale-95 cursor-pointer"
                          >
                            <Download size={14} />
                            Lihat Invoice
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-[#e4dbce] bg-white px-4 py-4 sm:px-6">
                      <div className="flex flex-1 justify-between sm:hidden w-full">
                        <button
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={validCurrentPage === 1}
                          className="relative inline-flex items-center rounded-xl border border-[#d9d0c2] bg-white px-4 py-2 text-xs font-semibold text-[#4d5149] transition hover:bg-[#fbf7ef] disabled:opacity-40 disabled:hover:bg-white cursor-pointer select-none"
                        >
                          Sebelumnya
                        </button>
                        <span className="text-xs text-[#666a61] self-center font-medium">
                          Halaman {validCurrentPage} dari {totalPages}
                        </span>
                        <button
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages),
                            )
                          }
                          disabled={validCurrentPage === totalPages}
                          className="relative inline-flex items-center rounded-xl border border-[#d9d0c2] bg-white px-4 py-2 text-xs font-semibold text-[#4d5149] transition hover:bg-[#fbf7ef] disabled:opacity-40 disabled:hover:bg-white cursor-pointer select-none"
                        >
                          Selanjutnya
                        </button>
                      </div>
                      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between w-full">
                        <div>
                          <p className="text-xs text-[#666a61]">
                            Menampilkan{" "}
                            <span className="font-semibold">
                              {(validCurrentPage - 1) * itemsPerPage + 1}
                            </span>{" "}
                            sampai{" "}
                            <span className="font-semibold">
                              {Math.min(
                                validCurrentPage * itemsPerPage,
                                transactions.length,
                              )}
                            </span>{" "}
                            dari{" "}
                            <span className="font-semibold">
                              {transactions.length}
                            </span>{" "}
                            transaksi
                          </p>
                        </div>
                        <div>
                          <nav
                            className="isolate inline-flex -space-x-px rounded-xl shadow-xs gap-1"
                            aria-label="Pagination"
                          >
                            <button
                              onClick={() =>
                                setCurrentPage((prev) => Math.max(prev - 1, 1))
                              }
                              disabled={validCurrentPage === 1}
                              className="relative inline-flex items-center rounded-lg border border-[#d9d0c2] bg-white px-3 py-2 text-xs font-semibold text-[#4d5149] transition hover:bg-[#fbf7ef] disabled:opacity-40 disabled:hover:bg-white cursor-pointer select-none"
                            >
                              Sebelumnya
                            </button>
                            {Array.from(
                              { length: totalPages },
                              (_, i) => i + 1,
                            ).map((page) => (
                              <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`relative inline-flex items-center rounded-lg px-3 py-2 text-xs font-semibold transition cursor-pointer select-none ${
                                  page === validCurrentPage
                                    ? "bg-[var(--green)] text-white"
                                    : "border border-[#d9d0c2] bg-white text-[#4d5149] hover:bg-[#fbf7ef]"
                                }`}
                              >
                                {page}
                              </button>
                            ))}
                            <button
                              onClick={() =>
                                setCurrentPage((prev) =>
                                  Math.min(prev + 1, totalPages),
                                )
                              }
                              disabled={validCurrentPage === totalPages}
                              className="relative inline-flex items-center rounded-lg border border-[#d9d0c2] bg-white px-3 py-2 text-xs font-semibold text-[#4d5149] transition hover:bg-[#fbf7ef] disabled:opacity-40 disabled:hover:bg-white cursor-pointer select-none"
                            >
                              Selanjutnya
                            </button>
                          </nav>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right Sidebar: Plan Usage Panel */}
          <aside className="space-y-5">
            {/* Current Quota Card */}
            <div className="rounded-[1.75rem] border border-[#e4dbce] bg-[#fffdf8] p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="text-[var(--green)]" size={18} />
                <h3 className="font-semibold text-sm tracking-tight uppercase text-[#666a61]">
                  Usage Analysis
                </h3>
              </div>

              <div className="mt-4 p-4 rounded-2xl bg-white border border-[#e4dbce]">
                <div className="text-xs text-[#777a72] font-medium uppercase tracking-wider">
                  Currently Using
                </div>
                <div className="text-xl font-bold mt-1 text-[var(--charcoal)]">
                  {activePlanDetails.name}
                </div>
                <div className="mt-1 text-xs text-[#666a61]">
                  {activePlan === "free"
                    ? "Base features limit active."
                    : "Pro features unlocked."}
                </div>
              </div>

              {/* Quota Metrics */}
              <div className="mt-5 space-y-4">
                {/* Quota 1: PDF Uploaded */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-[#666a61]">PDF Uploads</span>
                    <span className="text-[var(--charcoal)]">
                      {totalMenusCount}{" "}
                      <span className="text-[#888c83]">
                        / {activePlanDetails.pdfLimit}
                      </span>
                    </span>
                  </div>
                  <div className="h-2 w-full bg-[#f1ebe1] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--green)] rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          (totalMenusCount / activePlanDetails.pdfLimit) * 100,
                          100,
                        )}%`,
                      }}
                    />
                  </div>
                  {totalMenusCount >= activePlanDetails.pdfLimit && (
                    <p className="mt-1 text-[10px] text-red-600 font-medium flex items-center gap-1">
                      <AlertCircle size={10} /> Limit reached. Upgrade for more
                      files.
                    </p>
                  )}
                </div>

                {/* Quota 3: QR Scans */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-[#666a61]">QR Code Scans</span>
                    <span className="text-[var(--charcoal)]">
                      {activePlanDetails.scansUsed}{" "}
                      <span className="text-[#888c83]">
                        /{" "}
                        {typeof activePlanDetails.scanLimit === "number"
                          ? activePlanDetails.scanLimit
                          : "∞"}
                      </span>
                    </span>
                  </div>
                  <div className="h-2 w-full bg-[#f1ebe1] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--green)] rounded-full transition-all duration-500"
                      style={{
                        width:
                          activePlanDetails.scansUsed === 0
                            ? "0%"
                            : typeof activePlanDetails.scanLimit === "number"
                              ? `${Math.min(
                                  (activePlanDetails.scansUsed /
                                    activePlanDetails.scanLimit) *
                                    100,
                                  100,
                                )}%`
                              : `${
                                  activePlanDetails.scansUsed <= 1000
                                    ? 1 +
                                      ((activePlanDetails.scansUsed - 1) /
                                        999) *
                                        79
                                    : Math.min(
                                        95,
                                        80 +
                                          ((activePlanDetails.scansUsed -
                                            1000) /
                                            9000) *
                                            15,
                                      )
                                }%`,
                      }}
                    />
                  </div>
                  {activePlan === "free" && lastResetDate && (
                    <p className="mt-2 text-[10px] text-[#666a61] flex items-center gap-1.5 leading-relaxed">
                      <Info
                        size={11}
                        className="text-[var(--green)] shrink-0"
                      />
                      <span>
                        Reset counter scan berikutnya:{" "}
                        <strong className="text-[var(--charcoal)]">
                          {(() => {
                            const lastReset = new Date(lastResetDate);
                            const nextReset = new Date(
                              lastReset.getTime() + 30 * 24 * 60 * 60 * 1000,
                            );
                            return nextReset.toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            });
                          })()}
                        </strong>
                      </span>
                    </p>
                  )}
                  {activePlan === "free" &&
                    activePlanDetails.scansUsed >= 1000 && (
                      <p className="mt-1.5 text-[10px] text-red-600 font-semibold flex items-center gap-1">
                        <AlertCircle size={10} className="shrink-0" />
                        <span>
                          Batas scan bulanan tercapai. Upgrade paket untuk
                          mengaktifkan kembali menu Anda.
                        </span>
                      </p>
                    )}
                </div>
              </div>
            </div>

            {/* Billing Period Card */}
            {/* <div className="rounded-[1.75rem] border border-[#e4dbce] bg-[#fffdf8] p-5 shadow-sm">
                  <h3 className="font-semibold text-sm tracking-tight uppercase text-[#666a61]">Billing Period</h3>
                  <div className="mt-4 p-4 rounded-2xl bg-white border border-[#e4dbce] text-xs leading-5 text-[#666a61]">
                    {activePlan === "free" ? (
                      "You are currently on the Free Tier. Upgrades are active immediately."
                    ) : (
                      <p>
                        Expired date:<br />
                        <span className="font-semibold text-[var(--charcoal)]">{endedAt}</span><br />
                        via QRISly gateway.
                      </p>
                    )}
                  </div>
                </div> */}

            {/* Billing Summary notice */}
            <div className="rounded-[1.75rem] border border-[#e4dbce] bg-white p-5 shadow-sm space-y-4">
              <div className="flex items-start gap-2.5 text-xs text-[#5f6673] leading-5">
                <Info
                  size={16}
                  className="text-[var(--green)] shrink-0 mt-0.5"
                />
                <p>
                  Payments are processed securely via QRISly. Once purchased,
                  plans are non-refundable.
                </p>
              </div>
            </div>

            {/* Quick Link box */}
            <div className="rounded-[1.75rem] border border-[#e4dbce] bg-[#fffdf8] p-5 shadow-sm">
              <h3 className="font-semibold text-sm text-[var(--charcoal)]">
                Quick Navigation
              </h3>
              <div className="mt-4 space-y-2">
                <Link
                  href="/dashboard"
                  className="flex min-h-11 items-center gap-2 rounded-2xl border border-[#d9d0c2] bg-white px-4 text-sm font-semibold transition hover:bg-[#fbf7ef]"
                >
                  <FileCheck2 size={16} />
                  Back to Overview
                </Link>
                <Link
                  href="/qr"
                  className="flex min-h-11 items-center gap-2 rounded-2xl border border-[#d9d0c2] bg-white px-4 text-sm font-semibold transition hover:bg-[#fbf7ef]"
                >
                  <QrCode size={16} />
                  Open QR print studio
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* QRIS Payment Modal */}
      {showQrisModal && qrisData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="relative w-full max-w-md overflow-hidden rounded-[2.25rem] border border-[#e4dbce] bg-[#fffdf8] p-6 shadow-2xl transition-all duration-300">
            {/* Modal Header */}
            <div className="text-center mt-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--green-soft)] text-[var(--green)] mb-3">
                <QrCode size={24} />
              </div>
              <h3 className="text-xl font-bold text-[var(--charcoal)] tracking-tight">
                QRIS Payment
              </h3>
              <p className="text-xs text-[#666a61] mt-1.5 px-4">
                Scan the QR code below using GoPay, OVO, ShopeePay, Dana, or
                your Mobile Banking application to pay.
              </p>
            </div>

            {/* QR Code */}
            <div className="mx-auto my-6 flex flex-col items-center justify-center p-4 rounded-3xl bg-white border border-[#e4dbce] max-w-[240px] shadow-xs animate-scale-up">
              <img
                src={qrisData.qr_url}
                alt="QRIS Code"
                className="w-full aspect-square object-contain rounded-xl"
              />
              <div className="mt-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Dynamic QRIS
              </div>
            </div>

            {/* Details */}
            <div className="rounded-2xl border border-[#e4dbce] bg-white p-4 space-y-2.5 text-xs text-[#555950]">
              <div className="flex justify-between items-center">
                <span className="text-[#777a72]">Plan Selected:</span>
                <span className="font-semibold text-[var(--charcoal)]">
                  {selectedPlan === "monthly" ? "Monthly Plan" : "Yearly Plan"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#777a72]">Amount:</span>
                <span className="font-bold text-[var(--green-dark)] text-sm">
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                  }).format(qrisData.amount)}
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-[#ece4d8] pt-2.5">
                <span className="text-[#777a72]">Invoice No:</span>
                <span className="font-mono text-[10px] text-[#4d5149]">
                  {qrisData.order_id}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-2.5">
              <button
                onClick={handleCheckPayment}
                disabled={checkingPayment}
                className="w-full flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[var(--green)] text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[var(--green-dark)] shadow-[0_12px_24px_rgba(66,107,79,0.18)] disabled:opacity-50 cursor-pointer"
              >
                {checkingPayment ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Verifying...
                  </span>
                ) : (
                  "I Have Paid (Saya Sudah Bayar)"
                )}
              </button>
              <button
                onClick={() => setShowQrisModal(false)}
                disabled={checkingPayment}
                className="w-full flex min-h-12 items-center justify-center rounded-2xl border border-[#d9d0c2] bg-white text-sm font-semibold text-[#4d5149] transition hover:bg-[#fbf7ef] disabled:opacity-50 cursor-pointer"
              >
                Pay Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Promo Monthly Rp0 Modal */}
      {showConfirmPromoModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="relative w-full max-w-md overflow-hidden rounded-[2.25rem] border border-[#e4dbce] bg-[#fffdf8] p-6 shadow-2xl transition-all duration-300 animate-scale-up">
            {/* Modal Header */}
            <div className="text-center mt-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--green-soft)] text-[var(--green)] mb-3">
                <Sparkles size={24} />
              </div>
              <h3 className="text-xl font-bold text-[var(--charcoal)] tracking-tight">
                Aktivasi Promo Monthly
              </h3>
              <p className="text-xs text-[#666a61] mt-1.5 px-4">
                Anda memenuhi syarat untuk mendapatkan promo langganan Monthly
                Plan pertama Anda secara gratis!
              </p>
            </div>

            {/* Promo Benefits / Info Box */}
            <div className="my-6 rounded-2xl border border-[#e4dbce] bg-white p-5 space-y-4 text-xs text-[#555950]">
              <div className="flex justify-between items-center pb-2.5 border-b border-[#ece4d8]">
                <span className="text-[#777a72]">Nama Paket:</span>
                <span className="font-semibold text-[var(--charcoal)]">
                  Monthly Plan (Promo)
                </span>
              </div>

              <div className="space-y-2">
                <span className="text-[#777a72] block font-medium">
                  Manfaat yang Anda dapatkan:
                </span>
                <ul className="space-y-1.5 pl-1">
                  <li className="flex items-center gap-2">
                    <Check size={12} className="text-[var(--green)] shrink-0" />
                    <span>Upload hingga 5 file Menu PDF</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={12} className="text-[var(--green)] shrink-0" />
                    <span>Scan QR Menu tanpa batas (Unlimited)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={12} className="text-[var(--green)] shrink-0" />
                    <span>Kustomisasi desain QR Code</span>
                  </li>
                </ul>
              </div>

              <div className="flex justify-between items-center pt-2.5 border-t border-[#ece4d8]">
                <span className="text-[#777a72] font-semibold">
                  Harga Promo:
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 line-through">
                    Rp9.000,00
                  </span>
                  <span className="font-bold text-[var(--green-dark)] text-sm">
                    Rp0
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#777a72]">Masa Aktif:</span>
                <span className="font-semibold text-[var(--charcoal)]">
                  30 Hari
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2.5">
              <button
                onClick={() => {
                  setShowConfirmPromoModal(false);
                  handlePlanCheckout("monthly");
                }}
                className="w-full flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[var(--green)] text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[var(--green-dark)] shadow-[0_12px_24px_rgba(66,107,79,0.18)] cursor-pointer"
              >
                Aktifkan Sekarang (Gratis)
              </button>
              <button
                onClick={() => setShowConfirmPromoModal(false)}
                className="w-full flex min-h-12 items-center justify-center rounded-2xl border border-[#d9d0c2] bg-white text-sm font-semibold text-[#4d5149] transition hover:bg-[#fbf7ef] cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
