
"use client";


import { useCallback, useState } from "react";
import Gerador from "./components/Gerador";
import TelaLicenca from "./components/TelaLicenca";
import { LicencaInfo } from "@/lib/types";



export default function Home() {
  const [licenca, setLicenca] = useState<LicencaInfo | null>(null);
  const [palavrasUsadas, setPalavrasUsadas] = useState<string[]>([]);

  const atualizarPalavrasUsadas = useCallback(
  (palavras: string[]) => {
    setPalavrasUsadas(palavras);
  },
  []
);

  return (
    <div>
      {licenca ? (
        <>
        <Gerador
            limite={licenca.limitePalavra}
            onPalavrasUsadas={atualizarPalavrasUsadas}
            codigoLicenca={licenca.codigo}
            onSaldoAtualizado={(disponiveis, total) => {
              setLicenca((atual) =>
                atual
                  ? { ...atual, disponiveis, total }
                  : atual
              );
            }}
          />

          <div className="mx-auto mt-4 max-w-5xl px-4">
            <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4">
              <div>
                <p className="text-sm text-zinc-500">
                  Gerações disponíveis restam {licenca.disponiveis} de {licenca.total}
                </p>

                <p className="mt-2 text-sm font-sm text-zinc-500">
                  Palavras utilizadas: {palavrasUsadas.length} de {licenca.limitePalavra}
                </p>

                
              </div>
              <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                Licença ativa
              </span>
            </div>
          </div>

          
        </>
      ) : (
        <TelaLicenca onValidar={setLicenca} />
      )}
    </div>
  );
}
