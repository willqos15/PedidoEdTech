export interface Frase {
  palavra: string;
  dica: string;
  tema?: string;
  imagem?: string;
  nomeImagem?: string;
}

export interface LicencaInfo {
  codigo: string;
  disponiveis: number;
  total: number;
  limitePalavra: number;
}