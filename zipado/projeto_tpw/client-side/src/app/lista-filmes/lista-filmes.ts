import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Filme } from '../filme';
import { FilmeService } from '../services/filme';

@Component({
  selector: 'app-lista-filmes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './lista-filmes.html',
  styleUrl: './lista-filmes.css'
})
export class ListaFilmes implements OnInit {
  filmes: Filme[] = [];
  filmesFiltrados: Filme[] = [];
  searchQuery: string = '';
  filtroAtivo: string = '';

  isLoggedIn = false;
  isSuperuser = false;
  ids_favoritos: number[] = [];
  ids_guardados: number[] = [];

  private filmeService = inject(FilmeService);
  private cdr = inject(ChangeDetectorRef);

  async ngOnInit(): Promise<void> {
    this.checkLoginStatus();

    // 1. Carrega os filmes normais primeiro de forma segura
    this.filmes = await this.filmeService.getFilmes();
    this.filmesFiltrados = [...this.filmes];
    this.cdr.detectChanges(); // Garante que os filmes aparecem logo no ecrã!

    // 2. Tenta carregar favoritos/guardados de forma isolada e segura
    if (this.isLoggedIn && !this.isSuperuser) {
      try {
        const favs = await this.filmeService.getFavoritos();
        if (favs && Array.isArray(favs)) {
          this.ids_favoritos = favs.map((f: any) => f.filme.id);
        }

        const guards = await this.filmeService.getGuardados();
        if (guards && Array.isArray(guards)) {
          this.ids_guardados = guards.map((g: any) => g.filme.id);
        }
        this.cdr.detectChanges(); // Atualiza apenas os ícones
      } catch (error) {
        console.error("Erro seguro: Tabelas de favoritos/guardados vazias ou indisponíveis.", error);
      }
    }
  }

  checkLoginStatus(): void {
    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');
    if (token && userJson) {
      this.isLoggedIn = true;
      const user = JSON.parse(userJson);
      this.isSuperuser = user.is_superuser;
    }
  }

  async toggleFavorito(filmeId: number): Promise<void> {
    await this.filmeService.toggleFavorito(filmeId);
    if (this.ids_favoritos.includes(filmeId)) {
      this.ids_favoritos = this.ids_favoritos.filter(id => id !== filmeId);
    } else {
      this.ids_favoritos.push(filmeId);
    }
    this.cdr.detectChanges();
  }

  async toggleGuardado(filmeId: number): Promise<void> {
    await this.filmeService.toggleGuardado(filmeId);
    if (this.ids_guardados.includes(filmeId)) {
      this.ids_guardados = this.ids_guardados.filter(id => id !== filmeId);
    } else {
      this.ids_guardados.push(filmeId);
    }
    this.cdr.detectChanges();
  }

  onSearch(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) {
      this.filmesFiltrados = [...this.filmes];
      this.cdr.detectChanges();
      return;
    }
    this.filmesFiltrados = this.filmes.filter(f =>
      f.titulo.toLowerCase().includes(query) ||
      f.realizador.nome.toLowerCase().includes(query) ||
      f.atores.some((a: any) => a.nome.toLowerCase().includes(query))

    );
    this.cdr.detectChanges();
  }

  limparPesquisa(): void {
    this.searchQuery = '';
    this.filtroAtivo = '';
    this.filmesFiltrados = [...this.filmes];
    this.cdr.detectChanges();
  }

  ordenar(criterio: string): void {
    this.filtroAtivo = criterio;
    if (criterio === 'recentes') {
      this.filmesFiltrados.sort((a, b) => new Date(b.data_lancamento).getTime() - new Date(a.data_lancamento).getTime());
    } else if (criterio === 'antigos') {
      this.filmesFiltrados.sort((a, b) => new Date(a.data_lancamento).getTime() - new Date(b.data_lancamento).getTime());
    } else if (criterio === 'alfabetica') {
      this.filmesFiltrados.sort((a, b) => a.titulo.localeCompare(b.titulo));
    }
    this.cdr.detectChanges();
  }

  calcularMedia(filme: Filme): string {
    if (!filme.avaliacoes || filme.avaliacoes.length === 0) {
      return 'Sem classificação';
    }
    const total = filme.avaliacoes.reduce((sum, av) => sum + av.nota, 0);
    const media = total / filme.avaliacoes.length;
    return `${media.toFixed(1)}/5 ★ (${filme.avaliacoes.length} ${filme.avaliacoes.length === 1 ? 'crítica' : 'críticas'})`;
  }
}
