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
      paymentStatus = data.status || data.payment_status || "pending";
      isSuccess = paymentStatus === "success" || paymentStatus === "settlement" || paymentStatus === "paid" || paymentStatus === "Success" || paymentStatus === "SUCCESS";
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
        const startedAt = new Date();
        const endedAt = new Date();
        if (plan === "monthly") {
          endedAt.setDate(endedAt.getDate() + 30);
        } else if (plan === "yearly") {
          endedAt.setDate(endedAt.getDate() + 365);
        }

        const price = plan === "monthly" ? 9000 : 99000;

        // Check if subscription already exists to avoid duplication
        const { data: activeSubs } = await adminDb
          .from("subscriptions")
          .select("id, price, qrisly_response")
          .eq("user_id", userId)
          .eq("plan", plan)
          .gt("ended_at", startedAt.toISOString());

        const existingSub = (activeSubs ?? []).find(sub => {
          if (sub.price === 0) return true;
          const responseStatus = typeof sub.qrisly_response === 'object' && sub.qrisly_response !== null
            ? (sub.qrisly_response as any).status
            : null;
          return ["success", "settlement", "paid", "Success", "SUCCESS"].includes(responseStatus);
        });

        if (!existingSub) {
          // Look for a pending subscription first
          const { data: userSubs } = await adminDb
            .from("subscriptions")
            .select("id, price, qrisly_response")
            .eq("user_id", userId)
            .eq("plan", plan)
            .is("ended_at", null)
            .order("created_at", { ascending: false });

          const pendingSub = (userSubs ?? []).find(sub => {
            const responseStatus = typeof sub.qrisly_response === 'object' && sub.qrisly_response !== null
              ? (sub.qrisly_response as any).status
              : null;
            return responseStatus === "pending" || !responseStatus;
          });

          if (pendingSub) {
            // Update pending to active
            const updatedResponse = typeof pendingSub.qrisly_response === 'object' && pendingSub.qrisly_response !== null
              ? { ...(pendingSub.qrisly_response as any), status: paymentStatus }
              : { status: paymentStatus };

            await adminDb
              .from("subscriptions")
              .update({
                qrisly_response: updatedResponse,
                started_at: startedAt.toISOString(),
                ended_at: endedAt.toISOString(),
              })
              .eq("id", pendingSub.id);
          } else {
            // Create subscription record if none pending
            await adminDb.from("subscriptions").insert({
              user_id: userId,
              plan: plan,
              price: price,
              qrisly_response: { status: paymentStatus },
              started_at: startedAt.toISOString(),
              ended_at: endedAt.toISOString(),
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

          // Deactivate old active plans
          const { data: oldSubs } = await adminDb
            .from("subscriptions")
            .select("id, qrisly_response")
            .eq("user_id", userId)
            .not("started_at", "eq", startedAt.toISOString());

          for (const oldSub of (oldSubs ?? [])) {
            const responseStatus = typeof oldSub.qrisly_response === 'object' && oldSub.qrisly_response !== null
              ? (oldSub.qrisly_response as any).status
              : null;
            if (["success", "settlement", "paid", "Success", "SUCCESS"].includes(responseStatus)) {
              const updatedOldResponse = { ...(oldSub.qrisly_response as any), status: "inactive" };
              await adminDb
                .from("subscriptions")
                .update({ qrisly_response: updatedOldResponse })
                .eq("id", oldSub.id);
            }
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
