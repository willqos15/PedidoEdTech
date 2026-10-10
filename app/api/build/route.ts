
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { conteudos } = body;

    if (!Array.isArray(conteudos) || conteudos.length === 0) {
      return NextResponse.json(
        { error: "Informe pelo menos um conteúdo." },
        { status: 400 }
      );
    }

    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const workflow = process.env.GITHUB_WORKFLOW;
    const ref = process.env.GITHUB_REF || "main";

    if (!token || !owner || !repo || !workflow) {
      console.error("Configuração do GitHub incompleta.");

      return NextResponse.json(
        { error: "Configuração do builder ausente." },
        { status: 500 }
      );
    }

    const generationId = crypto.randomUUID();

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
            payload: JSON.stringify(conteudos),
          },
        }),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const details = await response.text();

      console.error("Falha ao iniciar workflow:", response.status, details);

      return NextResponse.json(
        { error: "Não foi possível iniciar a geração do HTML." },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        generationId,
        message: "Geração iniciada. O HTML será processado pelo GitHub Actions.",
      },
      { status: 202 }
    );
  } catch (error) {
    console.error("Erro ao iniciar a geração:", error);

    return NextResponse.json(
      { error: "Erro ao comunicar com o GitHub." },
      { status: 500 }
    );
  }
}
