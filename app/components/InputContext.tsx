"use client";

import { useState } from "react";

interface InputContextProps {
  setResultado: (resultado: string) => void;
  resultado: string;
}

export default function InputContext({
  setResultado,
  resultado,
}: InputContextProps) {
  const [prompt, setPrompt] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function gerar() {
    if (!prompt.trim()) return;

    setCarregando(true);
    setResultado("");

    try {
      const response = await fetch("/api/gerar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao gerar conteúdo");
      }

      setResultado(data.result);
    } catch (error) {
      setResultado(
        error instanceof Error
          ? error.message
          : "Erro desconhecido ao gerar conteúdo."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-2 sm:px-6 ">
      <div className="rounded-xl">
        {/* Cabeçalho */}
        <div className="border-b border-zinc-200">
          <h1 className="text-xl font-semibold text-zinc-900 sm:text-2xl">
            Gere com IA
          </h1>

          <p className="mt-1.5 text-sm leading-6 text-zinc-500">
            Digite o tema do conteúdo da sua disciplina:
          </p>
        </div>

        {/* Formulário */}
        <div className="pt-2">


          <textarea
            id="prompt"
            rows={5}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex: Quero um de Sociologia: Indivíduo e sociedade"
            className="w-full resize-y rounded-lg border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
          />

          <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">


            <button
              type="button"
              onClick={gerar}
              disabled={carregando || !prompt.trim()}
              className="w-full rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300 "
            >
              {carregando ? "Gerando..." : "Gerar conteúdo"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

