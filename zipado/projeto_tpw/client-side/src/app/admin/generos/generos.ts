import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Genero } from '../../filme'; // Localizado em src/app/filme.ts

@Component({
  selector: 'app-generos',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './generos.html',
  styleUrl: './generos.css'
})
export class Generos implements OnInit {
  itens: Genero[] = [];
  itensFiltrados: Genero[] = [];
  query: string = '';

  private cdr = inject(ChangeDetectorRef);

  async ngOnInit(): Promise<void> {
    await this.carregarGeneros();
  }

  async carregarGeneros(): Promise<void> {
    try {
      const response = await fetch('http://localhost:8000/ws/generos/');
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
      this.itensFiltrados = this.itens.filter(g => g.nome.toLowerCase().includes(q));
    }
    this.cdr.detectChanges();
  }

  limparPesquisa(): void {
    this.query = '';
    this.itensFiltrados = [...this.itens];
    this.cdr.detectChanges();
  }

  async apagarGenero(id: number): Promise<void> {
    if (!confirm('Apagar género?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/ws/generos/apagar/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` }
      });
      if (response.ok) {
        this.itens = this.itens.filter(g => g.id !== id);
        this.itensFiltrados = this.itensFiltrados.filter(g => g.id !== id);
        this.cdr.detectChanges();
      }
    } catch (e) {
      console.error(e);
    }
  }
}
