
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const workerUrl = process.env.CLOUDFLARE_WORKER_URL;
    const secret = process.env.NEXT_API_SECRET;

    if (!workerUrl || !secret) {
      return NextResponse.json(
        { error: "Configuração ausente." },
        { status: 500 }
      );
    }

    const data = await request.json();

    if (
      typeof data.external_reference !== "string" ||
      !/^[0-9a-f-]{36}$/i.test(data.external_reference)
    ) {
      return NextResponse.json(
        { error: "Referência inválida." },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${workerUrl}/payments/status`,
      {
        method: "POST",
        headers: {
  "Content-Type": "application/json",
  "x-api-secret": secret,
},
        body: JSON.stringify({
          external_reference: data.external_reference,
        }),
        cache: "no-store",
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: result.error || "Erro ao consultar compra." },
        { status: response.status }
      );
    }

    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      { error: "Erro ao consultar o pagamento." },
      { status: 500 }
    );
  }
}
