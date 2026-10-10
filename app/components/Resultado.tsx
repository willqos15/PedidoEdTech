"use client";

import { Frase } from "@/lib/types";

interface ResultadoProps {
  titulo: string;
  setTitulo: React.Dispatch<React.SetStateAction<string>>;
  frases: Frase[];
  setFrases: React.Dispatch<React.SetStateAction<Frase[]>>;
}

export default function Resultado({
  titulo,
  setTitulo,
  frases,
  setFrases,
}: ResultadoProps) {
  if (frases.length === 0) {
    return <div className="border-t border-zinc-200 bg-zinc-50 p-4">
          <button
            type="button"
            onClick={adicionarLinha}
            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 sm:w-auto"
          >
            + Adicionar linha
          </button>
        </div>
  }

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

  return (
    <section className="mt-8">
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        {/* Cabeçalho */}
        <div className="border-b border-zinc-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-zinc-900">
            Resultado
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Revise e edite o conteúdo gerado.
          </p>

          
        </div>

        {/* Cabeçalho da tabela */}
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

          {/* <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Imagem
          </span> */}
        </div>

        {/* Frases */}
        <div className="divide-y divide-zinc-200">
          {frases.map((frase, index) => (
            <div
              key={index}
              className="grid grid-cols-1 gap-4 px-5 py-5 md:grid-cols-4 md:gap-4"
            >
              {/* Palavra */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-500 md:hidden">
                  Palavra
                </label>

                <input
                  type="text"
                  value={frase.palavra}
                  onChange={(e) =>
                    alterarFrase(
                      index,
                      "palavra",
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
                  placeholder="Palavra"
                />
              </div>

              {/* Dica */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-500 md:hidden">
                  Dica
                </label>

                <input
                  type="text"
                  value={frase.dica}
                  onChange={(e) =>
                    alterarFrase(
                      index,
                      "dica",
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
                  placeholder="Dica"
                />
              </div>

              {/* Tema */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-500 md:hidden">
                  Tema
                </label>

                <input
                  type="text"
                  value={frase.tema}
                  onChange={(e) =>
                    alterarFrase(
                      index,
                      "tema",
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
                  placeholder="Tema"
                />
              </div>

              {/* Imagem */}
              {/* <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-500 md:hidden">
                  Imagem
                </label>

                {frase.imagem ? (
                  <div className="relative flex h-fit w-full items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 py-2.5">
                    <span
                      className="w-fit truncate px-4 pr-10 text-sm text-zinc-700"
                      title={frase.nomeImagem}
                    >
                      {frase.nomeImagem}
                    </span>

                    <button
                      type="button"
                      onClick={() => removerImagem(index)}
                      className="absolute right-2 top-2 rounded-md bg-white px-2 py-1 text-xs font-bold text-red-600 shadow-sm hover:bg-red-50"
                    >
                      X
                    </button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 py-2.5 text-sm text-zinc-500 transition hover:border-zinc-400 hover:bg-zinc-100">
                    <span>+ Adicionar imagem</span>

                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const arquivo = e.target.files?.[0];

                        if (arquivo) {
                          adicionarImagem(index, arquivo);
                        }
                      }}
                    />
                  </label>
                )}
              </div> */}
            </div>
          ))}
        </div>

        {/* Adicionar linha */}
        <div className="border-t border-zinc-200 bg-zinc-50 p-4">
          <button
            type="button"
            onClick={adicionarLinha}
            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 sm:w-auto"
          >
            + Adicionar linha
          </button>
        </div>
      </div>
    </section>
  );
}

