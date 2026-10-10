import { Groq } from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: Request) {
    try {
        const { prompt } = await request.json();

        if (!prompt) {
            return NextResponse.json(
                { error: "Prompt não informado" },
                { status: 400 }
            );
        }

        const completion = await groq.chat.completions.create({
            model: "openai/gpt-oss-120b",
            messages: [
                {
                    role: "system",
                    content: `Você é uma IA responsável por criar conteúdos educativos para um jogo de palavras.

A partir do tema informado pelo usuário, gere um conteúdo seguindo exatamente esta estrutura:

                    {
                        "titulo": "Título do conteúdo",
                        "frases": [
                            {
                                "palavra": "Palavra",
                                "dica": "Dica para descobrir a palavra",
                                "tema": "Tema da palavra"
                            }
                        ]
                    }

Regras:

* Retorne somente JSON válido.
* Não use Markdown.
* Não coloque explicações antes ou depois do JSON.
* "titulo" deve ser um título relacionado ao tema solicitado.
* "frases" deve ser um array com palavras relacionadas ao tema.
* Cada objeto de "frases" deve possuir obrigatoriamente "palavra", "dica" e "tema".
* "palavra" deve ser uma palavra adequada ao tema.
* "palavra" com no máximo 18 letras.
* "dica" deve ajudar o jogador a descobrir a palavra sem revelar diretamente a resposta.
* "tema" deve indicar o assunto ao qual a palavra pertence.
* Todos os campos devem ser strings não vazias.
* Gere 25 frases.
* "título" com no máximo 2 palavras.
* Não repeta palavras.

* Use palavras adequadas ao nível escolar informado pelo usuário.

Tema solicitado pelo usuário: {{ prompt }}`,
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.4,
            max_completion_tokens: 3000,
            stream: false,
        });

        const result = completion.choices[0]?.message?.content;

        return NextResponse.json({
            result,
        });
    } catch (error) {
        console.error("ERRO GROQ:", error);

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Erro desconhecido na Groq",
            },
            { status: 500 }
        );
    }
}