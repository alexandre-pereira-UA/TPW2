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
  isStaff = false;
  isModerador = false;
  userId: number | null = null;
  origem: string | null = null;

  // Lógica do comentário
  notaSelecionada: number = 0;
  novoComentario: string = '';
  minhaAvaliacao: any = null;
  todasAvaliacoes: any[] = [];

  private route = inject(ActivatedRoute);
  private filmeService = inject(FilmeService);
  private cdr = inject(ChangeDetectorRef);

  async ngOnInit(): Promise<void> {
    this.origem = this.route.snapshot.queryParamMap.get('origem');
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
      this.isModerador = user.is_moderador || user.is_superuser;
    }
  }

  async carregarDetalhes(): Promise<void> {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = parseInt(idParam, 10);
      this.filme = await this.filmeService.getFilme(id);

      if (this.filme && this.filme.avaliacoes) {
        // Usamos comparação flexível == para evitar conflito de tipos número/texto
        this.minhaAvaliacao = this.filme.avaliacoes.find((av: any) => av.utilizador.id == this.userId);

        this.todasAvaliacoes = [...this.filme.avaliacoes].sort((a, b) =>
          new Date(b.data_postagem).getTime() - new Date(a.data_postagem).getTime()
        );

        if (this.minhaAvaliacao) {
          this.notaSelecionada = this.minhaAvaliacao.nota;
          this.novoComentario = this.minhaAvaliacao.comentario;
        } else {
          this.notaSelecionada = 0;
          this.novoComentario = '';
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
      // ATUALIZADO PARA O LINK ONLINE DO PYTHONANYWHERE
      const response = await fetch(`https://escorcio.pythonanywhere.com/ws/filmes/${this.filme.id}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({ nota: this.notaSelecionada, comentario: this.novoComentario })
      });

      if (response.ok) {
        alert('Crítica gravada com sucesso!');
        await this.carregarDetalhes();
      } else {
        alert('Erro ao submeter crítica.');
      }
    } catch (e) {
      alert('Erro de ligação ao servidor.');
    }
  }

  async apagarMinhaCritica(): Promise<void> {
    if (!confirm('Deseja apagar a sua crítica?')) return;
    try {
      const token = localStorage.getItem('token');
      // ATUALIZADO PARA O LINK ONLINE DO PYTHONANYWHERE
      const response = await fetch(`https://escorcio.pythonanywhere.com/ws/filmes/${this.filme.id}/comentario/apagar/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` }
      });
      if (response.ok) {
        alert('A tua crítica foi removida.');
        this.minhaAvaliacao = null;
        this.notaSelecionada = 0;
        this.novoComentario = '';
        await this.carregarDetalhes();
      } else {
        alert('Erro ao apagar crítica.');
      }
    } catch (e) {
      alert('Erro de ligação ao servidor.');
    }
  }

  async apagarCriticaComoModerador(id: number): Promise<void> {
    if (!confirm('Apagar comentário como moderador?')) return;
    try {
      const token = localStorage.getItem('token');
      // ATUALIZADO PARA O LINK ONLINE DO PYTHONANYWHERE
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
