import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    console.log("MIDTRANS WEBHOOK HIT");
    const body = await request.json();
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
    } = body;

    // Validate request inputs
    if (!order_id || !status_code || !gross_amount || !signature_key) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    // Verify signature: SHA512(order_id + status_code + gross_amount + server_key)
    const hashPayload = `${order_id}${status_code}${gross_amount}${serverKey}`;
    const computedSignature = crypto
      .createHash("sha512")
      .update(hashPayload)
      .digest("hex");

    if (computedSignature !== signature_key) {
      console.warn("Invalid webhook signature key received:", {
        order_id,
        received: signature_key,
        computed: computedSignature,
      });
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // console.log("=== MIDTRANS SIGNATURE DEBUG ===");
    // console.log("order_id:", order_id);
    // console.log("status_code:", status_code);
    // console.log("gross_amount:", gross_amount);
    // console.log("serverKey:", serverKey.substring(0, 15) + "...");
    // console.log("hashPayload:", hashPayload);
    // console.log("signature_key:", signature_key);
    // console.log("computedSignature:", computedSignature);
    // console.log(
    //   "match:",
    //   computedSignature === signature_key
    // );

    // Process only subscription orders
    if (!order_id.startsWith("SUB_")) {
      return NextResponse.json({ message: "Not a subscription order" });
    }

    const parts = order_id.split("_");
    const userId = parts[1];
    const plan = parts[2];

    if (!userId || !plan) {
      return NextResponse.json({ error: "Invalid order ID format" }, { status: 400 });
    }

    const isSuccess =
      transaction_status === "settlement" ||
      (transaction_status === "capture" && fraud_status === "accept");

    if (isSuccess) {
      const supabase = createAdminClient();

      const startedAt = new Date();
      const endedAt = new Date();
      if (plan === "monthly") {
        endedAt.setDate(endedAt.getDate() + 30);
      } else if (plan === "yearly") {
        endedAt.setDate(endedAt.getDate() + 365);
      }

      // 1. Create subscription record
      const { error: subError } = await supabase.from("subscriptions").insert({
        user_id: userId,
        plan: plan,
        price: parseFloat(gross_amount),
        status: "active",
        started_at: startedAt.toISOString(),
        ended_at: endedAt.toISOString(),
      });

      if (subError) {
        console.error("Error creating subscription record:", subError);
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
      await supabase
        .from("subscriptions")
        .update({ status: "inactive" })
        .eq("user_id", userId)
        .eq("status", "active")
        .not("started_at", "eq", startedAt.toISOString());

      console.log(`Successfully recorded subscription for user ${userId}: ${plan}`);
    } else if (
      transaction_status === "cancel" ||
      transaction_status === "expire" ||
      transaction_status === "deny"
    ) {
      const supabase = createAdminClient();
      // Record payment failure in subscriptions log
      await supabase.from("subscriptions").insert({
        user_id: userId,
        plan: plan,
        price: parseFloat(gross_amount),
        status: transaction_status,
        started_at: new Date().toISOString(),
        ended_at: new Date().toISOString(),
      });
      console.log(`Failed subscription payment for user ${userId}: ${transaction_status}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Midtrans webhook processing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
