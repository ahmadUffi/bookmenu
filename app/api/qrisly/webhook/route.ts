import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    console.log("QRISLY WEBHOOK HIT");
    const body = await request.json();
    console.log("Webhook body:", body);

    // QRISly webhook payload structure (RajaOngkir QRISly):
    // {
    //   "event": "payment.expired" | "payment.paid",
    //   "timestamp": "1781104398",
    //   "data": {
    //     "history_id": 2953,
    //     "qris_id": 261,
    //     "amount": 99008,
    //     "status": "expired" | "paid" | "pending",
    //     "created_at": "2025-01-14T10:30:00Z",
    //     "expired_at": "2025-01-15T23:59:59Z"
    //   }
    // }

    const event = body.event;
    const eventData = body.data || {};
    const historyId = eventData.history_id;
    const amount = eventData.amount; // This is the final unique amount (e.g. 9003)
    const payment_status = eventData.status;

    if (!historyId || !payment_status || amount === undefined) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Look up all subscriptions for this unique amount
    const { data: amountSubs } = await supabase
      .from("subscriptions")
      .select("id, user_id, plan, qrisly_response, ended_at")
      .eq("price", amount);

    // Find the one matching history_id
    let targetSub = (amountSubs ?? []).find(sub => {
      const subHistoryId = typeof sub.qrisly_response === 'object' && sub.qrisly_response !== null
        ? String((sub.qrisly_response as any).history_id)
        : null;
      return subHistoryId === String(historyId);
    });

    // Fallback: find any pending one for this amount
    if (!targetSub) {
      targetSub = (amountSubs ?? []).find(sub => {
        if (sub.ended_at !== null) return false;
        const responseStatus = typeof sub.qrisly_response === 'object' && sub.qrisly_response !== null
          ? (sub.qrisly_response as any).status
          : null;
        return responseStatus === "pending" || !responseStatus;
      });
    }

    if (!targetSub) {
      console.log(`No pending subscription found for amount: ${amount} and historyId: ${historyId}`);
      return NextResponse.json({ success: true, message: "No pending subscription found" });
    }

    const { user_id: userId, plan, id: subId } = targetSub;

    const isSuccess = String(payment_status).toLowerCase() === "paid";

    if (isSuccess) {
      // Determine if targetSub is already activated
      const isTargetAlreadyActivated = targetSub.ended_at !== null && (() => {
        const responseStatus = typeof targetSub.qrisly_response === 'object' && targetSub.qrisly_response !== null
          ? String((targetSub.qrisly_response as any).status).toLowerCase()
          : null;
        return responseStatus === "paid";
      })();

      if (!isTargetAlreadyActivated) {
        // Calculate startedAt and endedAt based on maximum ended_at of existing active plans
        const nowStr = new Date().toISOString();
        const { data: existingActiveSubs } = await supabase
          .from("subscriptions")
          .select("ended_at, price, qrisly_response")
          .eq("user_id", userId)
          .gt("ended_at", nowStr);

        const validActiveSubs = (existingActiveSubs ?? []).filter(sub => {
          if (sub.price === 0) return true; // promo
          const responseStatus = typeof sub.qrisly_response === 'object' && sub.qrisly_response !== null
            ? String((sub.qrisly_response as any).status).toLowerCase()
            : null;
          return responseStatus === "paid";
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

        const updatedResponse = typeof targetSub.qrisly_response === 'object' && targetSub.qrisly_response !== null
          ? { ...(targetSub.qrisly_response as any), status: payment_status }
          : { status: payment_status };

        // 1. Update the pending subscription record to active
        const { error: subError } = await supabase
          .from("subscriptions")
          .update({
            qrisly_response: updatedResponse,
            started_at: finalStartedAt.toISOString(),
            ended_at: finalEndedAt.toISOString(),
          })
          .eq("id", subId);

        if (subError) {
          console.error("Error activating subscription record:", subError);
          return NextResponse.json(
            { error: "Failed to record subscription" },
            { status: 500 },
          );
        }

        // 2. Initialize or reset usage tracking limits
        const { data: existingUsage, error: checkUsageError } = await supabase
          .from("subscription_usages")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle();

        if (checkUsageError) {
          console.error("Error checking subscription usage:", checkUsageError);
        }

        if (existingUsage) {
          await supabase
            .from("subscription_usages")
            .update({
              pdf_upload: 0,
              qr_scan: 0,
            })
            .eq("user_id", userId);
        } else {
          await supabase.from("subscription_usages").insert({
            user_id: userId,
            pdf_upload: 0,
            qr_scan: 0,
          });
        }

        console.log(`Successfully activated subscription for user ${userId}: ${plan}`);
      } else {
        console.log(`Subscription already exists for user ${userId}: ${plan}`);
      }
    } else if (String(payment_status).toLowerCase() === "expired") {
      const updatedResponse = typeof targetSub.qrisly_response === 'object' && targetSub.qrisly_response !== null
        ? { ...(targetSub.qrisly_response as any), status: payment_status.toLowerCase() }
        : { status: payment_status.toLowerCase() };

      // Update pending subscription record to failed/expired/etc.
      await supabase
        .from("subscriptions")
        .update({
          qrisly_response: updatedResponse,
          ended_at: new Date().toISOString(),
        })
        .eq("id", subId);
      console.log(`Failed subscription payment for user ${userId}: ${payment_status}`);
    }

    return NextResponse.json({ success: true, message: "Webhook received and processed" });
  } catch (error) {
    console.error("QRISly webhook processing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
