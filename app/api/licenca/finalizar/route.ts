
import { NextResponse } from "next/server";
import { chamarWorker } from "@/lib/cloudflare";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    if (
      !body ||
      typeof body.generation_id !== "string" ||
      !["success", "failed"].includes(body.status)
    ) {
      return NextResponse.json(
        { error: "Dados de finalização inválidos." },
        { status: 400 }
      );
    }

    const resultado = await chamarWorker("/generations/finish", {
      generation_id: body.generation_id,
      status: body.status,
    });

    return NextResponse.json(resultado.dados, {
      status: resultado.status,
    });
  } catch (error) {
    console.error("Erro ao finalizar geração:", error);

    return NextResponse.json(
      { error: "Não foi possível finalizar a geração." },
      { status: 502 }
    );
  }
}
