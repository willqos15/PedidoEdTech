"use client";

import { useState } from "react";

const PLANOS = [
  {
    id: "basico",
    nome: "Básico",
    preco: 40,
    geracoes: 1,
    palavras: 15,
  },
  {
    id: "medio",
    nome: "Médio",
    preco: 70,
    geracoes: 2,
    palavras: 40,
  },
  {
    id: "premium",
    nome: "Premium",
    preco: 120,
    geracoes: 5,
    palavras: 100,
  },
] as const;

type PlanId = (typeof PLANOS)[number]["id"];

export default function PageLicenca() {
  const [email, setEmail] = useState("");
  const [planoCarregando, setPlanoCarregando] =
    useState<PlanId | null>(null);

  async function Comprar(planId: PlanId) {
    const emailLimpo = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo)) {
      alert("Informe um e-mail válido.");
      return;
    }

    setPlanoCarregando(planId);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailLimpo,
          planId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Erro ao iniciar pagamento."
        );
      }

      if (data.init_point) {
        window.location.href = data.init_point;
        return;
      }

      throw new Error("O link de pagamento não foi recebido.");
    } catch (error) {
      console.error("Erro ao iniciar pagamento:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Não foi possível iniciar o pagamento."
      );

      setPlanoCarregando(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            EdTechPalavras
          </h1>

          <p className="mt-3 text-slate-600">
            Escolha o plano ideal para criar seus aplicativos educativos.
          </p>
        </header>

        <div className="mx-auto mb-8 max-w-xl">
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Seu e-mail
          </label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="voce@exemplo.com"
            autoComplete="email"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />

          <p className="mt-2 text-sm text-slate-500">
            Enviaremos seu código de licença para esse e-mail.
          </p>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-3">
          {PLANOS.map((plano) => {
            const destaque = plano.id === "medio";
            const carregando = planoCarregando === plano.id;

            return (
              <section
                key={plano.id}
                className={`relative flex flex-col rounded-2xl border bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  destaque
                    ? "border-blue-500 shadow-lg shadow-blue-500/10"
                    : "border-slate-200 shadow-sm hover:border-blue-300"
                }`}
              >
                {destaque && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-blue-600 px-4 py-1 text-xs font-bold text-white shadow-md">
                    Mais escolhido
                  </span>
                )}

                <div className="mb-6">
                  <h2 className="text-xl font-bold">
                    {plano.nome}
                  </h2>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-sm font-medium text-slate-500">
                      R$
                    </span>

                    <span className="text-4xl font-extrabold tracking-tight">
                      {plano.preco}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    Pagamento único
                  </p>
                </div>

                <div className="mb-8 flex-1">
                  <ul className="space-y-4 text-sm text-slate-700">
                    <li className="flex items-start gap-3">
                      <span className="font-bold text-blue-600">✓</span>
                      <span>
                        {plano.geracoes}{" "}
                        {plano.geracoes === 1
                          ? "aplicativo"
                          : "aplicativos"}
                      </span>
                    </li>

                    <li className="flex items-start gap-3">
                      <span className="font-bold text-blue-600">✓</span>
                      <span>
                        Até {plano.palavras} palavras por aplicativo
                      </span>
                    </li>

                    <li className="flex items-start gap-3">
                      <span className="font-bold text-blue-600">✓</span>
                      <span>Funciona sem internet</span>
                    </li>

                    <li className="flex items-start gap-3">
                      <span className="font-bold text-blue-600">✓</span>
                      <span>Aplicativo personalizado para suas aulas</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  disabled={
                    carregando ||
                    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
                  }
                  onClick={() => Comprar(plano.id)}
                  className={`w-full rounded-xl px-4 py-3 cursor-pointer font-semibold transition-all duration-200 ease-out hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 ${
                    destaque
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/25"
                      : "border border-slate-300 bg-white text-slate-800 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 hover:shadow-lg hover:shadow-blue-500/10"
                  }`}
                >
                  {carregando ? "Aguarde..." : "Escolher plano"}
                </button>
              </section>
            );
          })}
        </div>

        <p className="mt-8 text-center text-sm text-slate-500">
          Pagamento seguro pelo Mercado Pago.
        </p>
      </div>
    </main>
  );
}
