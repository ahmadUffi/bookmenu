"use client";

import { useState } from "react";
import Link from "next/link";
import Script from "next/script";
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
  midtransClientKey: string;
  midtransSnapUrl: string;
};

type PlanType = "free" | "monthly" | "yearly";

export default function BillingPanel({
  initialBusinessName,
  initialMenus,
  activePlan,
  endedAt,
  transactions,
  midtransClientKey,
  midtransSnapUrl,
}: BillingPanelProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(activePlan);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const totalMenusCount = initialMenus.length;

  // Plan Details Map
  const plans = {
    free: {
      name: "Free Plan",
      price: "Rp0",
      period: "month",
      pdfLimit: 1,
      scanLimit: 1000,
      scansUsed: 420,
    },
    monthly: {
      name: "Monthly Plan",
      price: "Rp9.000,00",
      period: "month",
      pdfLimit: 10,
      scanLimit: "Unlimited",
      scansUsed: 1240,
    },
    yearly: {
      name: "Yearly Plan",
      price: "Rp99.000,00",
      period: "year",
      pdfLimit: 10,
      scanLimit: "Unlimited",
      scansUsed: 1240,
    },
  };

  const activePlanDetails = plans[activePlan];
  const currentPlanDetails = plans[selectedPlan];

  const handlePlanCheckout = async (plan: PlanType) => {
    if (plan === activePlan) return;
    if (plan === "free") {
      setNotice("Please contact support to cancel or downgrade your active plan.");
      return;
    }

    setLoading(true);
    setNotice(null);

    try {
      const res = await fetch("/api/midtrans/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to generate payment token");
      }

      const data = await res.json();
      const token = data.token;

      if (typeof window !== "undefined" && (window as any).snap) {
        (window as any).snap.pay(token, {
          onSuccess: function (result: any) {
            setNotice("Payment successful! Your active subscription will be updated shortly.");
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          },
          onPending: function (result: any) {
            setNotice("Payment pending. Please complete payment inside your payment app.");
          },
          onError: function (result: any) {
            setNotice("Payment failed. Please try again.");
          },
          onClose: function () {
            setNotice("Payment window closed before completion.");
          },
        });
      } else if (data.redirect_url) {
        window.location.href = data.redirect_url;
      } else {
        throw new Error("Midtrans Snap client library not loaded.");
      }
    } catch (err: any) {
      console.error(err);
      setNotice(err.message || "An error occurred during payment processing.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = (invoiceNo: string) => {
    alert(`Downloading invoice ${invoiceNo} as PDF (Simulated).`);
  };

  return (
    <main className="h-screen overflow-hidden bg-[var(--cream)] text-[var(--charcoal)]">
      {/* Load Midtrans Snap client libraries */}
      <Script
        src={midtransSnapUrl}
        data-client-key={midtransClientKey}
        strategy="lazyOnload"
      />

      <div className="grid h-screen lg:grid-cols-[280px_1fr]">
        {/* Navigation Sidebar */}
        <aside className="hidden h-screen overflow-hidden border-r border-[#e4dbce] bg-[#fffdf8]/86 p-5 backdrop-blur lg:block">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--charcoal)] text-white">
              <Sparkles size={19} />
            </div>
            <div>
              <p className="font-semibold tracking-tight">DocLume</p>
              <p className="text-xs font-medium text-[#73766e]">Document OS</p>
            </div>
          </div>

          <nav className="mt-9 space-y-1">
            <Link
              href="/dashboard"
              className="flex min-h-11 w-full items-center gap-3 rounded-2xl px-3 text-left text-sm font-semibold text-[#666a61] transition hover:bg-[#f3ede3] hover:text-[var(--charcoal)]"
            >
              <Home size={18} />
              Overview
            </Link>
            <Link
              href="/qr"
              className="flex min-h-11 w-full items-center gap-3 rounded-2xl px-3 text-left text-sm font-semibold text-[#666a61] transition hover:bg-[#f3ede3] hover:text-[var(--charcoal)]"
            >
              <QrCode size={18} />
              QR codes
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex min-h-11 w-full items-center gap-3 rounded-2xl px-3 text-left text-sm font-semibold text-[#666a61] transition hover:bg-[#f3ede3] hover:text-[var(--charcoal)]"
            >
              <Sparkles size={18} />
              Settings
            </Link>
            <Link
              href="/dashboard/billing"
              className="flex min-h-11 w-full items-center gap-3 rounded-2xl bg-[var(--charcoal)] px-3 text-left text-sm font-semibold text-white shadow-[0_14px_30px_rgba(31,33,29,0.16)]"
            >
              <CreditCard size={18} />
              Billing
            </Link>
            <Link
              href="/"
              className="flex min-h-11 w-full items-center gap-3 rounded-2xl px-3 text-left text-sm font-semibold text-[#666a61] transition hover:bg-[#f3ede3] hover:text-[var(--charcoal)]"
            >
              <FileText size={18} />
              Landing page
            </Link>
          </nav>

          <div className="mt-8 rounded-3xl border border-[#e4dbce] bg-[#f8f3eb] p-4">
            <p className="text-sm font-semibold">Billing Period</p>
            <div className="mt-2 text-xs leading-5 text-[#666a61]">
              {activePlan === "free" ? (
                "You are currently on the Free Tier. Upgrades are active immediately."
              ) : (
                <p>
                  Renewal date:<br />
                  <span className="font-semibold text-[var(--charcoal)]">{endedAt}</span><br />
                  via Midtrans gateway.
                </p>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <section className="h-screen min-h-0 overflow-y-auto">
          {/* Header */}
          <header className="sticky top-0 z-30 border-b border-[#e4dbce] bg-[#f7f3eb]/88 px-4 py-4 backdrop-blur-xl md:px-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[var(--green)]">
                  Billing Management
                </p>
                <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                  {initialBusinessName}
                </h1>
              </div>
              <a
                href="/auth/logout"
                className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-[#d9d0c2] bg-white/70 px-4 text-sm font-semibold text-[#4d5149] transition hover:-translate-y-0.5 hover:bg-white"
              >
                <LogOut size={16} />
                Logout
              </a>
            </div>
          </header>

          {/* Sub content page */}
          <div className="px-4 py-6 md:px-8 md:py-8">
            {notice ? (
              <div className="mb-6 flex items-center gap-2.5 rounded-2xl border border-[#cfe1cf] bg-[#eef6ed] px-4 py-3 text-sm font-medium text-[var(--green-dark)] shadow-sm transition-all duration-300">
                <CheckCircle2 size={18} className="shrink-0 text-[var(--green)]" />
                <span>{notice}</span>
              </div>
            ) : null}

            {/* Layout divided into Main Section & Usage Sidebar */}
            <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
              {/* Left Column: Plans & History */}
              <div className="space-y-6">
                {/* Pricing List */}
                <div className="rounded-[1.75rem] border border-[#e4dbce] bg-white p-6 shadow-[var(--shadow-card)]">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold tracking-tight">Select Subscription Plan</h2>
                    <p className="text-sm text-[#666a61]">
                      Choose the plan that suits your publishing frequency and scan volumes.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    {/* Free Card */}
                    <div
                      className={`relative flex flex-col justify-between rounded-2xl border p-5 transition-all ${
                        activePlan === "free"
                          ? "border-[var(--green)] bg-[var(--green-soft)]/20 shadow-sm"
                          : "border-[#e4dbce] bg-[#fffdf8] hover:border-[#cbd5e1]"
                      }`}
                    >
                      {activePlan === "free" && (
                        <span className="absolute right-4 top-4 rounded-full bg-[var(--green)] px-2.5 py-0.5 text-[10px] font-semibold text-white">
                          Active Plan
                        </span>
                      )}
                      <div>
                        <h3 className="font-semibold text-[var(--charcoal)]">Free</h3>
                        <div className="mt-3 flex items-baseline">
                          <span className="text-2xl font-bold tracking-tight">Rp0</span>
                          <span className="ml-1 text-xs text-[#666a61]">/ month</span>
                        </div>
                        <ul className="mt-5 space-y-2 text-xs text-[#5f6673]">
                          <li className="flex items-center gap-1.5">
                            <Check size={14} className="text-[var(--green)] shrink-0" />
                            <span>1x PDF upload</span>
                          </li>
                          <li className="flex items-center gap-1.5">
                            <Check size={14} className="text-[var(--green)] shrink-0" />
                            <span>QR Menu</span>
                          </li>
                          <li className="flex items-center gap-1.5">
                            <Check size={14} className="text-[var(--green)] shrink-0" />
                            <span>1000x QR Scan</span>
                          </li>
                          <li className="flex items-center gap-1.5">
                            <Check size={14} className="text-[var(--green)] shrink-0" />
                            <span>Owner dashboard</span>
                          </li>
                        </ul>
                      </div>
                      <button
                        onClick={() => handlePlanCheckout("free")}
                        disabled={activePlan === "free" || loading}
                        className={`mt-6 w-full rounded-xl py-2.5 text-xs font-semibold transition ${
                          activePlan === "free"
                            ? "bg-[var(--green)] text-white cursor-default"
                            : "border border-[#d9d0c2] bg-white text-[#4d5149] hover:bg-[#fbf7ef] disabled:opacity-50"
                        }`}
                      >
                        {activePlan === "free" ? "Current Plan" : "Downgrade"}
                      </button>
                    </div>

                    {/* Monthly Card */}
                    <div
                      className={`relative flex flex-col justify-between rounded-2xl border p-5 transition-all ${
                        activePlan === "monthly"
                          ? "border-[var(--green)] bg-[var(--green-soft)]/20 shadow-sm"
                          : "border-[#e4dbce] bg-[#fffdf8] hover:border-[#cbd5e1]"
                      }`}
                    >
                      {activePlan === "monthly" && (
                        <span className="absolute right-4 top-4 rounded-full bg-[var(--green)] px-2.5 py-0.5 text-[10px] font-semibold text-white">
                          Active Plan
                        </span>
                      )}
                      <div>
                        <h3 className="font-semibold text-[var(--charcoal)]">Monthly</h3>
                        <div className="mt-3 flex items-baseline">
                          <span className="text-2xl font-bold tracking-tight">Rp9.000,00</span>
                          <span className="ml-1 text-xs text-[#666a61]">/ month</span>
                        </div>
                        <ul className="mt-5 space-y-2 text-xs text-[#5f6673]">
                          <li className="flex items-center gap-1.5">
                            <Check size={14} className="text-[var(--green)] shrink-0" />
                            <span>10x PDF upload</span>
                          </li>
                          <li className="flex items-center gap-1.5">
                            <Check size={14} className="text-[var(--green)] shrink-0" />
                            <span>Unlimited QR Scan</span>
                          </li>
                          <li className="flex items-center gap-1.5">
                            <Check size={14} className="text-[var(--green)] shrink-0" />
                            <span>Custom QR</span>
                          </li>
                        </ul>
                      </div>
                      <button
                        onClick={() => handlePlanCheckout("monthly")}
                        disabled={activePlan === "monthly" || loading}
                        className={`mt-6 w-full rounded-xl py-2.5 text-xs font-semibold transition ${
                          activePlan === "monthly"
                            ? "bg-[var(--green)] text-white cursor-default"
                            : "border border-[#d9d0c2] bg-white text-[#4d5149] hover:bg-[#fbf7ef] disabled:opacity-50"
                        }`}
                      >
                        {activePlan === "monthly" ? "Current Plan" : loading ? "Loading..." : "Choose Monthly"}
                      </button>
                    </div>

                    {/* Yearly Card - Best Value */}
                    <div
                      className={`relative flex flex-col justify-between rounded-2xl border-2 p-5 transition-all ${
                        activePlan === "yearly"
                          ? "border-[var(--green)] bg-[var(--green-soft)]/20 shadow-sm"
                          : "border-[#ded5c7] bg-[#fffdf8] hover:border-[#cbd5e1]"
                      }`}
                    >
                      <span className="absolute -top-2.5 right-4 rounded-full bg-[var(--green)] px-2.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider shadow-sm">
                        Best Value
                      </span>
                      {activePlan === "yearly" && (
                        <span className="absolute right-4 top-4 rounded-full bg-[var(--green)] px-2.5 py-0.5 text-[10px] font-semibold text-white">
                          Active Plan
                        </span>
                      )}
                      <div>
                        <h3 className="font-semibold text-[var(--charcoal)]">Yearly</h3>
                        <div className="mt-3 flex items-baseline">
                          <span className="text-2xl font-bold tracking-tight">Rp99.000,00</span>
                          <span className="ml-1 text-xs text-[#666a61]">/ year</span>
                        </div>
                        <ul className="mt-5 space-y-2 text-xs text-[#5f6673]">
                          <li className="flex items-center gap-1.5">
                            <Check size={14} className="text-[var(--green)] shrink-0" />
                            <span>10x PDF upload</span>
                          </li>
                          <li className="flex items-center gap-1.5">
                            <Check size={14} className="text-[var(--green)] shrink-0" />
                            <span>Unlimited QR Scan</span>
                          </li>
                          <li className="flex items-center gap-1.5">
                            <Check size={14} className="text-[var(--green)] shrink-0" />
                            <span>Custom QR</span>
                          </li>
                        </ul>
                      </div>
                      <button
                        onClick={() => handlePlanCheckout("yearly")}
                        disabled={activePlan === "yearly" || loading}
                        className={`mt-6 w-full rounded-xl py-2.5 text-xs font-semibold transition ${
                          activePlan === "yearly"
                            ? "bg-[var(--green)] text-white cursor-default"
                            : "border border-[#d9d0c2] bg-white text-[#4d5149] hover:bg-[#fbf7ef] disabled:opacity-50"
                        }`}
                      >
                        {activePlan === "yearly" ? "Current Plan" : loading ? "Loading..." : "Choose Yearly"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* History Table */}
                <div className="rounded-[1.75rem] border border-[#e4dbce] bg-[#fffdf8] shadow-[var(--shadow-card)] overflow-hidden">
                  <div className="border-b border-[#e4dbce] p-6">
                    <h2 className="text-xl font-semibold tracking-tight">Transaction History</h2>
                    <p className="text-sm text-[#666a61]">
                      Review recent payments and download invoices for accounting.
                    </p>
                  </div>

                  {transactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-10 text-center bg-white">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fbf7ef] text-[#666a61] mb-3">
                        <FileText size={20} />
                      </div>
                      <p className="font-semibold text-sm">No transaction invoices</p>
                      <p className="text-xs text-[#777a72] mt-1 max-w-xs">
                        Free plans do not generate monthly billing statements. Upgrade to a paid plan to see invoice records.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto bg-white">
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
                          {transactions.map((tx) => (
                            <tr key={tx.id} className="transition hover:bg-[#fbf7ef]/50">
                              <td className="whitespace-nowrap px-6 py-4 font-medium">{tx.date}</td>
                              <td className="whitespace-nowrap px-6 py-4 text-[#777a72]">{tx.invoiceNo}</td>
                              <td className="whitespace-nowrap px-6 py-4 font-medium">{tx.planName}</td>
                              <td className="whitespace-nowrap px-6 py-4 font-semibold text-[var(--charcoal)]">{tx.amount}</td>
                              <td className="whitespace-nowrap px-6 py-4">
                                <span className="inline-flex items-center gap-1 rounded-full border border-[#cfe1cf] bg-[#eef6ed] px-2.5 py-0.5 text-xs font-medium text-[var(--green-dark)]">
                                  <span className={`h-1.5 w-1.5 rounded-full ${
                                    tx.status === "Paid" ? "bg-[var(--green)]" : "bg-yellow-500"
                                  }`}></span>
                                  {tx.status}
                                </span>
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 text-right">
                                <button
                                  onClick={() => handleDownloadInvoice(tx.invoiceNo)}
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#d9d0c2] bg-white text-[#4d5149] transition hover:-translate-y-0.5 hover:bg-[#fbf7ef] hover:shadow-xs"
                                  title="Download Invoice"
                                >
                                  <Download size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Sidebar: Plan Usage Panel */}
              <aside className="space-y-5">
                {/* Current Quota Card */}
                <div className="rounded-[1.75rem] border border-[#e4dbce] bg-[#fffdf8] p-5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="text-[var(--green)]" size={18} />
                    <h3 className="font-semibold text-sm tracking-tight uppercase text-[#666a61]">Usage Analysis</h3>
                  </div>

                  <div className="mt-4 p-4 rounded-2xl bg-white border border-[#e4dbce]">
                    <div className="text-xs text-[#777a72] font-medium uppercase tracking-wider">Currently Using</div>
                    <div className="text-xl font-bold mt-1 text-[var(--charcoal)]">{activePlanDetails.name}</div>
                    <div className="mt-1 text-xs text-[#666a61]">
                      {activePlan === "free" ? "Base features limit active." : "Pro features unlocked."}
                    </div>
                  </div>

                  {/* Quota Metrics */}
                  <div className="mt-5 space-y-4">
                    {/* Quota 1: PDF Uploaded */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1.5">
                        <span className="text-[#666a61]">PDF Uploads</span>
                        <span className="text-[var(--charcoal)]">
                          {totalMenusCount} <span className="text-[#888c83]">/ {activePlanDetails.pdfLimit}</span>
                        </span>
                      </div>
                      <div className="h-2 w-full bg-[#f1ebe1] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[var(--green)] rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(
                              (totalMenusCount / activePlanDetails.pdfLimit) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                      {totalMenusCount >= activePlanDetails.pdfLimit && (
                        <p className="mt-1 text-[10px] text-red-600 font-medium flex items-center gap-1">
                          <AlertCircle size={10} /> Limit reached. Upgrade for more files.
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
                            / {typeof activePlanDetails.scanLimit === "number" ? activePlanDetails.scanLimit : "∞"}
                          </span>
                        </span>
                      </div>
                      <div className="h-2 w-full bg-[#f1ebe1] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[var(--green)] rounded-full transition-all duration-500"
                          style={{
                            width:
                              typeof activePlanDetails.scanLimit === "number"
                                ? `${Math.min(
                                    (activePlanDetails.scansUsed / activePlanDetails.scanLimit) * 100,
                                    100
                                  )}%`
                                : "24%",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Billing Summary notice */}
                <div className="rounded-[1.75rem] border border-[#e4dbce] bg-white p-5 shadow-sm space-y-4">
                  <div className="flex items-start gap-2.5 text-xs text-[#5f6673] leading-5">
                    <Info size={16} className="text-[var(--green)] shrink-0 mt-0.5" />
                    <p>
                      Payments are processed securely via Midtrans. You can cancel or modify subscription cycles from this portal at any point.
                    </p>
                  </div>
                </div>

                {/* Quick Link box */}
                <div className="rounded-[1.75rem] border border-[#e4dbce] bg-[#fffdf8] p-5 shadow-sm">
                  <h3 className="font-semibold text-sm text-[var(--charcoal)]">Quick Navigation</h3>
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
        </section>
      </div>
    </main>
  );
}
