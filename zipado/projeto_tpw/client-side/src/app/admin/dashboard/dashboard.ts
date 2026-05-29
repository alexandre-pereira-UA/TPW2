import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  total_users = 0;
  total_grupos = 0;
  total_filmes = 0;
  total_atores = 0;
  total_realizadores = 0;
  total_generos = 0;
  total_avaliacoes = 0;

  private cdr = inject(ChangeDetectorRef);

  async ngOnInit(): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://escorcio.pythonanywhere.com/ws/dashboard/stats/', {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        this.total_users = data.total_users;
        this.total_grupos = data.total_grupos;
        this.total_filmes = data.total_filmes;
        this.total_atores = data.total_atores;
        this.total_realizadores = data.total_realizadores;
        this.total_generos = data.total_generos;
        this.total_avaliacoes = data.total_avaliacoes;
        this.cdr.detectChanges();
      }
    } catch (e) {
      console.error(e);
    }
  }
}
