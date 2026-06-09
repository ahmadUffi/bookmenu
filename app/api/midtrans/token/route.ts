import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    const price = plan === "monthly" ? 9000 : 99000;

    // Convert UUID to base64url to stay within Midtrans' 50-character limit
    const hex = user.id.replace(/-/g, "");
    const base64Uuid = Buffer.from(hex, "hex").toString("base64url");
    // Generate a unique 6-character timestamp suffix in base36
    const timestampSuffix = Date.now().toString(36).slice(-6);
    const orderId = `SUB_${base64Uuid}_${plan}_${timestampSuffix}`;

    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    const snapUrl = process.env.MIDTRANS_SNAP_URL || "";
    const isSandbox = snapUrl.includes("sandbox.midtrans.com");
    const midtransApiUrl = `${
      isSandbox ? "https://app.sandbox.midtrans.com" : "https://app.midtrans.com"
    }/snap/v1/transactions`;

    const authHeader = Buffer.from(`${serverKey}:`).toString("base64");

    const payload = {
      transaction_details: {
        order_id: orderId,
        gross_amount: price,
      },
      customer_details: {
        first_name: user.email?.split("@")[0] || "User",
        email: user.email,
      },
      enabled_payments: [
        "credit_card",
        "gopay",
        "shopeepay",
        "qris",
        "bank_transfer",
      ],
    };

    const midtransResponse = await fetch(midtransApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Basic ${authHeader}`,
      },
      body: JSON.stringify(payload),
    });

    if (!midtransResponse.ok) {
      const errorText = await midtransResponse.text();
      console.error("Midtrans API error response:", errorText);
      return NextResponse.json(
        { error: "Midtrans Snap API request failed" },
        { status: 502 },
      );
    }

    const snapResult = await midtransResponse.json();

    return NextResponse.json({
      token: snapResult.token,
      redirect_url: snapResult.redirect_url,
    });
  } catch (error) {
    console.error("Midtrans token generation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
