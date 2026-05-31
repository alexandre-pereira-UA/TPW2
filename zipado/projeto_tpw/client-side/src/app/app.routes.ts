import { Routes, Router } from '@angular/router';
import { inject } from '@angular/core'; // Necessário para injetar o router no Guard dinâmico

import { ListaFilmes } from './lista-filmes/lista-filmes';
import { DetalheFilme } from './detalhe-filme/detalhe-filme';
import { Login } from './login/login';
import { Registo } from './registo/registo';
import { Favoritos } from './favoritos/favoritos';
import { Guardados } from './guardados/guardados';
import { Perfil } from './perfil/perfil';
import { EditarPerfil } from './editar-perfil/editar-perfil';
import { Filmes as AdminFilmes } from './admin/filmes/filmes';
import { Atores as AdminAtores } from './admin/atores/atores';
import { Avaliacoes as AdminAvaliacoes } from './admin/avaliacoes/avaliacoes';
import { Generos as AdminGeneros } from './admin/generos/generos';
import { Realizadores as AdminRealizadores } from './admin/realizadores/realizadores';
import { Grupos as AdminGrupos } from './admin/grupos/grupos';
import { Utilizadores as AdminUtilizadores } from './admin/utilizadores/utilizadores';
import { DetalheGrupo as AdminDetalheGrupo } from './admin/detalhe-grupo/detalhe-grupo';
import { EditarGrupo as AdminEditarGrupo } from './admin/editar-grupo/editar-grupo';
import { EditarItem as AdminEditarItem } from './admin/editar-item/editar-item';
import { Dashboard as AdminDashboard } from './admin/dashboard/dashboard';
import { AdicionarFilme as AdminAdicionarFilme } from './admin/adicionar-filme/adicionar-filme';

// NOVO: Guarda de Rotas Funcional para proteger ecrãs de Administração
// Substitua apenas a função "adminGuard" (perto da linha 25) por esta:

// Procure por "const adminGuard = () => {" no topo de app.routes.ts e substitua por esta:

const adminGuard = () => {
  const router = inject(Router);
  const userJson = localStorage.getItem('user');

  if (userJson) {
    const user = JSON.parse(userJson);
    // CORRIGIDO: Valida is_staff_custom em vez de is_staff!
    if (user.is_staff_custom || user.is_superuser) {
      return true;
    }
  }

  // Se tentar aceder sem ser admin: limpa o login e força ir para o login
  localStorage.removeItem('token');
  localStorage.removeItem('user');

  window.location.href = '/login';
  return false;
};

export const routes: Routes = [
  // Rotas Públicas / Utilizador Comum
  { path: '', component: ListaFilmes },
  { path: 'filme/:id', component: DetalheFilme },
  { path: 'login', component: Login },
  { path: 'registo', component: Registo },
  { path: 'favoritos', component: Favoritos },
  { path: 'guardados', component: Guardados },
  { path: 'perfil', component: Perfil },
  { path: 'perfil/:id', component: Perfil },
  { path: 'perfil/editar/:id', component: EditarPerfil },

  // Rotas Administrativas Protegidas pelo "adminGuard" (Nova segurança do TP2!)
  { path: 'admin/dashboard', component: AdminDashboard, canActivate: [adminGuard] },
  { path: 'admin/filmes', component: AdminFilmes, canActivate: [adminGuard] },
  { path: 'admin/filmes/novo', component: AdminAdicionarFilme, canActivate: [adminGuard] },
  { path: 'admin/filmes/editar/:id', component: AdminAdicionarFilme, canActivate: [adminGuard] },
  { path: 'admin/atores', component: AdminAtores, canActivate: [adminGuard] },
  { path: 'admin/avaliacoes', component: AdminAvaliacoes, canActivate: [adminGuard] },
  { path: 'admin/generos', component: AdminGeneros, canActivate: [adminGuard] },
  { path: 'admin/realizadores', component: AdminRealizadores, canActivate: [adminGuard] },
  { path: 'admin/grupos', component: AdminGrupos, canActivate: [adminGuard] },
  { path: 'admin/grupos/novo', component: AdminEditarGrupo, canActivate: [adminGuard] },
  { path: 'admin/grupos/editar/:id', component: AdminEditarGrupo, canActivate: [adminGuard] },
  { path: 'admin/grupos/:id', component: AdminDetalheGrupo, canActivate: [adminGuard] },
  { path: 'admin/utilizadores', component: AdminUtilizadores, canActivate: [adminGuard] },
  { path: 'admin/criar/:tipo', component: AdminEditarItem, canActivate: [adminGuard] },
  { path: 'admin/editar/:tipo/:id', component: AdminEditarItem, canActivate: [adminGuard] }
];
