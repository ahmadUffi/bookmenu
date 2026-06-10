import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    console.log("QRISLY WEBHOOK HIT");
    const body = await request.json();
    console.log("Webhook body:", body);

    // QRISly webhook payload structure:
    // {
    //   "event": "payment.success",
    //   "timestamp": "2025-01-14T10:35:22Z",
    //   "data": {
    //     "history_id": "8c5b8e8d-7b22-3e31-7a0e-0d5a2d1d6c09",
    //     "qris_id": "9d6c9f9e-8c33-4f42-8b1f-0e6a3e2e7d10",
    //     "amount": 100001,
    //     "original_amount": 100000,
    //     "status": "paid",
    //     ...
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

    // Look up the pending subscription by the unique amount
    const { data: amountSubs } = await supabase
      .from("subscriptions")
      .select("id, user_id, plan, qrisly_response")
      .eq("price", amount)
      .is("ended_at", null)
      .order("created_at", { ascending: false });

    const pendingSub = (amountSubs ?? []).find(sub => {
      const responseStatus = typeof sub.qrisly_response === 'object' && sub.qrisly_response !== null
        ? (sub.qrisly_response as any).status
        : null;
      return responseStatus === "pending" || !responseStatus;
    });

    if (!pendingSub) {
      console.log(`No pending subscription found for amount: ${amount}`);
      return NextResponse.json({ success: true, message: "No pending subscription found" });
    }

    const { user_id: userId, plan, id: subId } = pendingSub;

    const isSuccess =
      payment_status === "success" ||
      payment_status === "settlement" ||
      payment_status === "paid" ||
      payment_status === "Success" ||
      payment_status === "SUCCESS";

    if (isSuccess) {
      const startedAt = new Date();
      const endedAt = new Date();
      if (plan === "monthly") {
        endedAt.setDate(endedAt.getDate() + 30);
      } else if (plan === "yearly") {
        endedAt.setDate(endedAt.getDate() + 365);
      }

      // Check if subscription already exists to avoid duplication
      const { data: activeSubs } = await supabase
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
        const updatedResponse = typeof pendingSub.qrisly_response === 'object' && pendingSub.qrisly_response !== null
          ? { ...(pendingSub.qrisly_response as any), status: payment_status }
          : { status: payment_status };

        // 1. Update the pending subscription record to active
        const { error: subError } = await supabase
          .from("subscriptions")
          .update({
            qrisly_response: updatedResponse,
            started_at: startedAt.toISOString(),
            ended_at: endedAt.toISOString(),
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

        // Mark other subscriptions as canceled/inactive if they exist
        const { data: activeSubsToDeactivate } = await supabase
          .from("subscriptions")
          .select("id, qrisly_response")
          .eq("user_id", userId)
          .not("id", "eq", subId);

        for (const oldSub of (activeSubsToDeactivate ?? [])) {
          const responseStatus = typeof oldSub.qrisly_response === 'object' && oldSub.qrisly_response !== null
            ? (oldSub.qrisly_response as any).status
            : null;
          if (["success", "settlement", "paid", "Success", "SUCCESS"].includes(responseStatus)) {
            const updatedOldResponse = { ...(oldSub.qrisly_response as any), status: "inactive" };
            await supabase
              .from("subscriptions")
              .update({ qrisly_response: updatedOldResponse })
              .eq("id", oldSub.id);
          }
        }

        console.log(`Successfully activated subscription for user ${userId}: ${plan}`);
      } else {
        console.log(`Subscription already exists for user ${userId}: ${plan}`);
      }
    } else if (
      payment_status === "cancel" ||
      payment_status === "expire" ||
      payment_status === "deny" ||
      payment_status === "failed" ||
      payment_status === "FAILED" ||
      payment_status === "expired" ||
      payment_status === "cancelled"
    ) {
      const updatedResponse = typeof pendingSub.qrisly_response === 'object' && pendingSub.qrisly_response !== null
        ? { ...(pendingSub.qrisly_response as any), status: payment_status.toLowerCase() }
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
