
import { NextResponse } from "next/server";
import { chamarWorker } from "@/lib/cloudflare";

export async function GET(request: Request) {
  const generationId = new URL(request.url).searchParams.get(
    "generationId"
  );

  if (!generationId) {
    return NextResponse.json(
      { error: "generationId é obrigatório." },
      { status: 400 }
    );
  }

  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const workflow = process.env.GITHUB_WORKFLOW;

  if (!token || !owner || !repo || !workflow) {
    return NextResponse.json(
      { error: "Configuração do GitHub incompleta." },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflow}/runs?per_page=100`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${token}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Não foi possível consultar o GitHub Actions." },
        { status: 502 }
      );
    }

    const data = await response.json();

    const run = data.workflow_runs.find(
      (item: {
        display_title: string;
        status: string;
        conclusion: string | null;
        html_url: string;
        id: number;
      }) => item.display_title === `Build HTML ${generationId}`
    );

    if (!run) {
      return NextResponse.json({
        status: "queued",
        conclusion: null,
        message: "Aguardando o início da execução.",
      });
    }


    let saldoAtualizado: {
  available: number;
  max_generations: number;
  used_generations: number;
  reserved_generations: number;
} | null = null;

    // 1. Traduzir o resultado do GitHub para o Worker.
    if (run.status === "completed") {
  const finalStatus =
    run.conclusion === "success" ? "success" : "failed";

  const finalizacao = await chamarWorker("/generations/finish", {
    generation_id: generationId,
    status: finalStatus,
  });

  if (
    finalizacao.status >= 400 ||
    typeof finalizacao.dados.available !== "number" ||
    typeof finalizacao.dados.max_generations !== "number"
  ) {
    console.error("Falha ao finalizar geração:", finalizacao.dados);

    return NextResponse.json(
      {
        error: "Build concluído, mas não foi possível confirmar o saldo.",
      },
      { status: 502 }
    );
  }

  saldoAtualizado = {
    available: finalizacao.dados.available,
    max_generations: finalizacao.dados.max_generations,
    used_generations: finalizacao.dados.used_generations,
    reserved_generations: finalizacao.dados.reserved_generations,
  };
}

    return NextResponse.json({
      status: run.status,
      conclusion: run.conclusion,
      htmlUrl: run.html_url,
      runId: run.id,
      saldo: saldoAtualizado,
      message:
        run.status === "completed"
          ? run.conclusion === "success"
            ? "HTML gerado com sucesso."
            : "A geração do HTML falhou."
          : "O HTML está sendo gerado.",
    });
  } catch (error) {
    console.error("Erro ao consultar status:", error);

    return NextResponse.json(
      { error: "Erro ao consultar o status da geração." },
      { status: 500 }
    );
  }
}
