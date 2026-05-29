import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css'
})
export class Perfil implements OnInit {
  perfilUser: any = null;
  origem: string | null = null;
  grupoId: string | null = null;

  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  async ngOnInit(): Promise<void> {
    this.origem = this.route.snapshot.queryParamMap.get('origem');
    this.grupoId = this.route.snapshot.queryParamMap.get('grupo_id');

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      await this.carregarPerfilPorId(parseInt(idParam, 10));
    } else {
      // Se não houver ID no URL, carrega o perfil do próprio utilizador logado
      const userJson = localStorage.getItem('user');
      if (userJson) {
        const loggedInUser = JSON.parse(userJson);
        await this.carregarPerfilPorId(loggedInUser.id);
      }
    }
  }

  async carregarPerfilPorId(id: number): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://escorcio.pythonanywhere.com/ws/utilizadores/${id}/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (response.ok) {
        this.perfilUser = await response.json();
        this.cdr.detectChanges();
      }
    } catch (e) {
      console.error(e);
    }
  }
}
