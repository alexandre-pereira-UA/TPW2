import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Necessário para ler o que escreve no input de pesquisa
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

  private filmeService = inject(FilmeService);

  async ngOnInit(): Promise<void> {
    this.filmes = await this.filmeService.getFilmes();
    this.filmesFiltrados = [...this.filmes];
  }

  // Função de pesquisa instantânea no cliente
  onSearch(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) {
      this.filmesFiltrados = [...this.filmes];
      return;
    }
    this.filmesFiltrados = this.filmes.filter(f =>
      f.titulo.toLowerCase().includes(query) ||
      f.realizador.nome.toLowerCase().includes(query) ||
      f.atores.some(a => a.nome.toLowerCase().includes(query))
    );
  }

  limparPesquisa(): void {
    this.searchQuery = '';
    this.filtroAtivo = '';
    this.filmesFiltrados = [...this.filmes];
  }

  // Ordenação instantânea
  ordenar(criterio: string): void {
    this.filtroAtivo = criterio;
    if (criterio === 'recentes') {
      this.filmesFiltrados.sort((a, b) => new Date(b.data_lancamento).getTime() - new Date(a.data_lancamento).getTime());
    } else if (criterio === 'antigos') {
      this.filmesFiltrados.sort((a, b) => new Date(a.data_lancamento).getTime() - new Date(b.data_lancamento).getTime());
    } else if (criterio === 'alfabetica') {
      this.filmesFiltrados.sort((a, b) => a.titulo.localeCompare(b.titulo));
    }
  }
}
