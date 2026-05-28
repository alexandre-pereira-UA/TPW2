// Garanta que NÃO há nenhuma linha de "import" acima!

export interface Genero {
  id: number;
  nome: string;
}

export interface Realizador {
  id: number;
  nome: string;
}

export interface Ator {
  id: number;
  nome: string;
}

export interface Filme {
  id: number;
  titulo: string;
  data_lancamento: string;
  sinopse?: string;
  cartaz?: string;
  realizador: Realizador;
  generos: Genero[];
  atores: Ator[];
  avaliacoes?: any[]; // Adicionado de forma segura para os comentários
}
