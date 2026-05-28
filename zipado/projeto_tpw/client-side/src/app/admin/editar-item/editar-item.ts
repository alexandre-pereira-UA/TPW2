import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-editar-item',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './editar-item.html',
  styleUrl: './editar-item.css'
})
export class EditarItem implements OnInit {
  modo: string = 'Criar';
  tipo: string = ''; // 'ator', 'realizador', 'genero'
  itemId: number | null = null;
  nome: string = '';

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  async ngOnInit(): Promise<void> {
    const tipoParam = this.route.snapshot.paramMap.get('tipo');
    const idParam = this.route.snapshot.paramMap.get('id');

    if (tipoParam) {
      this.tipo = tipoParam;
    }

    if (idParam) {
      this.modo = 'Editar';
      this.itemId = parseInt(idParam, 10);
      await this.carregarDadosItem();
    }
  }

  async carregarDadosItem(): Promise<void> {
    try {
      const urlPlural = this.tipo === 'ator' ? 'atores' : (this.tipo === 'genero' ? 'generos' : 'realizadores');
      const response = await fetch(`http://localhost:8000/ws/${urlPlural}/${this.itemId}/`);
      if (response.ok) {
        const data = await response.json();
        this.nome = data.nome;
        this.cdr.detectChanges();
      }
    } catch (e) {
      console.error(e);
    }
  }

  async onSubmit(): Promise<void> {
    const token = localStorage.getItem('token');
    const urlPlural = this.tipo === 'ator' ? 'atores' : (this.tipo === 'genero' ? 'generos' : 'realizadores');
    const url = this.itemId
      ? `http://localhost:8000/ws/${urlPlural}/editar/${this.itemId}/`
      : `http://localhost:8000/ws/${urlPlural}/novo/`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({ nome: this.nome })
      });

      if (response.ok) {
        this.router.navigate([`/admin/${urlPlural}`]);
      } else {
        alert('Erro ao guardar alterações.');
      }
    } catch (e) {
      console.error(e);
    }
  }
}
