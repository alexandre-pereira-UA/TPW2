import { Injectable } from '@angular/core';
import { Filme } from '../filme';

@Injectable({
  providedIn: 'root'
})
export class FilmeService {
  private baseUrl: string = 'https://escorcio.pythonanywhere.com/ws';

  constructor() { }

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

  async getFavoritos(): Promise<any[]> {
    const token = localStorage.getItem('token');
    const url = `${this.baseUrl}/favoritos/`;
    try {
      const response = await fetch(url, {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async toggleFavorito(filmeId: number): Promise<any> {
    const token = localStorage.getItem('token');
    const url = `${this.baseUrl}/favoritos/toggle/${filmeId}/`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': `Token ${token}` }
      });
      return await response.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async getGuardados(): Promise<any[]> {
    const token = localStorage.getItem('token');
    const url = `${this.baseUrl}/guardados/`;
    try {
      const response = await fetch(url, {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async toggleGuardado(filmeId: number): Promise<any> {
    const token = localStorage.getItem('token');
    const url = `${this.baseUrl}/guardados/toggle/${filmeId}/`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': `Token ${token}` }
      });
      return await response.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
