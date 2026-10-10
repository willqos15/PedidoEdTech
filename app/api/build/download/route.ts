
import { NextResponse } from "next/server";
import JSZip from "jszip";



export async function GET(request: Request) {
  const generationId = new URL(request.url).searchParams.get("generationId");

  if (!generationId || !/^[0-9a-f-]{36}$/i.test(generationId)) {
    return NextResponse.json(
      { error: "ID de geração inválido." },
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

  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };

  try {
    // Localiza a execução correspondente à geração.
    const runsResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflow}/runs?per_page=100`,
      { headers, cache: "no-store" }
    );

    if (!runsResponse.ok) {
      return NextResponse.json(
        { error: "Não foi possível consultar as execuções." },
        { status: 502 }
      );
    }

    const runsData = await runsResponse.json();

    const run = runsData.workflow_runs.find(
      (item: { display_title: string; status: string; conclusion: string | null }) =>
        item.display_title === `Build HTML ${generationId}` &&
        item.status === "completed" &&
        item.conclusion === "success"
    );

    if (!run) {
      return NextResponse.json(
        { error: "Geração concluída com sucesso não encontrada." },
        { status: 404 }
      );
    }

    // Localiza o artefato dessa execução.
    const artifactsResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/actions/runs/${run.id}/artifacts`,
      { headers, cache: "no-store" }
    );

    if (!artifactsResponse.ok) {
      return NextResponse.json(
        { error: "Não foi possível localizar o artefato." },
        { status: 502 }
      );
    }

    const artifactsData = await artifactsResponse.json();
    const artifact = artifactsData.artifacts.find(
      (item: { name: string; expired: boolean }) =>
        item.name === `html-${generationId}` && !item.expired
    );

    if (!artifact) {
      return NextResponse.json(
        { error: "Artefato não encontrado ou expirado." },
        { status: 404 }
      );
    }

    // Baixa o ZIP usando o token protegido no servidor.
    const zipResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/actions/artifacts/${artifact.id}/zip`,
      { headers, cache: "no-store" }
    );

    if (!zipResponse.ok) {
      return NextResponse.json(
        { error: "Não foi possível baixar o artefato." },
        { status: 502 }
      );
    }

    const zipBuffer = await zipResponse.arrayBuffer();
    const zip = await JSZip.loadAsync(zipBuffer);

    // O workflow deve gerar exatamente um HTML.
    const htmlFiles = Object.values(zip.files).filter(
      (file) => !file.dir && file.name.endsWith(".html")
    );

    if (htmlFiles.length !== 1) {
      return NextResponse.json(
        { error: "O artefato não contém exatamente um arquivo HTML." },
        { status: 500 }
      );
    }

    const htmlBuffer = await htmlFiles[0].async("arraybuffer");
const html = new Uint8Array(htmlBuffer);

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="conteudo-${generationId}.html"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Erro no download:", error);

    return NextResponse.json(
      { error: "Erro ao preparar o download do HTML." },
      { status: 500 }
    );
  }
}
