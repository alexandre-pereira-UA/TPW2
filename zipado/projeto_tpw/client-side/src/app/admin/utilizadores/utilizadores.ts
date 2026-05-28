import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-utilizadores',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './utilizadores.html',
  styleUrl: './utilizadores.css'
})
export class Utilizadores implements OnInit {
  itens: any[] = [];
  itensFiltrados: any[] = [];
  query: string = '';

  private cdr = inject(ChangeDetectorRef);

  async ngOnInit(): Promise<void> {
    await this.carregarUtilizadores();
  }

  async carregarUtilizadores(): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/ws/utilizadores/', {
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
      this.itensFiltrados = this.itens.filter(u =>
        u.username.toLowerCase().includes(q) ||
        (u.email && u.email.toLowerCase().includes(q))
      );
    }
    this.cdr.detectChanges();
  }

  limparPesquisa(): void {
    this.query = '';
    this.itensFiltrados = [...this.itens];
    this.cdr.detectChanges();
  }

  async apagarUtilizador(id: number): Promise<void> {
    if (!confirm('Apagar utilizador?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/ws/utilizadores/apagar/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` }
      });
      if (response.ok) {
        this.itens = this.itens.filter(u => u.id !== id);
        this.itensFiltrados = this.itensFiltrados.filter(u => u.id !== id);
        this.cdr.detectChanges();
      } else {
        const data = await response.json();
        alert(data.error || 'Erro ao apagar utilizador.');
      }
    } catch (e) {
      console.error(e);
    }
  }
}
