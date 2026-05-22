import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Filme } from '../filme';
import { FilmeService } from '../services/filme';

@Component({
  selector: 'app-detalhe-filme',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detalhe-filme.html',
  styleUrl: './detalhe-filme.css'
})
export class DetalheFilme implements OnInit {
  filme: Filme | undefined = undefined;

  private route = inject(ActivatedRoute);
  private filmeService = inject(FilmeService);

  async ngOnInit(): Promise<void> {
    // Obtém o ID do filme a partir do URL (ex: /filme/5)
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = parseInt(idParam, 10);
      this.filme = await this.filmeService.getFilme(id);
    }
  }
}
