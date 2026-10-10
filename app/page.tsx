"use client";

import { useState } from "react";

import InputContext from "./components/InputContext";
import Resultado from "./components/Resultado";

import { Frase } from "@/lib/types";
import BtnGerarApp from "./components/BtnGerarApp";

type Tfrases = {
  palavra: string;
  dica: string;
  imagem?: string;
  tema?: string;
};

type Tdata = {
  titulo: string;
  frases: Tfrases[];
};

export default function Home() {
  const [conteudos, setConteudos] = useState<Tdata[]>([
    {
      titulo: "",
      frases: [],
    },
  ]);

  const [abertos, setAbertos] = useState<boolean[]>([true]);

  function alterarConteudo(
    index: number,
    conteudo: Tdata
  ) {
    setConteudos((atuais) =>
      atuais.map((item, i) =>
        i === index ? conteudo : item
      )
    );
  }

  function adicionarConteudo() {
    setConteudos((atuais) => [
      ...atuais,
      {
        titulo: "",
        frases: [],
      },
    ]);

    setAbertos((atuais) => [...atuais, true]);
  }

  function alternarConteudo(index: number) {
    setAbertos((atuais) =>
      atuais.map((aberto, i) =>
        i === index ? !aberto : aberto
      )
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
      <div className="space-y-6">
        {conteudos.map((conteudo, index) => (
          <section
            key={index}
            className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50"
          >
            {/* Cabeçalho do conteúdo */}
            <button
              type="button"
              onClick={() => alternarConteudo(index)}
              className="flex w-full items-center justify-between gap-4 border-b border-zinc-200 bg-white px-5 py-4 text-left transition hover:bg-zinc-50"
            >
              <div className="min-w-0 flex gap-2 items-center">
                <h2 className="text-base font-semibold text-zinc-900">
                  Conteúdo {index + 1}:
                </h2>

                <p className="truncate text-sm text-zinc-500">
                  {conteudo.titulo || "Novo conteúdo"}
                </p>
                
              </div>

              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition-transform ${
                  abertos[index] ? "rotate-180" : ""
                }`}
              >
                ↓
              </span>
            </button>

            {/* Input + Resultado */}
            {abertos[index] && (
              <div className="space-y-6 p-4 sm:p-5">
                <InputContext
                  resultado={JSON.stringify(conteudo)}
                  setResultado={(resultado) => {
                    try {
                      const dados = JSON.parse(resultado);

                      alterarConteudo(index, {
                        titulo: dados.titulo || "",
                        frases: dados.frases || [],
                      });
                    } catch {
                      // JSON inválido: não altera o conteúdo atual
                    }
                  }}
                />

                <Resultado
                  titulo={conteudo.titulo}
                  setTitulo={(novoTitulo) => {
                    setConteudos((atuais) =>
                      atuais.map((item, i) =>
                        i === index
                          ? {
                              ...item,
                              titulo:
                                typeof novoTitulo === "function"
                                  ? novoTitulo(item.titulo)
                                  : novoTitulo,
                            }
                          : item
                      )
                    );
                  }}
                  frases={conteudo.frases as Frase[]}
                  setFrases={(novasFrases) => {
                    setConteudos((atuais) =>
                      atuais.map((item, i) =>
                        i === index
                          ? {
                              ...item,
                              frases:
                                typeof novasFrases === "function"
                                  ? novasFrases(
                                      item.frases as Frase[]
                                    )
                                  : novasFrases,
                            }
                          : item
                      )
                    );
                  }}
                />
              </div>
            )}

          </section>
        ))}

        {/* Adicionar conteúdo */}
        <div className="flex justify-center border-t border-zinc-200 pt-8">
          <button
            type="button"
            onClick={adicionarConteudo}
            className="rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50"
          >
            + Adicionar conteúdo
          </button>
        </div>

        <BtnGerarApp conteudos={conteudos}/>

        {/* Visualização do Tdata[] */}
        <pre className="overflow-x-auto rounded-xl bg-zinc-950 p-5 text-xs text-zinc-200">
          {JSON.stringify(conteudos, null, 2)}
        </pre>
      </div>
    </main>
  );
}

