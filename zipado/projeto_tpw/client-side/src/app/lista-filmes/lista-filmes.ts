import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Filme, Genero } from '../filme';
import { FilmeService } from '../services/filme';
import { ToastService } from '../services/toast';

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
  generos: Genero[] = [];

  searchQuery: string = '';
  filtroAtivo: string = '';
  generoSelecionadoId: number | null = null;

  // NOVO: Estado do Modo de Visualização ('grid' = Grelha, 'carousel' = Slide)
  viewMode: 'grid' | 'carousel' = 'grid';

  isLoggedIn = false;
  isSuperuser = false;
  ids_favoritos: number[] = [];
  ids_guardados: number[] = [];

  private filmeService = inject(FilmeService);
  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  async ngOnInit(): Promise<void> {
    this.checkLoginStatus();
    this.filmes = await this.filmeService.getFilmes();
    this.filmesFiltrados = [...this.filmes];
    this.cdr.detectChanges();

    await this.carregarGeneros();

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
        this.cdr.detectChanges();
      } catch (error) {
        console.error("Erro ao carregar favoritos/guardados.", error);
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

  async carregarGeneros(): Promise<void> {
    try {
      const response = await fetch('https://escorcio.pythonanywhere.com/ws/generos/');
      if (response.ok) {
        this.generos = await response.json();
        this.cdr.detectChanges();
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Alternador Dinâmico de Layout
  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'grid' ? 'carousel' : 'grid';
    this.cdr.detectChanges();

    // Inicia o carrossel do Bootstrap nativamente se mudarmos para slides
    if (this.viewMode === 'carousel') {
      setTimeout(() => {
        (window as any).jQuery?.('#movieCarousel').carousel({
          interval: 4000 // desliza automaticamente a cada 4 segundos
        });
      }, 100);
    }
  }

  onSearch(): void {
    const query = this.searchQuery.toLowerCase().trim();
    let resultados = this.filmes;

    if (query) {
      resultados = resultados.filter(f =>
        f.titulo.toLowerCase().includes(query) ||
        f.realizador.nome.toLowerCase().includes(query) ||
        f.atores.some((a: any) => a.nome.toLowerCase().includes(query))
      );
    }

    if (this.generoSelecionadoId !== null) {
      resultados = resultados.filter(f =>
        f.generos.some(g => g.id === this.generoSelecionadoId)
      );
    }

    this.filmesFiltrados = resultados;
    this.cdr.detectChanges();
  }

  filtrarPorGenero(generoId: number | null): void {
    this.generoSelecionadoId = generoId;
    this.onSearch();
  }

  async toggleFavorito(filmeId: number): Promise<void> {
    await this.filmeService.toggleFavorito(filmeId);
    const filme = this.filmes.find(f => f.id === filmeId);

    if (this.ids_favoritos.includes(filmeId)) {
      this.ids_favoritos = this.ids_favoritos.filter(id => id !== filmeId);
      this.toastService.show(`"${filme?.titulo}" removido dos favoritos.`, 'danger');
    } else {
      this.ids_favoritos.push(filmeId);
      this.toastService.show(`"${filme?.titulo}" adicionado aos favoritos!`, 'success');
    }
    this.cdr.detectChanges();
  }

  async toggleGuardado(filmeId: number): Promise<void> {
    await this.filmeService.toggleGuardado(filmeId);
    const filme = this.filmes.find(f => f.id === filmeId);

    if (this.ids_guardados.includes(filmeId)) {
      this.ids_guardados = this.ids_guardados.filter(id => id !== filmeId);
      this.toastService.show(`"${filme?.titulo}" removido dos guardados.`, 'danger');
    } else {
      this.ids_guardados.push(filmeId);
      this.toastService.show(`"${filme?.titulo}" guardado para ver mais tarde!`, 'success');
    }
    this.cdr.detectChanges();
  }

  limparPesquisa(): void {
    this.searchQuery = '';
    this.filtroAtivo = '';
    this.generoSelecionadoId = null;
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
