import { Routes } from '@angular/router';
import { ListaFilmes } from './lista-filmes/lista-filmes';
import { DetalheFilme } from './detalhe-filme/detalhe-filme';
import { Login } from './login/login';
import { Registo } from './registo/registo';
import { Favoritos } from './favoritos/favoritos';
import { Guardados } from './guardados/guardados';
import { Perfil } from './perfil/perfil';                 // Import do Perfil
import { EditarPerfil } from './editar-perfil/editar-perfil'; // Import de Editar Perfil
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
import { Dashboard as AdminDashboard } from './admin/dashboard/dashboard'; // Import do Painel Admin
import { AdicionarFilme as AdminAdicionarFilme } from './admin/adicionar-filme/adicionar-filme'; // Import de Adicionar Filme

export const routes: Routes = [
  // Rotas de Utilizador Comum
  { path: '', component: ListaFilmes },
  { path: 'filme/:id', component: DetalheFilme },
  { path: 'login', component: Login },
  { path: 'registo', component: Registo },
  { path: 'favoritos', component: Favoritos },
  { path: 'guardados', component: Guardados },
  { path: 'perfil', component: Perfil },               // Ver próprio perfil
  { path: 'perfil/:id', component: Perfil },           // Ver perfil de utilizadores por ID (Administradores)
  { path: 'perfil/editar/:id', component: EditarPerfil }, // Editar dados do perfil

  // Painel Administrativo Geral (Dashboard)
  { path: 'admin/dashboard', component: AdminDashboard }, // Nova Rota do Dashboard Admin

  // Rotas Administrativas de Listagem
  { path: 'admin/filmes', component: AdminFilmes },
  { path: 'admin/atores', component: AdminAtores },
  { path: 'admin/avaliacoes', component: AdminAvaliacoes },
  { path: 'admin/generos', component: AdminGeneros },
  { path: 'admin/realizadores', component: AdminRealizadores },
  { path: 'admin/grupos', component: AdminGrupos },
  { path: 'admin/utilizadores', component: AdminUtilizadores },

  // Rotas de Adição e Edição de Filmes (Admin)
  { path: 'admin/filmes/novo', component: AdminAdicionarFilme }, // Novo Filme
  { path: 'admin/filmes/editar/:id', component: AdminAdicionarFilme }, // Editar Filme

  // Rotas de Detalhe e Edição de Grupos
  { path: 'admin/grupos/novo', component: AdminEditarGrupo },
  { path: 'admin/grupos/editar/:id', component: AdminEditarGrupo },
  { path: 'admin/grupos/:id', component: AdminDetalheGrupo },

  // Rotas de Edição Genérica (Ator, Realizador, Género)
  { path: 'admin/criar/:tipo', component: AdminEditarItem },
  { path: 'admin/editar/:tipo/:id', component: AdminEditarItem }
];
