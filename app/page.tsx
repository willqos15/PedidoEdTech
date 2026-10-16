
"use client";

import { useState } from "react";
import Gerador from "./components/Gerador";
import TelaLicenca from "./components/TelaLicenca";

interface LicencaInfo {
  codigo: string;
  disponiveis: number;
  total: number;
}

export default function Home() {
  const [licenca, setLicenca] = useState<LicencaInfo | null>(null);

  return (
    <div>
      {licenca ? (
        <>
          <div className="mx-auto mt-4 max-w-5xl px-4">
            <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4">
              <div>
                <p className="text-sm text-zinc-500">
                  Gerações disponíveis
                </p>
                <p className="text-xl font-bold text-zinc-900">
                  restam {licenca.disponiveis} de {licenca.total}
                </p>
              </div>
              <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                Licença ativa
              </span>
            </div>
          </div>

          <Gerador
  codigoLicenca={licenca.codigo}
  onSaldoAtualizado={(disponiveis, total) => {
    setLicenca((atual) =>
      atual
        ? { ...atual, disponiveis, total }
        : atual
    );
  }}
/>
        </>
      ) : (
        <TelaLicenca onValidar={setLicenca} />
      )}
    </div>
  );
}
