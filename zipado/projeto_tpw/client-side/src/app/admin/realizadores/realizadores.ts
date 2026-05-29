import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Realizador } from '../../filme';

@Component({
  selector: 'app-realizadores',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './realizadores.html',
  styleUrl: './realizadores.css'
})
export class Realizadores implements OnInit {
  itens: Realizador[] = [];
  itensFiltrados: Realizador[] = [];
  query: string = '';

  private cdr = inject(ChangeDetectorRef);

  async ngOnInit(): Promise<void> {
    await this.carregarRealizadores();
  }

  async carregarRealizadores(): Promise<void> {
    try {
      const response = await fetch('https://escorcio.pythonanywhere.com/ws/realizadores/');
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
      this.itensFiltrados = this.itens.filter(r => r.nome.toLowerCase().includes(q));
    }
    this.cdr.detectChanges();
  }

  limparPesquisa(): void {
    this.query = '';
    this.itensFiltrados = [...this.itens];
    this.cdr.detectChanges();
  }

  async apagarRealizador(id: number): Promise<void> {
    if (!confirm('Apagar realizador?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://escorcio.pythonanywhere.com/ws/realizadores/apagar/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` }
      });
      if (response.ok) {
        this.itens = this.itens.filter(r => r.id !== id);
        this.itensFiltrados = this.itensFiltrados.filter(r => r.id !== id);
        this.cdr.detectChanges();
      }
    } catch (e) {
      console.error(e);
    }
  }
}
