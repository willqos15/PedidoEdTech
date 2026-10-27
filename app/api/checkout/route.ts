
import { NextResponse } from "next/server";

const PLANOS = {
  basico: {
    nome: "Plano Básico",
    preco: 40,
    maxGenerations: 1,
    maxWordsPerGeneration: 15,
  },
  medio: {
    nome: "Plano Médio",
    preco: 70,
    maxGenerations: 2,
    maxWordsPerGeneration: 40,
  },
  premium: {
    nome: "Plano Premium",
    preco: 120,
    maxGenerations: 5,
    maxWordsPerGeneration: 100,
  },
} as const;

export async function POST(request: Request) {

  let externalReference: string | null = null;

  const workerUrl = process.env.CLOUDFLARE_WORKER_URL;
  const secret = process.env.NEXT_API_SECRET;


  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

    const body = await request.json();

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    if (
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return NextResponse.json(
        { error: "Informe um e-mail válido." },
        { status: 400 }
      );
    }



    if (!appUrl || !accessToken || !workerUrl || !secret) {
      return NextResponse.json(
        { error: "Configuração do checkout ausente." },
        { status: 500 }
      );
    }

    const planId = body.planId;

    if (
      typeof planId !== "string" ||
      !Object.hasOwn(PLANOS, planId)
    ) {
      return NextResponse.json(
        { error: "Selecione um plano válido." },
        { status: 400 }
      );
    }

    const plano = PLANOS[planId as keyof typeof PLANOS];

    externalReference = crypto.randomUUID();

    const registration = await fetch(
      `${workerUrl}/payments/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-secret": secret,
        },
        body: JSON.stringify({
          external_reference: externalReference,
          email,
          amount: Math.round(plano.preco * 100),
        }),
      }
    );

    if (!registration.ok) {
      return NextResponse.json(
        { error: "Não foi possível registrar a compra." },
        { status: 502 }
      );
    }

    const response = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: [
            {
              id: `licenca-edtechpalavras-${planId}`,
              title: plano.nome,
              description:
                `${plano.maxGenerations} aplicativo(s), ` +
                `até ${plano.maxWordsPerGeneration} palavras por aplicativo`,
              quantity: 1,
              currency_id: "BRL",
              unit_price: plano.preco,
            },
          ],



          external_reference: externalReference,

          back_urls: {
            success: `${appUrl}/compra/sucesso`,
            failure: `${appUrl}/compra/falha`,
            pending: `${appUrl}/compra/pendente`,
          },

          auto_return: "approved",

          notification_url:
            `${process.env.CLOUDFLARE_WORKER_URL}/webhook/mercadopago`,
        }),
      }
    );

    const preference = await response.json();

    if (!response.ok) {
      console.error("Erro Mercado Pago:", preference);

      await fetch(`${workerUrl}/payments/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-secret": secret,
        },
        body: JSON.stringify({
          external_reference: externalReference,
        }),
      });

      return NextResponse.json(
        { error: "Erro ao criar preferência de pagamento." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      id: preference.id,
      init_point: preference.init_point,
    });
  } catch (error) {
    console.error("Erro no checkout:", error);

    return NextResponse.json(
      { error: "Erro interno ao criar checkout." },
      { status: 500 }
    );
  }
}
