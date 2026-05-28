import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FilmeService } from '../services/filme';

@Component({
  selector: 'app-guardados',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './guardados.html',
  styleUrl: './guardados.css'
})
export class Guardados implements OnInit {
  guardados: any[] = [];

  private filmeService = inject(FilmeService);
  private cdr = inject(ChangeDetectorRef);

  async ngOnInit(): Promise<void> {
    this.guardados = await this.filmeService.getGuardados();
    this.cdr.detectChanges();
  }

  // Remove da lista e atualiza o ecrã instantaneamente
  async removerGuardado(filmeId: number): Promise<void> {
    const res = await this.filmeService.toggleGuardado(filmeId);
    if (res) {
      this.guardados = this.guardados.filter(g => g.filme.id !== filmeId);
      this.cdr.detectChanges();
    }
  }
}
