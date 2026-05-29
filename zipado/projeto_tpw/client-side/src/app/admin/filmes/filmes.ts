import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Filme } from '../../filme';
import { FilmeService } from '../../services/filme';

@Component({
  selector: 'app-filmes',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './filmes.html',
  styleUrl: './filmes.css'
})
export class Filmes implements OnInit {
  itens: Filme[] = [];
  itensFiltrados: Filme[] = [];
  query: string = '';
  mensagem: string = '';
  carregandoImport: boolean = false;

  private filmeService = inject(FilmeService);
  private cdr = inject(ChangeDetectorRef);

  async ngOnInit(): Promise<void> {
    await this.carregarFilmes();
  }

  async carregarFilmes(): Promise<void> {
    this.itens = await this.filmeService.getFilmes();
    this.itensFiltrados = [...this.itens];
    this.cdr.detectChanges();
  }

  onSearch(): void {
    const q = this.query.toLowerCase().trim();
    if (!q) {
      this.itensFiltrados = [...this.itens];
    } else {
      this.itensFiltrados = this.itens.filter(f =>
        f.titulo.toLowerCase().includes(q) ||
        f.realizador.nome.toLowerCase().includes(q)
      );
    }
    this.cdr.detectChanges();
  }

  limparPesquisa(): void {
    this.query = '';
    this.itensFiltrados = [...this.itens];
    this.cdr.detectChanges();
  }

  // Comunica com a API de Importação do Django
  async importarFilmes(): Promise<void> {
    if (!confirm('Esta operação pode demorar alguns segundos. Continuar?')) return;
    this.carregandoImport = true;
    this.cdr.detectChanges();

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://escorcio.pythonanywhere.com/ws/filmes/importar-api/', {
        method: 'POST',
        headers: { 'Authorization': `Token ${token}` }
      });

      if (response.ok) {
        this.mensagem = "Sucesso! Filmes importados e atualizados na base de dados.";
        await this.carregarFilmes();
      } else {
        this.mensagem = "Erro ao tentar ligar à API do TMDB.";
      }
    } catch (e) {
      this.mensagem = "Ocorreu um erro de ligação.";
    } finally {
      this.carregandoImport = false;
      this.cdr.detectChanges();
    }
  }

  async apagarFilme(id: number): Promise<void> {
    if (!confirm('Tem a certeza que deseja apagar este filme?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://escorcio.pythonanywhere.com/ws/filmes/apagar/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` }
      });
      if (response.ok) {
        this.itens = this.itens.filter(f => f.id !== id);
        this.itensFiltrados = this.itensFiltrados.filter(f => f.id !== id);
        this.cdr.detectChanges();
      }
    } catch (e) {
      console.error(e);
    }
  }
}
