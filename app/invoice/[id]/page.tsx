import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOwnerRestaurant } from "@/lib/restaurant-documents";
import AutoPrint, { PrintButton } from "@/components/invoice/auto-print";
import { AlertCircle } from "lucide-react";

type InvoicePageProps = {
  params: Promise<{ id: string }>;
};

export default async function InvoicePage({ params }: InvoicePageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  const supabase = await createClient();
  if (!supabase) {
    redirect("/login");
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Fetch the logged-in user profile to check role
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  const adminDb = createAdminClient();

  // Fetch the subscription details
  const { data: subscription, error: subError } = await adminDb
    .from("subscriptions")
    .select(
      "id, user_id, plan, price, started_at, ended_at, created_at, qrisly_response",
    )
    .eq("id", id)
    .maybeSingle();

  if (subError || !subscription) {
    notFound();
  }

  const isOwner = subscription.user_id === user.id;
  const isAdmin = profile?.role === "admin";

  if (!isOwner && !isAdmin) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
        <AlertCircle className="text-red-500 mb-2" size={40} />
        <h1 className="text-xl font-bold text-gray-800">
          Akses Tidak Sah (Unauthorized)
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Anda tidak memiliki izin untuk melihat invoice ini.
        </p>
      </div>
    );
  }

  // Fetch subscription owner profile details
  const { data: ownerProfile } = await adminDb
    .from("users")
    .select("name, email")
    .eq("id", subscription.user_id)
    .single();

  // Fetch subscription owner restaurant details
  const { data: restaurant } = await getOwnerRestaurant(
    adminDb,
    subscription.user_id,
  );

  // Format invoice variables
  const invoiceDateStr = new Date(subscription.created_at).toLocaleDateString(
    "id-ID",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  );

  const year = new Date(subscription.created_at).getFullYear();
  const invoiceNo = `INV-${year}-${subscription.id.substring(0, 8).toUpperCase()}`;

  const planName = `${subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Plan`;
  const formattedPrice = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(subscription.price);

  let status: "Paid" | "Pending" | "Failed" = "Failed";
  if (subscription.price === 0) {
    status = "Paid";
  } else {
    const responseStatus =
      typeof subscription.qrisly_response === "object" &&
      subscription.qrisly_response !== null
        ? String(
            (subscription.qrisly_response as { status?: string }).status,
          ).toLowerCase()
        : null;
    if (responseStatus === "success" || responseStatus === "paid") {
      status = "Paid";
    } else if (responseStatus === "pending" || !responseStatus) {
      status = "Pending";
    }
  }

  const startPeriodStr = subscription.started_at
    ? new Date(subscription.started_at).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "-";

  const endPeriodStr = subscription.ended_at
    ? new Date(subscription.ended_at).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Selamanya";

  const activePeriod = `${startPeriodStr} s/d ${endPeriodStr}`;

  return (
    <main className="min-h-screen bg-gray-100/50 py-10 px-4 print:bg-white print:py-0 print:px-0">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              @page {
                size: portrait;
                margin: 1.5cm;
              }
              body {
                background: white !important;
                color: black !important;
              }
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
          `,
        }}
      />
      {/* Invoice Sheet */}
      <div className="mx-auto max-w-3xl rounded-3xl border border-gray-200 bg-white p-8 shadow-sm print:max-w-none print:rounded-none print:border-none print:p-0 print:shadow-none">
        {/* Header Actions (Hidden in Print) */}
        <div className="mb-8 flex items-center justify-between border-b border-gray-100 pb-5 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-500">
              Invoice:
            </span>
            <span className="font-mono text-xs font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded-md">
              {invoiceNo}
            </span>
          </div>
          <PrintButton />
        </div>

        {/* Invoice Header */}
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900">
              FlipDulu
            </h1>
            <p className="text-xs text-gray-500 mt-1 font-semibold uppercase tracking-wider">
              Digital Flipbook Creator
            </p>
          </div>
          <div className="text-left sm:text-right">
            <h2 className="text-lg font-bold text-gray-800">INVOICE</h2>
            <div className="mt-2 space-y-1 text-xs text-gray-500">
              <p>
                <span className="font-medium text-gray-700">Nomor:</span>{" "}
                {invoiceNo}
              </p>
              <p>
                <span className="font-medium text-gray-700">Tanggal:</span>{" "}
                {invoiceDateStr}
              </p>
              <p>
                <span className="font-medium text-gray-700">Status:</span>{" "}
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    status === "Paid"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : status === "Pending"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {status === "Paid"
                    ? "Lunas (Paid)"
                    : status === "Pending"
                      ? "Menunggu (Pending)"
                      : "Gagal"}
                </span>
              </p>
            </div>
          </div>
        </div>

        <hr className="my-8 border-gray-100" />

        {/* Bill To & From */}
        <div className="grid gap-6 sm:grid-cols-2 text-xs">
          <div>
            <p className="font-bold text-gray-400 uppercase tracking-wider mb-2">
              Diterbitkan Oleh:
            </p>
            <p className="font-bold text-gray-800 text-sm">PT. FlipDulu</p>
            <p className="text-gray-500 mt-1">Banyumas, Jawa Tengah</p>
            <p className="text-gray-500">Indonesia</p>
          </div>
          <div>
            <p className="font-bold text-gray-400 uppercase tracking-wider mb-2">
              Tagihan Kepada:
            </p>
            <p className="font-bold text-gray-800 text-sm">
              {ownerProfile?.name || "-"}
            </p>
            <p className="text-gray-500 mt-1">{ownerProfile?.email || "-"}</p>
            <p className="text-gray-500 mt-0.5">
              Restoran/Bisnis:{" "}
              <strong className="text-gray-700">
                {restaurant?.restaurant_name || "-"}
              </strong>
            </p>
          </div>
        </div>

        {/* Invoice Details Table */}
        <div className="mt-10 overflow-hidden rounded-2xl border border-gray-100">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                <th className="px-5 py-3">Deskripsi Layanan</th>
                <th className="px-5 py-3">Masa Aktif</th>
                <th className="px-5 py-3 text-right">Harga</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              <tr>
                <td className="px-5 py-4 font-semibold text-gray-900">
                  Langganan FlipDulu - {planName}
                </td>
                <td className="px-5 py-4 text-gray-500">{activePeriod}</td>
                <td className="px-5 py-4 text-right font-mono font-bold text-gray-900">
                  {formattedPrice}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="mt-8 flex flex-col items-end text-xs">
          <div className="w-full sm:w-64 space-y-2.5">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal:</span>
              <span className="font-mono font-medium">{formattedPrice}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>PPN (0%):</span>
              <span className="font-mono font-medium">Rp0</span>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-2.5 font-bold text-sm text-gray-900">
              <span>Total Pembayaran:</span>
              <span className="font-mono text-[#426b4f]">{formattedPrice}</span>
            </div>
          </div>
        </div>

        {/* Payment QRIS info */}
        <div className="mt-12 rounded-2xl bg-gray-50 border border-gray-100 p-5 text-xs text-gray-500">
          <p className="font-bold text-gray-800 mb-1">
            Metode Pembayaran: QRIS
          </p>
          <p className="leading-relaxed">
            Pembayaran diproses secara otomatis menggunakan QRISly gateway.
            Invoice ini sah dan diakui sebagai bukti pembayaran yang valid.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-[10px] text-gray-400 border-t border-gray-100 pt-6">
          <p>Terima kasih atas kepercayaan Anda menggunakan FlipDulu!</p>
          <p className="mt-1">https://flipdulu.web.id</p>
        </div>
      </div>

      {/* Auto Print Trigger Component */}
      <AutoPrint />
    </main>
  );
}
