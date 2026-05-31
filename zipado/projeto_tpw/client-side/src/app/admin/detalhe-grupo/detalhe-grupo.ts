import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ToastService } from '../../services/toast';


@Component({
  selector: 'app-detalhe-grupo',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detalhe-grupo.html',
  styleUrl: './detalhe-grupo.css'
})
export class DetalheGrupo implements OnInit {
  grupo: any = null;
  utilizadores: any[] = [];
  permissoes: any[] = [];


  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  async ngOnInit(): Promise<void> {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = parseInt(idParam, 10);
      await this.carregarDetalhesGrupo(id);
    }
  }

  async carregarDetalhesGrupo(id: number): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://escorcio.pythonanywhere.com/ws/grupos/${id}/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        this.grupo = data.grupo;
        this.utilizadores = data.utilizadores;
        this.permissoes = data.permissoes;
        this.cdr.detectChanges();
      }
    } catch (e) {
      console.error(e);
    }
  }

  removerUtilizadorGrupo(userId: number): void {
    this.toastService.askConfirmation('Deseja remover este utilizador do grupo de forma definitiva?', () => {
      this.executarRemoverUtilizadorGrupo(userId);
    });
  }

  async executarRemoverUtilizadorGrupo(userId: number): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://escorcio.pythonanywhere.com/ws/grupos/${this.grupo.id}/remover/${userId}/`, {
        method: 'POST',
        headers: { 'Authorization': `Token ${token}` }
      });
      if (response.ok) {
        this.utilizadores = this.utilizadores.filter(u => u.id !== userId);
        this.toastService.show('Utilizador removido do grupo.', 'success');
        this.cdr.detectChanges();
      }
    } catch (e) {
      console.error(e);
    }
  }
}
