
"use client";

import { useEffect, useState } from "react";

type StatusCompra = "loading" | "pending" | "approved" | "error";

export default function CompraSucesso() {
  const [status, setStatus] = useState<StatusCompra>("loading");
  const [codigo, setCodigo] = useState("");
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    const externalReference = new URLSearchParams(
      window.location.search
    ).get("external_reference");

    if (!externalReference) {
      setStatus("error");
      return;
    }

    let ativo = true;
    let tentativas = 0;
    let timer: ReturnType<typeof setTimeout>;

    async function consultar() {
      try {
        const response = await fetch("/api/compra/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            external_reference: externalReference,
          }),
          cache: "no-store",
        });

        const data = await response.json();

        if (!ativo) return;

        if (response.ok && data.status === "approved" && data.license_code) {
          setCodigo(data.license_code);
          setStatus("approved");
          return;
        }

        if (!response.ok && response.status !== 404) {
          setStatus("error");
          return;
        }

        tentativas++;

        if (tentativas >= 20) {
          setStatus("pending");
          return;
        }

        setStatus("loading");
        timer = setTimeout(consultar, 3000);
      } catch {
        if (ativo) setStatus("error");
      }
    }

    consultar();

    return () => {
      ativo = false;
      clearTimeout(timer);
    };
  }, []);

  async function copiarCodigo() {
    try {
      await navigator.clipboard.writeText(codigo);
      setCopiado(true);
    } catch {
      setCopiado(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 p-6 text-center">
      {status === "loading" && (
        <>
          <h1 className="text-2xl font-bold">
            Confirmando seu pagamento
          </h1>
          <p>
            Aguarde enquanto verificamos o pagamento e preparamos sua licença.
          </p>
        </>
      )}

      {status === "pending" && (
        <>
          <h1 className="text-2xl font-bold">
            Pagamento ainda em confirmação
          </h1>
          <p>
            Sua licença ainda não está disponível. Aguarde um pouco e
            atualize esta página para consultar novamente.
          </p>
          <button
            className="rounded bg-blue-600 px-4 py-2 text-white"
            onClick={() => window.location.reload()}
          >
            Consultar novamente
          </button>
        </>
      )}

      {status === "approved" && (
        <>
          <h1 className="text-2xl font-bold">
            Pagamento confirmado!
          </h1>

          <p>Sua licença EdTechPalavras está pronta.</p>

          <div className="w-full rounded-lg border p-5">
            <p className="mb-2 text-sm">
              Código da licença
            </p>

            <p className="break-all text-xl font-bold">
              {codigo}
            </p>

            <button
              className="mt-4 rounded bg-blue-600 px-4 py-2 text-white"
              onClick={copiarCodigo}
            >
              {copiado ? "Código copiado!" : "Copiar licença"}
            </button>
          </div>

          <p>Guarde esse código para ativar sua licença.</p>
        </>
      )}

      {status === "error" && (
        <>
          <h1 className="text-2xl font-bold">
            Não foi possível consultar a compra
          </h1>
          <p>
            Tente atualizar a página. Se o problema continuar, entre em contato
            com o suporte.
          </p>
          <button
            className="rounded bg-blue-600 px-4 py-2 text-white"
            onClick={() => window.location.reload()}
          >
            Tentar novamente
          </button>
        </>
      )}
    </main>
  );
}
