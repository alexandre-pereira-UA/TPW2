import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-adicionar-filme',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './adicionar-filme.html',
  styleUrl: './adicionar-filme.css'
})
export class AdicionarFilme implements OnInit {
  modo: string = 'Adicionar';
  filmeId: number | null = null;
  origem: string | null = null; 

  titulo: string = '';
  data_lancamento: string = '';
  sinopse: string = '';
  cartaz: string = '';
  realizador_id: any = '';
  generos_selecionados: any[] = [];
  atores_selecionados: any[] = [];

  realizadores: any[] = [];
  todosGeneros: any[] = [];
  todosAtores: any[] = [];

  mostrarAtoresDropdown: boolean = false;
  mostrarGenerosDropdown: boolean = false;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  async ngOnInit(): Promise<void> {
    await this.carregarAuxiliares();
    this.origem = this.route.snapshot.queryParamMap.get('origem');

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.modo = 'Editar';
      this.filmeId = parseInt(idParam, 10);
      await this.carregarFilme(this.filmeId);
    }
  }

  async carregarAuxiliares(): Promise<void> {
    try {
      const resRealizadores = await fetch('https://escorcio.pythonanywhere.com/ws/realizadores/');
      const resGeneros = await fetch('https://escorcio.pythonanywhere.com/ws/generos/');
      const resAtores = await fetch('https://escorcio.pythonanywhere.com/ws/atores/');

      this.realizadores = await resRealizadores.json();
      this.todosGeneros = await resGeneros.json();
      this.todosAtores = await resAtores.json();
      this.cdr.detectChanges();
    } catch (e) {
      console.error(e);
    }
  }

  async carregarFilme(id: number): Promise<void> {
    try {
      const response = await fetch(`https://escorcio.pythonanywhere.com/ws/filmes/${id}/`);
      if (response.ok) {
        const data = await response.json();
        this.titulo = data.titulo;
        this.data_lancamento = data.data_lancamento;
        this.sinopse = data.sinopse || '';
        this.cartaz = data.cartaz || '';
        this.realizador_id = data.realizador.id;
        this.generos_selecionados = data.generos.map((g: any) => g.id);
        this.atores_selecionados = data.atores.map((a: any) => a.id);
        this.cdr.detectChanges();
      }
    } catch (e) {
      console.error(e);
    }
  }

  getAtorNome(id: any): string {
    const ator = this.todosAtores.find(a => a.id == id);
    return ator ? ator.nome : '';
  }

  adicionarAtor(id: any): void {
    const numId = Number(id);
    if (!this.atores_selecionados.includes(numId)) {
      this.atores_selecionados.push(numId);
    }
    this.mostrarAtoresDropdown = false;
    this.cdr.detectChanges();
  }

  removerAtor(id: any): void {
    this.atores_selecionados = this.atores_selecionados.filter(aId => aId != id);
    this.cdr.detectChanges();
  }

  getGeneroNome(id: any): string {
    const genero = this.todosGeneros.find(g => g.id == id);
    return genero ? genero.nome : '';
  }

  adicionarGenero(id: any): void {
    const numId = Number(id);
    if (!this.generos_selecionados.includes(numId)) {
      this.generos_selecionados.push(numId);
    }
    this.mostrarGenerosDropdown = false;
    this.cdr.detectChanges();
  }

  removerGenero(id: any): void {
    this.generos_selecionados = this.generos_selecionados.filter(gId => gId != id);
    this.cdr.detectChanges();
  }

  async onSubmit(): Promise<void> {
    const token = localStorage.getItem('token');
    const url = this.filmeId
      ? `https://escorcio.pythonanywhere.com/ws/filmes/editar/${this.filmeId}/`
      : 'https://escorcio.pythonanywhere.com/ws/filmes/novo/';

    const payload = {
      titulo: this.titulo,
      data_lancamento: this.data_lancamento,
      sinopse: this.sinopse,
      cartaz: this.cartaz,
      realizador: Number(this.realizador_id),
      generos: this.generos_selecionados.map(Number),
      atores: this.atores_selecionados.map(Number)
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        if (this.origem === 'catalogo' && this.filmeId) {
          this.router.navigate([`/filme/${this.filmeId}`]);
        } else {
          this.router.navigate(['/admin/filmes']);
        }
      } else {
        alert('Erro ao guardar o filme.');
      }
    } catch (e) {
      console.error(e);
    }
  }
}
