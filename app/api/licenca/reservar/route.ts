
import { NextResponse } from "next/server";
import { chamarWorker } from "@/lib/cloudflare";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body.code !== "string" || !body.code.trim()) {
      return NextResponse.json(
        { error: "Informe o código da licença." },
        { status: 400 }
      );
    }

    const resultado = await chamarWorker("/generations/reserve", {
      code: body.code.trim(),
    });

    return NextResponse.json(resultado.dados, {
      status: resultado.status,
    });
  } catch (error) {
    console.error("Erro ao reservar geração:", error);

    return NextResponse.json(
      { error: "Não foi possível reservar a geração." },
      { status: 502 }
    );
  }
}
