import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const historyId = searchParams.get("id");
    const orderId = searchParams.get("order_id");

    if (!historyId || !orderId) {
      return NextResponse.json({ error: "Missing query parameters" }, { status: 400 });
    }

    const apiKey = process.env.QRISLY_API_KEY || "";
    const baseUrl = process.env.QRISLY_BASE_URL || "https://api-sandbox.collaborator.komerce.id/user/api/v1/qrisly";

    let isSuccess = false;
    let paymentStatus = "pending";

    // Handle mock transaction
    if (historyId.startsWith("mock_hist_") || !apiKey || apiKey === "mock-qrisly-api-key-12345" || apiKey.startsWith("mock-")) {
      // Simulate success
      isSuccess = true;
      paymentStatus = "success";
    } else {
      // Fetch status from actual QRISly endpoint
      const qrislyUrl = `${baseUrl.replace(/\/$/, "")}/payment-status/${historyId}`;
      const response = await fetch(qrislyUrl, {
        method: "GET",
        headers: {
          "X-API-Key": apiKey,
          "Accept": "application/json"
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("QRISly Status API error:", errorText);
        return NextResponse.json({ status: "error", message: "Failed to fetch status from gateway" });
      }

      const result = await response.json();
      const data = result.data || result;
      
      // Determine status from payload
      paymentStatus = String(data.status || data.payment_status || "pending").toLowerCase();
      isSuccess = paymentStatus === "success" || paymentStatus === "paid";
    }

    // If payment is successful, update subscription in DB (acting as a fallback/accelerator for webhook)
    if (isSuccess && orderId.startsWith("SUB_")) {
      const parts = orderId.split("_");
      let userId = parts[1];
      const plan = parts[2];

      if (userId && plan) {
        // Decode base64url UUID back to standard UUID
        if (userId.length === 22) {
          try {
            const hexBack = Buffer.from(userId, "base64url").toString("hex");
            userId = [
              hexBack.slice(0, 8),
              hexBack.slice(8, 12),
              hexBack.slice(12, 16),
              hexBack.slice(16, 20),
              hexBack.slice(20),
            ].join("-");
          } catch (e) {
            console.error("Failed to decode user UUID:", e);
          }
        }

        const adminDb = createAdminClient();
        const price = plan === "monthly" ? 9000 : 99000;

        // Fetch subscriptions to find the specific one for this orderId
        const { data: userSubs } = await adminDb
          .from("subscriptions")
          .select("id, price, qrisly_response, ended_at")
          .eq("user_id", userId);

        const targetSub = (userSubs ?? []).find(sub => {
          const subOrderId = typeof sub.qrisly_response === 'object' && sub.qrisly_response !== null
            ? (sub.qrisly_response as any).order_id
            : null;
          return subOrderId === orderId;
        });

        // Determine if targetSub is already activated
        const isTargetAlreadyActivated = targetSub && targetSub.ended_at !== null && (() => {
          const responseStatus = typeof targetSub.qrisly_response === 'object' && targetSub.qrisly_response !== null
            ? String((targetSub.qrisly_response as any).status).toLowerCase()
            : null;
          return responseStatus === "success" || responseStatus === "paid";
        })();

        if (!isTargetAlreadyActivated) {
          // Calculate startedAt and endedAt based on maximum ended_at of existing active plans
          const nowStr = new Date().toISOString();
          const { data: existingActiveSubs } = await adminDb
            .from("subscriptions")
            .select("ended_at, price, qrisly_response")
            .eq("user_id", userId)
            .gt("ended_at", nowStr);

          const validActiveSubs = (existingActiveSubs ?? []).filter(sub => {
            if (sub.price === 0) return true; // promo
            const responseStatus = typeof sub.qrisly_response === 'object' && sub.qrisly_response !== null
              ? String((sub.qrisly_response as any).status).toLowerCase()
              : null;
            return responseStatus === "success" || responseStatus === "paid";
          });

          let finalStartedAt = new Date();
          if (validActiveSubs.length > 0) {
            const endDates = validActiveSubs
              .map(sub => sub.ended_at ? new Date(sub.ended_at).getTime() : 0)
              .filter(time => time > 0);
            if (endDates.length > 0) {
              finalStartedAt = new Date(Math.max(...endDates));
            }
          }

          const finalEndedAt = new Date(finalStartedAt);
          if (plan === "monthly") {
            finalEndedAt.setDate(finalEndedAt.getDate() + 30);
          } else if (plan === "yearly") {
            finalEndedAt.setDate(finalEndedAt.getDate() + 365);
          }

          if (targetSub) {
            // Update pending to active
            const updatedResponse = typeof targetSub.qrisly_response === 'object' && targetSub.qrisly_response !== null
              ? { ...(targetSub.qrisly_response as any), status: paymentStatus }
              : { status: paymentStatus };

            await adminDb
              .from("subscriptions")
              .update({
                qrisly_response: updatedResponse,
                started_at: finalStartedAt.toISOString(),
                ended_at: finalEndedAt.toISOString(),
              })
              .eq("id", targetSub.id);
          } else {
            // Create subscription record if none pending
            await adminDb.from("subscriptions").insert({
              user_id: userId,
              plan: plan,
              price: price,
              qrisly_response: { status: paymentStatus, order_id: orderId, history_id: historyId },
              started_at: finalStartedAt.toISOString(),
              ended_at: finalEndedAt.toISOString(),
            });
          }

          // Reset usage limit
          const { data: existingUsage } = await adminDb
            .from("subscription_usages")
            .select("id")
            .eq("user_id", userId)
            .maybeSingle();

          if (existingUsage) {
            await adminDb
              .from("subscription_usages")
              .update({ pdf_upload: 0, qr_scan: 0 })
              .eq("user_id", userId);
          } else {
            await adminDb.from("subscription_usages").insert({
              user_id: userId,
              pdf_upload: 0,
              qr_scan: 0,
            });
          }
        }
      }
    } else if (!isSuccess && orderId.startsWith("SUB_")) {
      // If it is failed/expired/canceled, update the record in DB so it doesn't stay pending forever
      const isFailed = paymentStatus === "expired";

      if (isFailed) {
        const parts = orderId.split("_");
        let userId = parts[1];
        const plan = parts[2];

        if (userId && plan) {
          // Decode base64url UUID back to standard UUID
          if (userId.length === 22) {
            try {
              const hexBack = Buffer.from(userId, "base64url").toString("hex");
              userId = [
                hexBack.slice(0, 8),
                hexBack.slice(8, 12),
                hexBack.slice(12, 16),
                hexBack.slice(16, 20),
                hexBack.slice(20),
              ].join("-");
            } catch (e) {
              console.error("Failed to decode user UUID:", e);
            }
          }

          const adminDb = createAdminClient();
          const { data: userSubs } = await adminDb
            .from("subscriptions")
            .select("id, price, qrisly_response, ended_at")
            .eq("user_id", userId);

          const targetSub = (userSubs ?? []).find(sub => {
            const subOrderId = typeof sub.qrisly_response === 'object' && sub.qrisly_response !== null
              ? (sub.qrisly_response as any).order_id
              : null;
            return subOrderId === orderId;
          });

          if (targetSub && targetSub.ended_at === null) {
            const updatedResponse = typeof targetSub.qrisly_response === 'object' && targetSub.qrisly_response !== null
              ? { ...(targetSub.qrisly_response as any), status: paymentStatus.toLowerCase() }
              : { status: paymentStatus.toLowerCase() };

            await adminDb
              .from("subscriptions")
              .update({
                qrisly_response: updatedResponse,
                ended_at: new Date().toISOString(),
              })
              .eq("id", targetSub.id);
          }
        }
      }
    }

    return NextResponse.json({ status: paymentStatus, success: isSuccess });
  } catch (error) {
    console.error("QRISly status verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
