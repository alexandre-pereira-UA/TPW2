import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-historico',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './historico.html',
  styleUrl: './historico.css'
})
export class Historico implements OnInit {
  logs: any[] = [];
  logsFiltrados: any[] = [];
  query: string = '';

  private cdr = inject(ChangeDetectorRef);

  async ngOnInit(): Promise<void> {
    await this.carregarLogs();
  }

  async carregarLogs(): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      // Liga-se ao novo endpoint de produção online do PythonAnywhere
      const response = await fetch('https://escorcio.pythonanywhere.com/ws/admin/logs/', {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (response.ok) {
        this.logs = await response.json();
        this.logsFiltrados = [...this.logs];
        this.cdr.detectChanges();
      }
    } catch (e) {
      console.error(e);
    }
  }

  onSearch(): void {
    const q = this.query.toLowerCase().trim();
    if (!q) {
      this.logsFiltrados = [...this.logs];
    } else {
      this.logsFiltrados = this.logs.filter(log =>
        log.utilizador.username.toLowerCase().includes(q) ||
        log.acao.toLowerCase().includes(q)
      );
    }
    this.cdr.detectChanges();
  }

  limparPesquisa(): void {
    this.query = '';
    this.logsFiltrados = [...this.logs];
    this.cdr.detectChanges();
  }
}
