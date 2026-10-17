"use client";

import { useState, type FormEvent } from "react";

export default function PageLicenca() {

  const [email, setEmail] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function Comprar(event: FormEvent<HTMLFormElement>) {

    event.preventDefault();

    const emailLimpo = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo)) {
      alert("Digite um e-mail válido.");
      return;
    }

    setCarregando(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: emailLimpo }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao iniciar pagamento.");
      }

      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error("O link de pagamento não foi recebido.");
      }
    } catch (error) {
      console.error("Erro no checkout:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Não foi possível iniciar o pagamento."
      );
      setCarregando(false);
    }
  }


  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-center text-2xl font-bold text-zinc-900">
          Licença EdTechPalavras
        </h1>

        <p className="mt-3 text-center text-sm text-zinc-600">
          Pagamento único de R$ 40,00.
        </p>

        <form onSubmit={Comprar} className="mt-7 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold text-zinc-800"
            >
              Seu e-mail
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="seu@email.com"
              autoComplete="email"
              maxLength={254}
              required
              disabled={carregando}
              className="w-full rounded-lg border border-zinc-300 px-3 py-3 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 disabled:bg-zinc-100"
            />
          </div>

          <p className="text-xs leading-5 text-zinc-500">
            Enviaremos sua licença para este endereço após a confirmação do pagamento.
          </p>

          <button
            type="submit"
            disabled={carregando || !email.trim()}
            className="w-full rounded-lg bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {carregando ? "Redirecionando..." : "Comprar licença"}
          </button>
        </form>
      </section>
    </main>
  );

}
