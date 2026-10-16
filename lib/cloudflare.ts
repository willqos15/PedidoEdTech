
const WORKER_URL = process.env.CLOUDFLARE_WORKER_URL;
const API_SECRET = process.env.NEXT_API_SECRET;

export async function chamarWorker(
  rota: string,
  dados: Record<string, unknown>
) {
  if (!WORKER_URL || !API_SECRET) {
    throw new Error("Configuração do Worker ausente.");
  }

  const resposta = await fetch(
    `${WORKER_URL.replace(/\/+$/, "")}${rota}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-secret": API_SECRET,
      },
      body: JSON.stringify(dados),
      cache: "no-store",
    }
  );

  const resultado = await resposta.json().catch(() => ({
    error: "Resposta inválida do serviço de licenças.",
  }));

  return {
    status: resposta.status,
    dados: resultado,
  };
}
