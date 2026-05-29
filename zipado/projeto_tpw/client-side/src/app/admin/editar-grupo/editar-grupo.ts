import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-editar-grupo',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './editar-grupo.html',
  styleUrl: './editar-grupo.css'
})
export class EditarGrupo implements OnInit {
  modo: string = 'Criar';
  grupoId: number | null = null;
  nome: string = '';
  todasPermissoes: any[] = [];
  permissoesSelecionadas: number[] = [];

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  async ngOnInit(): Promise<void> {
    await this.carregarTodasPermissoes();
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.modo = 'Editar';
      this.grupoId = parseInt(idParam, 10);
      await this.carregarDadosGrupo(this.grupoId);
    }
  }

  async carregarTodasPermissoes(): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://escorcio.pythonanywhere.com/ws/permissoes/', {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (response.ok) {
        this.todasPermissoes = await response.json();
        this.cdr.detectChanges();
      }
    } catch (e) {
      console.error(e);
    }
  }

  async carregarDadosGrupo(id: number): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://escorcio.pythonanywhere.com/ws/grupos/${id}/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        this.nome = data.grupo.name;
        this.permissoesSelecionadas = data.permissoes.map((p: any) => p.id);
        this.cdr.detectChanges();
      }
    } catch (e) {
      console.error(e);
    }
  }

  isPermissaoSelecionada(id: number): boolean {
    return this.permissoesSelecionadas.includes(id);
  }

  togglePermissao(id: number, event: any): void {
    if (event.target.checked) {
      this.permissoesSelecionadas.push(id);
    } else {
      this.permissoesSelecionadas = this.permissoesSelecionadas.filter(pId => pId !== id);
    }
  }

  async onSubmit(): Promise<void> {
    const token = localStorage.getItem('token');
    const url = this.grupoId
      ? `https://escorcio.pythonanywhere.com/ws/grupos/editar/${this.grupoId}/`
      : 'https://escorcio.pythonanywhere.com/ws/grupos/novo/';

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({ nome: this.nome, permissoes: this.permissoesSelecionadas })
      });

      if (response.ok) {
        this.router.navigate(['/admin/grupos']);
      } else {
        alert('Erro ao guardar o grupo.');
      }
    } catch (e) {
      console.error(e);
    }
  }
}
