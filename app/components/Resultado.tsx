"use client";

import { Frase } from "@/lib/types";

interface ResultadoProps {
  titulo: string;
  setTitulo: React.Dispatch<React.SetStateAction<string>>;
  frases: Frase[];
  setFrases: React.Dispatch<React.SetStateAction<Frase[]>>;
  limite: number;
}

export default function Resultado({
  titulo,
  setTitulo,
  frases,
  setFrases,
  limite
}: ResultadoProps) {
  function alterarFrase(
    index: number,
    campo: keyof Frase,
    valor: string
  ) {
    setFrases((frasesAtuais) =>
      frasesAtuais.map((frase, i) =>
        i === index
          ? {
            ...frase,
            [campo]: valor,
          }
          : frase
      )
    );
  }



  function adicionarLinha() {
    setFrases((frasesAtuais) => [
      ...frasesAtuais,
      {
        palavra: "",
        dica: "",
        tema: "",
      },
    ]);
  }

  function removerLinha(index: number) {
    setFrases((frasesAtuais) =>
      frasesAtuais.filter((_, i) => i !== index)
    );
  }

  function moverLinha(index: number, direcao: -1 | 1) {
    setFrases((frasesAtuais) => {
      const novoIndex = index + direcao;

      if (novoIndex < 0 || novoIndex >= frasesAtuais.length) {
        return frasesAtuais;
      }

      const novasFrases = [...frasesAtuais];

      [novasFrases[index], novasFrases[novoIndex]] = [
        novasFrases[novoIndex],
        novasFrases[index],
      ];

      return novasFrases;
    });
  }

  function removerImagem(index: number) {
    setFrases((frasesAtuais) =>
      frasesAtuais.map((frase, i) =>
        i === index
          ? {
            ...frase,
            imagem: undefined,
            nomeImagem: undefined,
          }
          : frase
      )
    );
  }

  function adicionarImagem(index: number, arquivo: File) {
    const reader = new FileReader();

    reader.onload = () => {
      setFrases((frasesAtuais) =>
        frasesAtuais.map((frase, i) =>
          i === index
            ? {
              ...frase,
              imagem: reader.result as string,
              nomeImagem: arquivo.name,
            }
            : frase
        )
      );
    };

    reader.readAsDataURL(arquivo);
  }

  const QtdPalavras = frases.filter(
  (frase) => frase.palavra.trim() !== ""
).length;

  return (
    <section className="mt-8">
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">

        <div className="border-b border-zinc-200 px-5 py-4">


          <div className="flex items-center gap-2 mt-4">
            <label
              htmlFor="titulo-conteudo"
              className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              ASSUNTO
            </label>

            <input
              id="titulo-conteudo"
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Digite o título do conteúdo"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
            />
          </div>
        </div>

        <div className="hidden grid-cols-4 gap-4 border-b border-zinc-200 bg-zinc-50 px-5 py-3 md:grid">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Palavra
          </span>

          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Dica
          </span>

          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Tema
          </span>

          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Ações
          </span>
        </div>

        <div className="divide-y divide-zinc-200">
          {frases.map((frase, index) => (
            <div
              key={index}
              className="grid grid-cols-1 gap-4 px-5 py-5 md:grid-cols-4 md:gap-4"
            >
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-500 md:hidden">
                  Palavra
                </label>

                <input
                  type="text"
                  value={frase.palavra}
                  onChange={(e) =>
                    alterarFrase(index, "palavra", e.target.value)
                  }
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
                  placeholder="Palavra"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-500 md:hidden">
                  Dica
                </label>

                <input
                  type="text"
                  value={frase.dica}
                  onChange={(e) =>
                    alterarFrase(index, "dica", e.target.value)
                  }
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
                  placeholder="Dica"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-500 md:hidden">
                  Tema
                </label>

                <input
                  type="text"
                  value={frase.tema ?? ""}
                  onChange={(e) =>
                    alterarFrase(index, "tema", e.target.value)
                  }
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
                  placeholder="Tema"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => moverLinha(index, -1)}
                  disabled={index === 0}
                  title="Mover para cima"
                  aria-label={`Mover palavra ${index + 1} para cima`}
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  ↑
                </button>

                <button
                  type="button"
                  onClick={() => moverLinha(index, 1)}
                  disabled={index === frases.length - 1}
                  title="Mover para baixo"
                  aria-label={`Mover palavra ${index + 1} para baixo`}
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  ↓
                </button>

                <button
                  type="button"
                  onClick={() => removerLinha(index)}
                  title="Remover palavra"
                  aria-label={`Remover palavra ${index + 1}`}
                  className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {QtdPalavras<limite &&
        <div className="border-t border-zinc-200 bg-zinc-50 p-4">
          <button
            type="button"
            onClick={adicionarLinha}
            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 sm:w-auto"
          >
            + Adicionar linha
          </button>
        </div>
        }
      </div>
    </section>
  );
}