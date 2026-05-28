import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-avaliacoes',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './avaliacoes.html',
  styleUrl: './avaliacoes.css'
})
export class Avaliacoes implements OnInit {
  itens: any[] = [];
  itensFiltrados: any[] = [];
  query: string = '';

  private cdr = inject(ChangeDetectorRef);

  async ngOnInit(): Promise<void> {
    await this.carregarAvaliacoes();
  }

  async carregarAvaliacoes(): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/ws/avaliacoes/', {
        headers: { 'Authorization': `Token ${token}` }
      });
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
      this.itensFiltrados = this.itens.filter(av =>
        av.utilizador.username.toLowerCase().includes(q) ||
        av.filme.titulo.toLowerCase().includes(q) ||
        (av.comentario && av.comentario.toLowerCase().includes(q))
      );
    }
    this.cdr.detectChanges();
  }

  limparPesquisa(): void {
    this.query = '';
    this.itensFiltrados = [...this.itens];
    this.cdr.detectChanges();
  }

  async apagarAvaliacao(id: number): Promise<void> {
    if (!confirm('Eliminar crítica?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/ws/avaliacoes/apagar/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` }
      });
      if (response.ok) {
        this.itens = this.itens.filter(av => av.id !== id);
        this.itensFiltrados = this.itensFiltrados.filter(av => av.id !== id);
        this.cdr.detectChanges();
      }
    } catch (e) {
      console.error(e);
    }
  }
}
