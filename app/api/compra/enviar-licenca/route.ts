
import { NextRequest, NextResponse } from "next/server";
import { enviarEmail } from "@/lib/email";


export async function POST(request: NextRequest) {
  try {

     const segredo = process.env.EMAIL_AUTOMATION_SECRET;

if (
  !segredo ||
  request.headers.get("x-email-secret") !== segredo
) {
  return NextResponse.json(
    { error: "Não autorizado." },
    { status: 401 }
  );
}
    const workerUrl = process.env.CLOUDFLARE_WORKER_URL;
    const apiSecret = process.env.NEXT_API_SECRET;

    if (!workerUrl || !apiSecret) {
      return NextResponse.json(
        { error: "Configuração do servidor incompleta." },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => null);
    const externalReference =
      typeof body?.external_reference === "string"
        ? body.external_reference.trim()
        : "";

    // A referência é um UUID gerado no servidor durante o checkout.
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        externalReference
      )
    ) {
      return NextResponse.json(
        { error: "Referência de compra inválida." },
        { status: 400 }
      );
    }



   


    const response = await fetch(
      `${workerUrl.replace(/\/+$/, "")}/payments/status`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-secret": apiSecret,
        },
        body: JSON.stringify({
          external_reference: externalReference,
        }),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error("Worker status HTTP:", response.status);

      return NextResponse.json(
        { error: "Não foi possível consultar a compra." },
        { status: 502 }
      );
    }

    const compra = await response.json();
    console.log("Resposta do Worker /payments/status:", compra);

    if (compra.status !== "approved") {
      return NextResponse.json(
        { error: "O pagamento ainda não foi aprovado." },
        { status: 409 }
      );
    }

    const email =
      typeof compra.email === "string" ? compra.email.trim() : "";
    const codigo =
      typeof compra.license_code === "string"
        ? compra.license_code.trim()
        : "";

    if (
      !email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      
      !codigo
    ) {
      return NextResponse.json(
        { error: "E-mail ou licença não disponíveis para esta compra." },
        { status: 409 }
      );
    }

    await enviarEmail(
      email,
      "Sua licença EdTechPalavras",
      [
        "Olá!",
        "",
        "Seu pagamento foi aprovado.",
        "",
        `Sua licença EdTechPalavras: ${codigo}`,
        "",
        "Guarde esse código para utilizar sua licença.",
        "",
        "Equipe EdTechPalavras",
      ].join("\n")
    );

    return NextResponse.json({
      success: true,
      message: "Licença enviada ao e-mail cadastrado.",
    });
  } catch (error) {
    console.error("Erro ao enviar licença:", error);

    return NextResponse.json(
      { error: "Não foi possível enviar a licença." },
      { status: 500 }
    );
  }
}
