import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Ator } from '../../filme';

@Component({
  selector: 'app-atores',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './atores.html',
  styleUrl: './atores.css'
})
export class Atores implements OnInit {
  itens: Ator[] = [];
  itensFiltrados: Ator[] = [];
  query: string = '';

  private cdr = inject(ChangeDetectorRef);

  async ngOnInit(): Promise<void> {
    await this.carregarAtores();
  }

  async carregarAtores(): Promise<void> {
    try {
      const response = await fetch('https://escorcio.pythonanywhere.com/ws/atores/');
      if (response.ok) {
        this.itens = await response.json();
        this.itensFiltrados = [...this.itens];
        this.cdr.detectChanges();
      }
    } catch (e) {
      console.error(e);
    }
  }

  onSearch(): void {
    const q = this.query.toLowerCase().trim();
    if (!q) {
      this.itensFiltrados = [...this.itens];
    } else {
      this.itensFiltrados = this.itens.filter(a => a.nome.toLowerCase().includes(q));
    }
    this.cdr.detectChanges();
  }

  limparPesquisa(): void {
    this.query = '';
    this.itensFiltrados = [...this.itens];
    this.cdr.detectChanges();
  }

  apagarAtor(id: number): void {
    this.toastService.askConfirmation('Tem a certeza que deseja apagar este ator?', () => {
      this.executarApagarAtor(id);
    });
  }

  async executarApagarAtor(id: number): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://escorcio.pythonanywhere.com/ws/atores/apagar/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` }
      });
      if (response.ok) {
        this.itens = this.itens.filter(a => a.id !== id);
        this.itensFiltrados = this.itensFiltrados.filter(a => a.id !== id);
        this.toastService.show('Ator removido com sucesso.', 'success');
        this.cdr.detectChanges();
      }
    } catch (e) {
      console.error(e);
    }
  }
}
