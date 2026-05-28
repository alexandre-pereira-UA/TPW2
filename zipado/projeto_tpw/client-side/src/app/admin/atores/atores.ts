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
      const response = await fetch('http://localhost:8000/ws/atores/');
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

  async apagarAtor(id: number): Promise<void> {
    if (!confirm('Apagar ator?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/ws/atores/apagar/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` }
      });
      if (response.ok) {
        this.itens = this.itens.filter(a => a.id !== id);
        this.itensFiltrados = this.itensFiltrados.filter(a => a.id !== id);
        this.cdr.detectChanges();
      }
    } catch (e) {
      console.error(e);
    }
  }
}
