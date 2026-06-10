import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
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

    const body = await request.json();
    const { plan } = body;

    if (plan !== "monthly" && plan !== "yearly") {
      return NextResponse.json({ error: "Invalid plan type" }, { status: 400 });
    }

    const adminDb = createAdminClient();

    // Check if the user is a new customer (no records in subscriptions table)
    const { count, error: countError } = await adminDb
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (countError) {
      console.error("Error checking subscription count:", countError);
    }

    const isNewUser = !count;

    // Promo for new users: free first monthly plan
    if (plan === "monthly" && isNewUser) {
      const startedAt = new Date();
      const endedAt = new Date();
      endedAt.setDate(endedAt.getDate() + 30); // 30 Days active period

      const { error: insertError } = await adminDb.from("subscriptions").insert({
        user_id: user.id,
        plan: "monthly",
        price: 0,
        qrisly_response: { status: "success" },
        started_at: startedAt.toISOString(),
        ended_at: endedAt.toISOString(),
      });

      if (insertError) {
        console.error("Error creating free monthly subscription:", insertError);
        return NextResponse.json({ error: "Failed to activate promo plan" }, { status: 500 });
      }

      // Initialize/reset usage limits
      const { data: existingUsage } = await adminDb
        .from("subscription_usages")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingUsage) {
        await adminDb
          .from("subscription_usages")
          .update({ pdf_upload: 0, qr_scan: 0 })
          .eq("user_id", user.id);
      } else {
        await adminDb.from("subscription_usages").insert({
          user_id: user.id,
          pdf_upload: 0,
          qr_scan: 0,
        });
      }

      return NextResponse.json({
        success: true,
        activated_free: true,
        message: "Promo Monthly Plan activated successfully for free!"
      });
    }

    const price = plan === "monthly" ? 9000 : 99000;

    // Convert UUID to base64url to stay within character limits
    const hex = user.id.replace(/-/g, "");
    const base64Uuid = Buffer.from(hex, "hex").toString("base64url");
    const timestampSuffix = Date.now().toString(36).slice(-6);
    const orderId = `SUB_${base64Uuid}_${plan}_${timestampSuffix}`;

    const apiKey = process.env.QRISLY_API_KEY || "";
    const baseUrl = process.env.QRISLY_BASE_URL || "https://api-sandbox.collaborator.komerce.id/user/api/v1/qrisly";

    // If API Key is not set or is mock/development, return a mock QRIS response for simulation
    if (!apiKey || apiKey === "mock-qrisly-api-key-12345" || apiKey.startsWith("mock-")) {
      console.log("Using Mock QRISly Integration (Development Mode)");
      const mockQrContent = `000201010212430038000000000000000000000000000000000052045999530336054${price}5802ID5918BookMenu Payment6009Yogyakarta61055512362070703A016304abcd`;
      const mockQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(mockQrContent)}`;
      const mockHistoryId = `mock_hist_${Date.now()}`;

      // Insert pending subscription record even in mock mode for consistency
      await adminDb.from("subscriptions").insert({
        user_id: user.id,
        plan: plan,
        price: price,
        qrisly_response: {
          status: "pending",
          qr_url: mockQrUrl,
          qr_content: mockQrContent,
          history_id: mockHistoryId,
          order_id: orderId,
          amount: price,
          is_mock: true
        },
        started_at: new Date().toISOString(),
        ended_at: null,
      });

      return NextResponse.json({
        qr_url: mockQrUrl,
        qr_content: mockQrContent,
        history_id: mockHistoryId,
        order_id: orderId,
        amount: price,
        is_mock: true
      });
    }

    // Call actual QRISly endpoint
    // Endpoint: POST {baseUrl}/generate-qris
    const qrislyUrl = `${baseUrl.replace(/\/$/, "")}/generate-qris`;

    const qrisIdVal = process.env.QRISLY_QRIS_ID || "261";
    const qrisId = /^\d+$/.test(qrisIdVal) ? parseInt(qrisIdVal, 10) : qrisIdVal;

    const payload = {
      qris_id: qrisId,
      amount: price,
      output_type: "string",
      unique_amount: true
    };

    const response = await fetch(qrislyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-API-Key": apiKey
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("QRISly API error response:", errorText);
      return NextResponse.json(
        { error: "QRISly API request failed" },
        { status: 502 }
      );
    }

    const result = await response.json();
    const data = result.data || result;

    const qrContent = data.qris_string || data.qr_content || "";
    const qrUrl = data.qr_url || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrContent)}`;
    const finalAmount = Number(data.final_amount || data.amount || price);
    const historyId = String(data.history_id || data.id || `hist_${Date.now()}`);

    // Insert pending subscription record so that webhook and/or manual status check can find it
    await adminDb.from("subscriptions").insert({
      user_id: user.id,
      plan: plan,
      price: finalAmount,
      qrisly_response: {
        status: "pending",
        qr_url: qrUrl,
        qr_content: qrContent,
        history_id: historyId,
        order_id: orderId,
        amount: finalAmount
      },
      started_at: new Date().toISOString(),
      ended_at: null,
    });

    return NextResponse.json({
      qr_url: qrUrl,
      qr_content: qrContent,
      history_id: historyId,
      order_id: orderId,
      amount: finalAmount
    });
  } catch (error) {
    console.error("QRISly token generation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
