
"use client";

import { useState } from "react";

interface Frase {
  palavra: string;
  dica: string;
  imagem?: string;
  tema?: string;
  nomeImagem?: string;
}

interface Conteudo {
  titulo: string;
  frases: Frase[];
}

interface GerarAplicativoProps {
  conteudos: Conteudo[];
}

export default function BtnGerarApp({
  conteudos,
}: GerarAplicativoProps) {
  const [carregando, setCarregando] = useState(false);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);


  
const saveFile = async () => {
  if (!downloadUrl) return;

  try {
    const showSaveFilePicker = (
      window as Window & {
        showSaveFilePicker?: (options: {
          suggestedName: string;
          types: {
            description: string;
            accept: Record<string, string[]>;
          }[];
        }) => Promise<{
          createWritable: () => Promise<{
            write: (data: Blob) => Promise<void>;
            close: () => Promise<void>;
          }>;
        }>;
      }
    ).showSaveFilePicker;

    // Abrir "Salvar como" diretamente no clique, antes do fetch.
    const handlePromise = showSaveFilePicker
      ? showSaveFilePicker({
          suggestedName: "EdTech.html",
          types: [
            {
              description: "Arquivo HTML",
              accept: { "text/html": [".html"] },
            },
          ],
        })
      : null;

    const response = await fetch(downloadUrl);

    if (!response.ok) {
      throw new Error("Não foi possível baixar o HTML.");
    }

    const blob = await response.blob();

    if (handlePromise) {
      const handle = await handlePromise;
      const writable = await handle.createWritable();

      await writable.write(blob);
      await writable.close();

      setMensagem("Arquivo salvo com sucesso!");
    } else {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "EdTech.html";
      link.click();

      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMensagem("Download iniciado!");
    }
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") return;

    setMensagem(
      error instanceof Error
        ? error.message
        : "Erro ao salvar o HTML."
    );
  }
};



  async function gerarAplicativo() {
    if (carregando) return;

    setCarregando(true);
    setGenerationId(null);
    setMensagem("Iniciando geração...");

    try {
      const response = await fetch("/api/build", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ conteudos }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao iniciar a geração.");
      }

      const id = data.generationId as string;
      setGenerationId(id);

      const limite = Date.now() + 10 * 60 * 1000;

      while (Date.now() < limite) {
        await new Promise((resolve) => setTimeout(resolve, 5000));

        const statusResponse = await fetch(
          `/api/build/status?generationId=${encodeURIComponent(id)}`,
          { cache: "no-store" }
        );

        const statusData = await statusResponse.json();
        console.log("Status da geração:", statusData);

        if (!statusResponse.ok) {
          throw new Error(
            statusData.error || "Erro ao consultar a geração."
          );
        }

        if (
          statusData.status === "completed"
        ) {
          if (statusData.conclusion === "success") {
            setMensagem("HTML gerado com sucesso!");

            const url = `/api/build/download?generationId=${encodeURIComponent(id)}`;

            console.log("URL de download:", url);
            setDownloadUrl(url);
          } else {
            setMensagem("O build falhou. Consulte os logs do GitHub Actions.");
          }

          return;
        }

        setMensagem(
          statusData.status === "queued"
            ? "Aguardando o início do build..."
            : "Gerando HTML... Isso pode levar alguns minutos."
        );
      }

      setMensagem(
        "A geração ainda está em andamento. Consulte o GitHub Actions para acompanhar."
      );
    } catch (error) {
      setMensagem(
        error instanceof Error
          ? error.message
          : "Erro ao gerar aplicativo."
      );
    } finally {
      setCarregando(false);
    }
  }


  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={gerarAplicativo}
        disabled={carregando}
        className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {carregando ? "Iniciando geração..." : "Gerar aplicativo"}
      </button>

      {mensagem && (
        <p role="status" className="text-center text-sm text-zinc-600">
          {mensagem}
        </p>
      )}

      {generationId && (
        <p className="break-all text-center text-xs text-zinc-500">
          ID da geração: {generationId}
        </p>
      )}

      {downloadUrl && (

        

  <button
    type="button"
    onClick={saveFile}
    className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-green-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-green-700 hover:shadow-lg hover:shadow-green-700/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 active:translate-y-0"
  >

    Salvar HTML
  </button>
)}





    </div>
  );
}
