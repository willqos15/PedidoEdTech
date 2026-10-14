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
  const [client, setClient] = useState("");

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

  function removerConteudo(index: number) {
    if (conteudos.length <= 1) return;

    setConteudos((atuais) =>
      atuais.filter((_, i) => i !== index)
    );

    setAbertos((atuais) =>
      atuais.filter((_, i) => i !== index)
    );
  }

  function alternarConteudo(index: number) {
    setAbertos((atuais) =>
      atuais.map((aberto, i) =>
        i === index ? !aberto : aberto
      )
    );
  }

  function moverConteudo(index: number, direcao: -1 | 1) {
    setConteudos((atuais) => {
      const novoIndex = index + direcao;

      if (novoIndex < 0 || novoIndex >= atuais.length) {
        return atuais;
      }

      const novosConteudos = [...atuais];

      [novosConteudos[index], novosConteudos[novoIndex]] = [
        novosConteudos[novoIndex],
        novosConteudos[index],
      ];

      return novosConteudos;
    });

    setAbertos((atuais) => {
      const novoIndex = index + direcao;

      if (novoIndex < 0 || novoIndex >= atuais.length) {
        return atuais;
      }

      const novosAbertos = [...atuais];

      [novosAbertos[index], novosAbertos[novoIndex]] = [
        novosAbertos[novoIndex],
        novosAbertos[index],
      ];

      return novosAbertos;
    });
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
      <div className="space-y-6">

<div className="rounded-xl border border-zinc-200 bg-white p-5">
  <label
    htmlFor="client"
    className="mb-2 block text-sm font-semibold text-zinc-900"
  >
    Digite seu nome completo
  </label>

  <input
    id="client"
    type="text"
    value={client}
    onChange={(e) => setClient(e.target.value)}
    placeholder="Ex.: João Faria da Silva"
    className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
  />

  <p className="mt-2 text-xs text-zinc-500">
    Esse nome será exibido no aplicativo gerado.
  </p>
</div>

        {conteudos.map((conteudo, index) => (
          <section
            key={index}
            className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50"
          >
            {/* Cabeçalho do conteúdo */}
            <div className="flex items-center justify-between gap-4 border-b border-zinc-200 bg-white px-5 py-4">
              <button
                type="button"
                onClick={() => alternarConteudo(index)}
                className="flex min-w-0 flex-1 items-center gap-2 text-left"
              >

                <span
                  className={`flex h-8 w-8 text-lg shrink-0 items-center justify-center text-zinc-500 transition-transform ${abertos[index] ? "rotate-180" : ""
                    }`}
                  aria-hidden="true"
                >
                  ⌃
                </span>

                <h2 className="shrink-0 text-base font-semibold text-zinc-900">
                  Conteúdo {index + 1}:
                </h2>

                <p className="truncate text-sm text-zinc-500">
                  {conteudo.titulo || "Novo conteúdo"}
                </p>




              </button>

              {/* Ações de reordenação */}
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => moverConteudo(index, -1)}
                  disabled={index === 0}
                  aria-label="Mover conteúdo para cima"
                  title="Mover para cima"
                  className="rounded-lg border border-zinc-200 px-2 py-1 text-sm text-zinc-600 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  ↑
                </button>

                <button
                  type="button"
                  onClick={() => moverConteudo(index, 1)}
                  disabled={index === conteudos.length - 1}
                  aria-label="Mover conteúdo para baixo"
                  title="Mover para baixo"
                  className="rounded-lg border border-zinc-200 px-2 py-1 text-sm text-zinc-600 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  ↓
                </button>

                <button
                  type="button"
                  onClick={() => removerConteudo(index)}
                  disabled={conteudos.length <= 1}
                  title="Excluir conteúdo"
                  aria-label={`Excluir conteúdo ${index + 1}`}
                  className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:hidden"
                >
                  X
                </button>
              </div>
            </div>

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
        <div className="flex justify-center border-zinc-200 ">
          <button
            type="button"
            onClick={adicionarConteudo}
            className="w-full rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50"
          >
            + Adicionar conteúdo
          </button>
        </div>

        <BtnGerarApp conteudos={conteudos} client={client} />

        {/* Visualização do Tdata[] */}
        {/* <pre className="overflow-x-auto rounded-xl bg-zinc-950 p-5 text-xs text-zinc-200">
          {JSON.stringify(conteudos, null, 2)}
        </pre> */}
      </div>
    </main>
  );
}

