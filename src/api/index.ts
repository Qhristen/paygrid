import { NextRequest, NextResponse } from "next/server";
import { PayGrid } from "../core/paygrid";
import { TokenSymbol } from "../types";

export function createApiHandler(paygrid: PayGrid) {
  return async function handler(req: NextRequest) {
    const { pathname } = new URL(req.url);
    const pathParts = pathname.split("/").filter(Boolean);
    const resource = pathParts[2]; // /api/paygrid/[resource]
    const id = pathParts[3];

    // Auth check
    const apiKey = req.headers.get("x-api-key");
    const isValid = apiKey ? await paygrid.validateApiKey(apiKey) : false;

    if (!isValid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      if (resource === "payment-intents") {
        if (req.method === "POST") {
          const body = await req.json();
          const intent = await paygrid.createPaymentIntent(body);
          return NextResponse.json(intent);
        }

        if (req.method === "GET" && id) {
          const intent = await paygrid.getPayment(id);
          if (!intent)
            return NextResponse.json({ error: "Not Found" }, { status: 404 });
          return NextResponse.json(intent);
        }
      }

      if (resource === "payments") {
        if (req.method === "GET") {
          const payments = await paygrid.getPayments();
          return NextResponse.json(payments);
        }
      }

      if (resource === "analytics") {
        if (req.method === "GET") {
          const { searchParams } = new URL(req.url);
          const days = parseInt(searchParams.get("days") || "30", 10);
          const stats = await paygrid.getAnalytics(days);
          return NextResponse.json(stats);
        }
      }

      if (resource === "api-keys") {
        if (req.method === "POST") {
          const { name } = await req.json();
          const result = await paygrid.createApiKey(name);
          return NextResponse.json(result);
        }

        if (req.method === "GET") {
          const keys = await paygrid.listApiKeys();
          return NextResponse.json(keys);
        }

        if (req.method === "DELETE" && id) {
          await paygrid.deleteApiKey(id);
          return NextResponse.json({ success: true });
        }
      }

      if (resource === "privacy-withdraw") {
        if (req.method === "POST") {
          const body = await req.json();
          const { tokenSymbol, recipient } = body as {
            tokenSymbol: string;
            amount: number;
            recipient: string;
          };
          if (!tokenSymbol || !recipient) {
            return NextResponse.json(
              { error: "Missing parameters" },
              { status: 400 },
            );
          }

          const result = await paygrid.withdrawFromPrivacy({
            tokenSymbol: tokenSymbol as TokenSymbol,
            recipient,
          });
          return NextResponse.json(result);
        }
      }

      
      if (resource === "privacy-transfer") {
        if (req.method === "POST") {
          const body = await req.json();
          const { tokenSymbol, amount, sender } = body as {
            tokenSymbol: string;
            amount: number;
            recipient: string;
            sender: string;
          };

          if (!tokenSymbol) {
            return NextResponse.json(
              { error: "Missing parameters" },
              { status: 400 },
            );
          }

          const result = await paygrid.transferFromPrivacy({
            tokenSymbol: tokenSymbol as TokenSymbol,
            amount,
            sender,
          });
          return NextResponse.json(result);
        }
      }

      return NextResponse.json(
        { error: "Method Not Allowed" },
        { status: 405 },
      );
    } catch (error: any) {
      console.error("API Error Details:", {
        message: error.message,
        stack: error.stack,
        resource,
        method: req.method,
      });
      return NextResponse.json(
        { error: error.message || "Internal Server Error" },
        { status: 500 },
      );
    }
  };
}
