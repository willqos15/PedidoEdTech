
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
  client: string;
  codigoLicenca: string;
  onSaldoAtualizado: (disponiveis: number, total: number) => void;
  disabled: boolean;
  palavrasUsadas: number;
  limite: number;
}



export default function BtnGerarApp({
  conteudos,
  client,
  codigoLicenca,
  onSaldoAtualizado,
  disabled,
  palavrasUsadas,
  limite
}: GerarAplicativoProps) {

  const [carregando, setCarregando] = useState(false);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);




  const saveFile = async () => {
    if (!downloadUrl) return;

    try {
      const response = await fetch(downloadUrl);

      if (!response.ok) {
        throw new Error("Não foi possível baixar o arquivo.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      const nomeCliente = client
        .trim()
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
        .replace(/[. ]+$/g, "");

      link.download = `EdTech ${nomeCliente || "Aplicativo"}.html`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => URL.revokeObjectURL(url), 1000);

      setMensagem("Download iniciado!");
    } catch (error) {
      setMensagem(
        error instanceof Error
          ? error.message
          : "Erro ao baixar o arquivo."
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
        body: JSON.stringify({
          client: client.trim(),
          conteudos,
          code: codigoLicenca,
        }),
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
            const url = `/api/build/download?generationId=${encodeURIComponent(id)}`;

            setDownloadUrl(url);

            const saldo = statusData.saldo;

            if (
              saldo &&
              typeof saldo.available === "number" &&
              typeof saldo.max_generations === "number"
            ) {
              onSaldoAtualizado(
                saldo.available,
                saldo.max_generations
              );

              setMensagem(
                saldo.available === 0
                  ? "Arquivo gerado com sucesso! Você utilizou todas as gerações disponíveis."
                  : "Arquivo gerado com sucesso!"
              );
            } else {
              setMensagem(
                "Arquivo gerado com sucesso, mas não foi possível confirmar o saldo."
              );
            }
          } else {
            setMensagem("A geração do arquivo falhou.");
          }

          return;

        }

        setMensagem(
          statusData.status === "queued"
            ? "Preparando..."
            : "Gerando arquivo... Isso pode levar alguns minutos."
        );
      }

      setMensagem(
        "A geração ainda está em andamento."
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
        disabled={carregando || disabled}
        className="rounded-lg w-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {carregando ? "Iniciando geração..." : "Gerar aplicativo"}
      </button>


      {/* {generationId && (
        <p className="break-all text-center text-xs text-zinc-500">
          ID da geração: {generationId}
        </p>
      )} */}

      {/* {downloadUrl && (
  <a
    href={`https://wa.me/5593991878598?text=${encodeURIComponent(
    `Olá, sou ${client}! Meu aplicativo EdTechPalavras foi gerado. Gostaria de receber o arquivo.`
    )}`}
    target="_blank"
    rel="noopener noreferrer"
    className="w-full rounded-lg bg-green-600 px-5 py-2.5 text-center text-sm font-medium text-white transition hover:bg-green-700"
  >
    Solicitar arquivo
  </a>
)} */}

      {palavrasUsadas > limite && (
        <p role="status" className="text-center text-sm text-red-900">
          Você atingiu o limite de palavras. Apague algumas para poder gerar o arquivo.
        </p>
      )}


      {client.length==0 && (
        <p role="status" className="text-center text-sm text-red-900">
          Insira o seu nome
        </p>
      )}

      {mensagem && (
        <p role="status" className="text-center text-sm text-zinc-600">
          {mensagem}
        </p>
      )}



      {downloadUrl && (
        <button
          type="button"
          onClick={saveFile}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-green-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-green-700 hover:shadow-lg hover:shadow-green-700/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 active:translate-y-0"
        >

          Salvar Arquivo
        </button>
      )}





    </div>
  );
}
