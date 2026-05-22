import { Routes } from '@angular/router';
import { ListaFilmes } from './lista-filmes/lista-filmes';
import { DetalheFilme } from './detalhe-filme/detalhe-filme';

export const routes: Routes = [
  { path: '', component: ListaFilmes }, // Página inicial (Lista)
  { path: 'filme/:id', component: DetalheFilme } // Página de Detalhes
];
