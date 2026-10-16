
"use client";

import { useState, type FormEvent } from "react";


interface LicencaInfo {
  codigo: string;
  disponiveis: number;
  total: number;
}

interface TelaLicencaProps {
  onValidar: (licenca: LicencaInfo) => void;
}




export default function TelaLicenca({ onValidar }: TelaLicencaProps) {
  const [codigo, setCodigo] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function validarLicenca(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const codigoLimpo = codigo.trim();

    if (!codigoLimpo) {
      setErro("Digite o código da licença.");
      return;
    }

    setCarregando(true);
    setErro("");

    try {
      const response = await fetch("/api/licenca/validar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: codigoLimpo }),
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.valid) {
        throw new Error(data.error || "Não foi possível validar a licença.");
      }

      if (typeof data.available !== "number" || data.available <= 0) {
        throw new Error("Esta licença não possui gerações disponíveis.");
      }

      
onValidar({
  codigo: codigoLimpo,
  disponiveis: data.available,
  total: data.max_generations,
});

    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao validar a licença. Tente novamente."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">

        <h1 className="text-2xl flex justify-center font-bold tracking-tight text-zinc-900">
          EdTechPalavras
        </h1>

        <p className="mt-2 text-sm leading-6 text-zinc-600">
          Informe seu código para acessar o gerador do aplicativo.
        </p>

        <form onSubmit={validarLicenca} className="mt-7 space-y-4">
          <div>
            <label
              htmlFor="codigo-licenca"
              className="mb-2 block text-sm font-semibold text-zinc-800"
            >
              Código da licença
            </label>

            <input
              id="codigo-licenca"
              type="text"
              value={codigo}
              onChange={(event) => setCodigo(event.target.value)}
              placeholder="Ex.: EDTECH1234"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              maxLength={128}
              required
              disabled={carregando}
              className="w-full rounded-lg border border-zinc-300 px-3 py-3 text-sm uppercase outline-none transition placeholder:normal-case placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 disabled:bg-zinc-100"
            />
          </div>

          {erro && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
            >
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={carregando || !codigo.trim()}
            className="w-full rounded-lg bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {carregando ? "Validando licença..." : "Validar e continuar"}
          </button>
        </form>

  
      </section>
    </main>
  );
}
