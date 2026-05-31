import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../services/toast'; // Import do Toast de notificações persistentes

@Component({
  selector: 'app-editar-perfil',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './editar-perfil.html',
  styleUrl: './editar-perfil.css'
})
export class EditarPerfil implements OnInit {
  userId: number | null = null;
  username = '';
  first_name = '';
  last_name = '';
  email = '';
  password = '';
  grupoSelecionado: string = '';
  grupos: any[] = [];
  currentUser: any = null;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private toastService = inject(ToastService); // Injeta o serviço de Toasts

  async ngOnInit(): Promise<void> {
    // Deteta dados do utilizador ativo logado localmente
    const userJson = localStorage.getItem('user');
    if (userJson) {
      this.currentUser = JSON.parse(userJson);
    }

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.userId = parseInt(idParam, 10);
      await this.carregarPerfil();
      if (this.currentUser?.is_superuser) {
        await this.carregarGrupos();
      }
    }
  }

  async carregarPerfil(): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://escorcio.pythonanywhere.com/ws/utilizadores/${this.userId}/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        this.username = data.username;
        this.first_name = data.first_name;
        this.last_name = data.last_name;
        this.email = data.email;
        this.grupoSelecionado = data.groups && data.groups.length > 0 ? data.groups[0].id : '';
        this.cdr.detectChanges();
      }
    } catch (e) {
      console.error(e);
    }
  }

  async carregarGrupos(): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://escorcio.pythonanywhere.com/ws/grupos/', {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (response.ok) {
        this.grupos = await response.json();
        this.cdr.detectChanges();
      }
    } catch (e) {
      console.error(e);
    }
  }

  async onSubmit(): Promise<void> {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`https://escorcio.pythonanywhere.com/ws/utilizadores/editar/${this.userId}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({
          username: this.username,
          first_name: this.first_name,
          last_name: this.last_name,
          email: this.email,
          password: this.password,
          grupo: this.grupoSelecionado
        })
      });

      if (response.ok) {
        // Se o utilizador atualizou o próprio perfil, atualiza os dados em cache local
        if (this.currentUser && this.currentUser.id === this.userId) {
          const updatedUser = { ...this.currentUser, username: this.username };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        this.toastService.showPersistent('Perfil atualizado com sucesso!', 'success');

        window.location.href = `/perfil/${this.userId}`;
      } else {
        alert('Erro ao atualizar perfil.');
      }
    } catch (e) {
      console.error(e);
    }
  }
}
