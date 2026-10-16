
import { NextResponse } from "next/server";
import { chamarWorker } from "@/lib/cloudflare";

export async function POST(request: Request) {
  let generationId: string | null = null;
  let dispatchIniciado = false;
  try {
    const body = await request.json().catch(() => null);
    const { conteudos, client, code } = body ?? {};

    if (!Array.isArray(conteudos) || conteudos.length === 0) {
      return NextResponse.json(
        { error: "Informe pelo menos um conteúdo." },
        { status: 400 }
      );
    }

    if (typeof code !== "string" || !code.trim()) {
      return NextResponse.json(
        { error: "Informe uma licença válida." },
        { status: 401 }
      );
    }

    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const workflow = process.env.GITHUB_WORKFLOW;
    const ref = process.env.GITHUB_REF || "main";

    if (!token || !owner || !repo || !workflow) {
      return NextResponse.json(
        { error: "Configuração do builder ausente." },
        { status: 500 }
      );
    }

    // 1. Reservar um crédito no Worker.
    const reserva = await chamarWorker("/generations/reserve", {
      code: code.trim(),
    });

    if (
      reserva.status !== 201 ||
      typeof reserva.dados.generation_id !== "string"
    ) {
      return NextResponse.json(
        { error: reserva.dados.error || "Não foi possível reservar um crédito." },
        { status: reserva.status >= 400 ? reserva.status : 502 }
      );
    }

    generationId = reserva.dados.generation_id;

    dispatchIniciado = true;

    // 2. Iniciar o GitHub Actions usando o mesmo ID da reserva.
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflow}/dispatches`,
      {
        method: "POST",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${token}`,
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ref,
          inputs: {
            generation_id: generationId,
            payload: JSON.stringify({
              client: typeof client === "string" ? client.trim() : "",
              data: conteudos,
            }),
          },
        }),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error(
        "Falha ao iniciar workflow:",
        response.status,
        await response.text()
      );

      // O workflow não foi iniciado: devolver a reserva.
      const finalizacao = await chamarWorker("/generations/finish", {
        generation_id: generationId,
        status: "failed",
      });

      if (finalizacao.status >= 500) {
        console.error("Falha ao devolver crédito:", finalizacao.dados);
      }

      return NextResponse.json(
        { error: "Não foi possível iniciar a geração do HTML." },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        generationId,
        message: "Geração iniciada.",
      },
      { status: 202 }
    );
  } catch (error) {
    console.error("Erro ao iniciar geração:", error);

    // Se houve reserva, tentar liberá-la em caso de erro.
    if (generationId && !dispatchIniciado) {
      try {
        await chamarWorker("/generations/finish", {
          generation_id: generationId,
          status: "failed",
        });
      } catch (releaseError) {
        console.error("Erro ao liberar reserva:", releaseError);
      }
    }

    return NextResponse.json(
      { error: "Erro ao iniciar a geração do aplicativo." },
      { status: 500 }
    );
  }
}
