import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Filme } from '../filme';
import { FilmeService } from '../services/filme';

@Component({
  selector: 'app-detalhe-filme',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './detalhe-filme.html',
  styleUrl: './detalhe-filme.css'
})
export class DetalheFilme implements OnInit {
  filme: any = null;
  isLoggedIn = false;
  isSuperuser = false;
  isStaff = false; // Novo Estado para o Staff
  userId: number | null = null;
  isModerador = false;
  origem: string | null = null;

  notaSelecionada: number = 0;
  novoComentario: string = '';
  minhaAvaliacao: any = null;
  outrasAvaliacoes: any[] = [];

  private route = inject(ActivatedRoute);
  private filmeService = inject(FilmeService);
  private cdr = inject(ChangeDetectorRef);

  async ngOnInit(): Promise<void> {
    this.origem = this.route.snapshot.queryParamMap.get('origem'); // Lê a origem de onde veio!
    this.checkLoginStatus();
    await this.carregarDetalhes();
  }

checkLoginStatus(): void {
  const token = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');
  if (token && userJson) {
    this.isLoggedIn = true;
    const user = JSON.parse(userJson);
    this.userId = user.id;
    this.isSuperuser = user.is_superuser;
    this.isStaff = user.is_staff || user.is_superuser;

    // Ativa se for moderador (tem a permissão delete_avaliacao no Django)
    this.isModerador = user.is_moderador || user.is_superuser;
  }
}

  async carregarDetalhes(): Promise<void> {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = parseInt(idParam, 10);
      this.filme = await this.filmeService.getFilme(id);

      if (this.filme && this.filme.avaliacoes) {
        this.minhaAvaliacao = this.filme.avaliacoes.find((av: any) => av.utilizador.id === this.userId);
        this.outrasAvaliacoes = this.filme.avaliacoes.filter((av: any) => av.utilizador.id !== this.userId);

        if (this.minhaAvaliacao) {
          this.notaSelecionada = this.minhaAvaliacao.nota;
          this.novoComentario = this.minhaAvaliacao.comentario;
        }
      }
      this.cdr.detectChanges();
    }
  }

  selecionarNota(valor: number): void {
    this.notaSelecionada = valor;
    this.cdr.detectChanges();
  }

  async submeterCritica(): Promise<void> {
    if (this.notaSelecionada === 0) {
      alert('Por favor, selecione uma classificação (estrelas).');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://escorcio.pythonanywhere.com/ws/filmes/${this.filme.id}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({ nota: this.notaSelecionada, comentario: this.novoComentario })
      });

      if (response.ok) {
        await this.carregarDetalhes();
      }
    } catch (e) {
      console.error(e);
    }
  }

  async apagarMinhaCritica(): Promise<void> {
    if (!confirm('Deseja apagar a sua crítica?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://escorcio.pythonanywhere.com/ws/filmes/${this.filme.id}/comentario/apagar/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` }
      });
      if (response.ok) {
        this.minhaAvaliacao = null;
        this.notaSelecionada = 0;
        this.novoComentario = '';
        await this.carregarDetalhes();
      }
    } catch (e) {
      console.error(e);
    }
  }

  async apagarCriticaComoModerador(id: number): Promise<void> {
    if (!confirm('Apagar comentário como moderador?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://escorcio.pythonanywhere.com/ws/avaliacoes/apagar/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` }
      });
      if (response.ok) {
        await this.carregarDetalhes();
      }
    } catch (e) {
      console.error(e);
    }
  }
}
