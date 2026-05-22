import { Injectable } from '@angular/core';
import { Filme } from '../filme';

@Injectable({
  providedIn: 'root'
})
export class FilmeService {
  private baseUrl: string = 'http://localhost:8000/ws';

  constructor() { }

  // 1. Obter todos os filmes
  async getFilmes(): Promise<Filme[]> {
    const url = `${this.baseUrl}/filmes/`;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Erro ao ligar ao Django');
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  // 2. Obter apenas um filme pelo ID (Nova função)
  async getFilme(id: number): Promise<Filme | undefined> {
    const url = `${this.baseUrl}/filmes/${id}/`;
    try {
      const response = await fetch(url);
      if (!response.ok) return undefined;
      return await response.json();
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }
}
