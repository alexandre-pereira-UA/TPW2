import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../services/toast';

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

  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  async ngOnInit(): Promise<void> {
    await this.carregarUtilizadores();
  }

  async carregarUtilizadores(): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://escorcio.pythonanywhere.com/ws/utilizadores/', {
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

  apagarUtilizador(id: number): void {
    this.toastService.askConfirmation('Tem a certeza que deseja apagar este utilizador de forma definitiva?', () => {
      this.executarApagarUtilizador(id);
    });
  }

  async executarApagarUtilizador(id: number): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://escorcio.pythonanywhere.com/ws/utilizadores/apagar/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` }
      });
      if (response.ok) {
        this.itens = this.itens.filter(u => u.id !== id);
        this.itensFiltrados = this.itensFiltrados.filter(u => u.id !== id);
        this.toastService.show('Utilizador removido do sistema.', 'success');
        this.cdr.detectChanges();
      } else {
        const data: any = await response.json();
        this.toastService.show(data.error || 'Erro ao apagar utilizador.', 'danger');
      }
    } catch (e) {
      console.error(e);
    }
  }

  async toggleBloqueio(id: number): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://escorcio.pythonanywhere.com/ws/utilizadores/toggle-bloqueio/${id}/`, {
        method: 'POST',
        headers: { 'Authorization': `Token ${token}` }
      });
      if (response.ok) {
        const data: any = await response.json(); 
        this.itens = this.itens.map(u => u.id === id ? { ...u, is_active: data.is_active } : u);
        this.itensFiltrados = this.itensFiltrados.map(u => u.id === id ? { ...u, is_active: data.is_active } : u);
        this.toastService.show(`Utilizador ${data.status} com sucesso!`, 'success');
        this.cdr.detectChanges();
      }
    } catch (e) {
      console.error(e);
    }
  }
}
