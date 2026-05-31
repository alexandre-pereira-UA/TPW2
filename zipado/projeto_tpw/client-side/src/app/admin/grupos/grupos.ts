import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../services/toast';


@Component({
  selector: 'app-grupos',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './grupos.html',
  styleUrl: './grupos.css'
})
export class Grupos implements OnInit {
  grupos: any[] = [];
  gruposFiltrados: any[] = [];
  query: string = '';

  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  async ngOnInit(): Promise<void> {
    await this.carregarGrupos();
  }

  async carregarGrupos(): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://escorcio.pythonanywhere.com/ws/grupos/', {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (response.ok) {
        this.grupos = await response.json();
        this.gruposFiltrados = [...this.grupos];
        this.cdr.detectChanges();
      }
    } catch (e) {
      console.error(e);
    }
  }

  onSearch(): void {
    const q = this.query.toLowerCase().trim();
    if (!q) {
      this.gruposFiltrados = [...this.grupos];
    } else {
      this.gruposFiltrados = this.grupos.filter(g => g.name.toLowerCase().includes(q));
    }
    this.cdr.detectChanges();
  }

  limparPesquisa(): void {
    this.query = '';
    this.gruposFiltrados = [...this.grupos];
    this.cdr.detectChanges();
  }

  apagarGrupo(id: number): void {
    this.toastService.askConfirmation('Tem a certeza que deseja eliminar este grupo de permissões?', () => {
      this.executarApagarGrupo(id);
    });
  }

  async executarApagarGrupo(id: number): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://escorcio.pythonanywhere.com/ws/grupos/apagar/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` }
      });
      if (response.ok) {
        this.grupos = this.grupos.filter(g => g.id !== id);
        this.gruposFiltrados = this.gruposFiltrados.filter(g => g.id !== id);
        this.toastService.show('Grupo removido com sucesso.', 'success');
        this.cdr.detectChanges();
      }
    } catch (e) {
      console.error(e);
    }
  }
}
