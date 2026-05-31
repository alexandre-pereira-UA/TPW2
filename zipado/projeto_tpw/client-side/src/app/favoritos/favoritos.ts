import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FilmeService } from '../services/filme';

@Component({
  selector: 'app-favoritos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './favoritos.html',
  styleUrl: './favoritos.css'
})
export class Favoritos implements OnInit {
  favoritos: any[] = [];

  private filmeService = inject(FilmeService);
  private cdr = inject(ChangeDetectorRef);

  async ngOnInit(): Promise<void> {
    this.favoritos = await this.filmeService.getFavoritos();
    this.cdr.detectChanges();
  }

  async removerFavorito(filmeId: number): Promise<void> {
    const res = await this.filmeService.toggleFavorito(filmeId);
    if (res) {
      this.favoritos = this.favoritos.filter(f => f.filme.id !== filmeId);
      this.cdr.detectChanges();
    }
  }
}
