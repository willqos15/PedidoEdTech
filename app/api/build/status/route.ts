
import { NextResponse } from "next/server";

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
      `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflow}/runs?per_page=20`,
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
      console.error("Erro ao consultar workflow:", response.status);

      return NextResponse.json(
        { error: "Não foi possível consultar o GitHub Actions." },
        { status: 502 }
      );
    }

    const data = await response.json();

    console.log(
  "Execuções encontradas:",
  data.workflow_runs.map(
    (item: { display_title: string; status: string }) => ({
      title: item.display_title,
      status: item.status,
    })
  )
);

    const run = data.workflow_runs.find(
  (item: { display_title: string }) =>
    item.display_title === `Build HTML ${generationId}`
);

    if (!run) {
      return NextResponse.json({
        status: "queued",
        conclusion: null,
        message: "Aguardando o início da execução.",
      });
    }

    

    return NextResponse.json({
      status: run.status,
      conclusion: run.conclusion,
      htmlUrl: run.html_url,
      runId: run.id,
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
