import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Realizador } from '../../filme';
import { ToastService } from '../../services/toast';

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

  private toastService = inject(ToastService);
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

  apagarRealizador(id: number): void {
    this.toastService.askConfirmation('Tem a certeza que deseja apagar este realizador?', () => {
      this.executarApagarRealizador(id);
    });
  }

  async executarApagarRealizador(id: number): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://escorcio.pythonanywhere.com/ws/realizadores/apagar/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` }
      });
      if (response.ok) {
        this.itens = this.itens.filter(r => r.id !== id);
        this.itensFiltrados = this.itensFiltrados.filter(r => r.id !== id);
        this.toastService.show('Realizador removido com sucesso.', 'success');
        this.cdr.detectChanges();
      }
    } catch (e) {
      console.error(e);
    }
  }
}
