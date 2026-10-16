
"use client";

export default function PageLicenca() {
  async function Comprar() {
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao iniciar pagamento.");
      }

      if (data.init_point) {
        window.location.href = data.init_point;
      }
    } catch (error) {
      console.error("Erro no checkout:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Não foi possível iniciar o pagamento."
      );
    }
  }

  return (
    <main>
      <h1>Licença EdTechPalavras</h1>

      <p>Pagamento único de R$ 40,00.</p>

      <button onClick={Comprar}>
        Comprar licença
      </button>
    </main>
  );
}
