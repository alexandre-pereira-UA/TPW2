// 1. Adicione o "HostListener" nos imports do topo de @angular/core:
import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, HostListener } from '@angular/core';

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
export class ListaFilmes implements OnInit, OnDestroy {
  filmes: Filme[] = [];
  filmesFiltrados: Filme[] = [];
  generos: Genero[] = [];

  searchQuery: string = '';
  filtroAtivo: string = '';
  generoSelecionadoId: number | null = null;

  viewMode: 'grid' | 'carousel' = 'grid';
  activeSlideIndex: number = 0;
  carouselInterval: any = null;

  // NOVO: Limite de filmes mostrados inicialmente na grelha
  limiteExibicao: number = 6;

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

  ngOnDestroy(): void {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
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

  // NOVO: Ouve o scroll do utilizador e carrega mais 6 filmes ao chegar ao fim do ecrã
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    if (this.viewMode !== 'grid') return; // Apenas pagina na grelha

    const posicaoScroll = window.innerHeight + window.scrollY;
    const limiteScroll = document.documentElement.scrollHeight - 150; // Deteta 150px antes de bater no fundo

    if (posicaoScroll >= limiteScroll) {
      if (this.limiteExibicao < this.filmesFiltrados.length) {
        this.limiteExibicao += 6; // Mostra mais 6 filmes de forma instantânea!
        this.cdr.detectChanges();
      }
    }
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'grid' ? 'carousel' : 'grid';
    this.cdr.detectChanges();

    if (this.viewMode === 'carousel') {
      this.activeSlideIndex = 0;
      if (this.carouselInterval) clearInterval(this.carouselInterval);
      this.carouselInterval = setInterval(() => {
        this.nextSlide();
      }, 4000);
    } else {
      if (this.carouselInterval) {
        clearInterval(this.carouselInterval);
        this.carouselInterval = null;
      }
    }
  }

  nextSlide(): void {
    if (this.filmesFiltrados.length === 0) return;
    this.activeSlideIndex = (this.activeSlideIndex + 1) % this.filmesFiltrados.length;
    this.cdr.detectChanges();
  }

  prevSlide(): void {
    if (this.filmesFiltrados.length === 0) return;
    this.activeSlideIndex = (this.activeSlideIndex - 1 + this.filmesFiltrados.length) % this.filmesFiltrados.length;
    this.cdr.detectChanges();
  }

  setSlide(index: number): void {
    this.activeSlideIndex = index;
    this.cdr.detectChanges();
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
    this.activeSlideIndex = 0;
    this.limiteExibicao = 6; // Reinicia o limite ao pesquisar para manter rápido!
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
    this.activeSlideIndex = 0;
    this.limiteExibicao = 6; // Reinicia o limite
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
    this.activeSlideIndex = 0;
    this.limiteExibicao = 6; // Reinicia o limite
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
