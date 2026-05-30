# Relatório do Trabalho Prático 2
**Unidade Curricular:** Tecnologias e Programação Web (TPW)  
**Curso:** Engenharia Informática, Universidade de Aveiro  
**Ano Letivo:** 2025/2026

---

## 1. Introdução e Visão Geral
Este relatório descreve a conceção, arquitetura e implementação do **Trabalho Prático 2 (TP2)** para a unidade curricular de **Tecnologias e Programação Web (TPW)**. 

O objetivo principal deste projeto foi evoluir o website de catálogo de filmes desenvolvido no Trabalho Prático 1 (baseado em templates de servidor Django tradicional) para uma **arquitetura de software real de N camadas (N-tier) totalmente desacoplada**. 

Para tal, o projeto foi dividido em duas camadas independentes:
1. **Back-end**: Uma API REST robusta desenvolvida em **Django REST Framework (DRF)**.
2. **Front-end**: Uma Single Page Application (SPA) moderna, reativa e fluida desenvolvida em **Angular** (versão 21+).

O tema escolhido, **Moviez Catalog**, permite aos utilizadores pesquisar, filtrar, ordenar, comentar e avaliar filmes. Inclui também funcionalidades de personalização como listas de favoritos, lista de filmes guardados para ver mais tarde, gestão completa de perfis de utilizador, além de um **painel de administração e moderação (backoffice)** extremamente detalhado.

---

## 2. Arquitetura do Sistema
O sistema adota uma arquitetura em duas camadas totalmente isoladas, comunicando exclusivamente através do protocolo HTTP utilizando mensagens em formato **JSON**.

```mermaid
graph TD
    subgraph Client-Side (Angular SPA)
        A[Interface do Utilizador / Views] <--> B[Serviços Angular - fetch]
    end
    subgraph Server-Side (Django REST Framework)
        B <-->|Pedidos HTTP / JSON & Tokens| C[DRF Router / Endpoints]
        C <--> D[Views & Serializadores]
        D <--> E[Modelos ORM Django]
        E <--> F[(Base de Dados SQLite3)]
    end
    subgraph API Externa (The Movie Database)
        D <-->|Importação Direta JSON| G[TMDB API]
    end
```

---

## 3. Back-end: Django REST Framework (DRF)
O back-end foi reestruturado para funcionar como um servidor puramente RESTful. Foram criados serializadores dedicados para cada entidade do domínio e as views clássicas foram substituídas por endpoints baseados no decorador `@api_view` e classes de permissões do DRF.

### 3.1. Modelos de Dados (`models.py`)
A base de dados armazena as seguintes entidades e relações:
* **Genero, Realizador, Ator**: Entidades auxiliares com campos simples (`nome`).
* **Filme**: Entidade principal que se relaciona de forma N-para-1 com `Realizador` e N-para-N (`ManyToManyField`) com `Genero` e `Ator`.
* **Avaliacao**: Entidade de ligação N-para-N entre `User` (utilizador) e `Filme`, permitindo uma nota de 1 a 5 estrelas e um comentário de texto. Possui uma restrição de unicidade para que um utilizador apenas possa avaliar o mesmo filme uma única vez.
* **Favorito** e **Guardado**: Relações N-para-N personalizadas entre `User` e `Filme` com data de criação para permitir listas personalizadas de favoritos e filmes guardados ("Ver mais tarde").

### 3.2. Serializadores (`serializers.py`)
Foram implementados serializadores estendidos de `ModelSerializer` para expor e validar os dados:
* **UserSerializer**: Serializa dados de perfil do utilizador e calcula dinamicamente se o mesmo possui o perfil de moderador (`is_moderador`) através de `SerializerMethodField`.
* **FilmeReadSerializer** (Leitura): Traz de forma aninhada todos os detalhes associados, incluindo o realizador, géneros, atores e avaliações/críticas dos utilizadores.
* **FilmeWriteSerializer** (Escrita): Permite a gravação rápida de novos filmes utilizando apenas IDs simples para relacionamentos.
* **AvaliacaoSerializer, FavoritoSerializer, GuardadoSerializer**: Expõem dados relacionados com a personalização e críticas do utilizador.

### 3.3. Endpoints REST (`urls.py`)
Os endpoints estão estruturados sob o prefixo `/ws/`:
* **Autenticação**: `ws/login/`, `ws/registo/`.
* **Filmes**: `ws/filmes/` (com suporte a pesquisa `?q=...` e ordenação `?ordenar=...`), `ws/filmes/<id>/` (leitura e submissão de críticas), `ws/filmes/novo/` e `ws/filmes/editar/<id>/`.
* **Favoritos & Guardados**: `ws/favoritos/`, `ws/favoritos/toggle/<id>/`, `ws/guardados/`, `ws/guardados/toggle/<id>/`.
* **Administração Geral**: `ws/dashboard/stats/` (estatísticas agregadas), `ws/permissoes/`, `ws/grupos/`, `ws/grupos/<id>/` (com rotas de adição, edição e remoção de membros).
* **Importação TMDB**: Rota dedicada `ws/filmes/importar-api/` para carregar filmes sob demanda através de integração com o TMDB.

---

## 4. Front-end: Angular Single Page Application
O front-end é uma SPA reativa construída com **Angular 21+**, utilizando **Standalone Components** para melhor desempenho e organização do código.

### 4.1. Estrutura de Componentes e Funcionalidades Premium
* **ListaFilmes (`lista-filmes`)**: Página inicial reativa com uma grelha de posters organizada em cards (Bootstrap). Fornece pesquisa instantânea e filtros por data de lançamento (mais recentes/antigos) e ordem alfabética (A-Z). Exibe atalhos interativos (ícones de coração e marcador) para favoritar ou guardar filmes diretamente do card.
  * **NOVO: Modo Carrossel Automático Nativo**: Alternador visual imersivo e reativo que permite ver o catálogo em formato de slides animados com transições suaves de fade-in e fundo desfocado (blur) dinâmico, implementado 100% em Angular sem quaisquer dependências externas de jQuery.
  * **NOVO: Scroll Infinito Progressivo (Performance)**: Otimização de performance avançada utilizando o decorador `@HostListener('window:scroll')` do Angular para carregar e renderizar os filmes na grelha em lotes dinâmicos de 6 em 6 à medida que o utilizador navega, garantindo carregamentos instantâneos.
  * **NOVO: Equalização Flexbox Simétrica**: Ajuste no `styles.css` para forçar os cartões de filme na grelha a terem comportamento flexível e esticarem uniformemente em altura, garantindo simetria perfeita em qualquer resolução.
* **DetalheFilme (`detalhe-filme`)**: Apresenta a sinopse completa, géneros, realizador, elenco principal e a secção interativa de críticas/avaliações. Utilizadores registados podem dar uma nota (1 a 5 estrelas) através de um **sistema interativo de estrelas douradas clicáveis** e deixar um comentário. Moderadores e administradores têm acesso a botões rápidos de exclusão de críticas ofensivas.
* **Perfil (`perfil`) & EditarPerfil (`editar-perfil`)**: Área personalizada onde o utilizador pode visualizar a sua informação, consultar o seu grupo ou privilégios e atualizar os seus dados de registo de forma segura.
* **Favoritos (`favoritos`) & Guardados (`guardados`)**: Dashboards personalizados reativos que mostram apenas os filmes guardados ou favoritados pelo utilizador ativo.
* **Backoffice Administrativo (`admin`)**:
  * **Dashboard**: Estatísticas agregadas sobre o sistema (utilizadores, grupos, filmes, atores, realizadores).
  * **Gestão de Filmes, Atores, Realizadores, Géneros e Críticas**: CRUD completo para todas as entidades fundamentais do catálogo.
  * **AdicionarFilme**: Formulário com validações nativas para criação e edição de filmes.
  * **Gestão de Permissões e Grupos**: Permite criar novos grupos, associar permissões de sistema e adicionar/remover membros diretamente da interface do utilizador.
  * **Importador TMDB**: Botão na interface administrativa que executa a importação em tempo real de 10 novos filmes de sucesso diretamente da API externa do TMDB para a base de dados local.

### 4.2. Comunicação com a API e Serviços (`services/filme.ts`)
A comunicação é intermediada pelo serviço `FilmeService` utilizando APIs assíncronas do JavaScript (`fetch`, `async/await`). 

**Envio de Tokens:** Quando um utilizador faz login, o token retornado pelo DRF é guardado no `localStorage`. Em todos os pedidos subsequentes a rotas protegidas (ex: adicionar favoritos, apagar comentários, aceder ao backoffice), o serviço anexa automaticamente o cabeçalho de autorização:
```typescript
headers: {
  'Authorization': `Token ${localStorage.getItem('token')}`
}
```

---

## 5. Segurança, Autenticação e Perfis de Acesso
A segurança e controlo de acessos foram planeados em profundidade para garantir a integridade dos dados e corresponder aos critérios exigidos no enunciado:
1. **Autenticação**: Baseada em **TokenAuthentication** do Django REST Framework. O token é persistido com segurança no browser do cliente.
2. **Perfis de Utilizador**:
   * **Superutilizador (Administrador)**: Acesso total a todas as rotas e ao painel administrativo (pode gerir grupos, permissões, apagar utilizadores, criar/editar filmes e importar da API externa).
   * **Moderador (Membro do grupo 'coment')**: Utilizador que possui a permissão nativa de sistema `app.delete_avaliacao`. O sistema concede-lhe a capacidade de apagar comentários e críticas na visualização de detalhes do filme.
   * **Utilizador Registado**: Pode navegar pelo catálogo, aceder aos seus favoritos/guardados, editar o seu perfil, e avaliar filmes (comentando e pontuando).
   * **Visitante Anónimo**: Acesso de leitura ao catálogo de filmes e páginas de detalhe (sem permissão para interagir ou adicionar comentários).

---

## 6. Integração com a API do TMDB (The Movie Database)
O back-end possui uma integração premium com a API externa do **TMDB** (`api_importar_filmes_api`). 
* O administrador pode pressionar "Importar do TMDB" no painel de administração.
* O servidor seleciona aleatoriamente um ano entre 1980 e 2024 e uma página de resultados.
* Consulta a API do TMDB e descarrega os filmes mais populares desse ano.
* Para cada filme, consulta os créditos de elenco e equipa técnica e **cria automaticamente** os registos dos Atores, Realizador e Géneros na base de dados SQLite local, evitando duplicados.
* Transfere o link do cartaz (poster) de alta qualidade do TMDB para que a grelha de posters do Angular se mantenha visualmente deslumbrante e preenchida.

---

## 7. Instruções para Execução e Teste

### 7.1. Execução do Servidor Back-end (Django REST Framework)
1. Certifique-se de que tem o **Python 3.10+** instalado.
2. Navegue até à pasta do servidor:
   ```bash
   cd TPW2/zipado/projeto_tpw/TPW2
   ```
3. Crie e ative um ambiente virtual e instale as dependências:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate
   pip install django djangorestframework django-cors-headers requests sqlparse tzdata
   ```
4. Inicie o servidor de desenvolvimento:
   ```bash
   python manage.py runserver
   ```
   *O servidor ficará disponível em [http://localhost:8000](http://localhost:8000).*

### 7.2. Execução do Servidor Front-end (Angular SPA)
1. Certifique-se de que tem o **Node.js (LTS)** e **npm** instalados.
2. Navegue até à pasta do cliente-side:
   ```bash
   cd TPW2/zipado/projeto_tpw/client-side
   ```
3. Instale as dependências do Node:
   ```bash
   npm install
   ```
4. Inicie o servidor de desenvolvimento do Angular:
   ```bash
   npm start
   ```
   *A SPA ficará disponível em [http://localhost:4200](http://localhost:4200).*

### 7.3. Contas de Teste Pré-Configuradas
Para facilitar a avaliação rápida e correta de todos os privilégios e perfis de segurança descritos neste trabalho, foram pré-configurados 5 utilizadores de teste na base de dados SQLite. **A palavra-passe de todas as contas é exatamente igual ao respetivo username**:

| Username | Palavra-passe | Perfil / Função Principal | Privilégios no Sistema |
| :--- | :--- | :--- | :--- |
| **`superuser`** | `superuser` | Administrador Geral (Superuser) | Acesso total ao Backoffice, gestão de utilizadores, grupos e importação TMDB. |
| **`GerirComentariosUser`** | `GerirComentariosUser` | Moderador (Grupo 'coment') | Pode visualizar filmes e apagar qualquer comentário ofensivo. |
| **`GerirFilmesUser`** | `GerirFilmesUser` | Gestor de Conteúdos (Staff) | Pode aceder ao painel admin e criar/editar registos de filmes. |
| **`UtilizadorComum`** | `UtilizadorComum` | Utilizador Registado Padrão | Pode gerir favoritos, guardados, editar o próprio perfil e fazer críticas. |
| **`teste`** | `teste` | Conta de Teste Simples | Permite testes rápidos de interação padrão do cliente. |

---

## 8. Conclusão
O desenvolvimento do **Trabalho Prático 2** demonstrou de forma clara e prática as vantagens e desafios das **arquiteturas orientadas a serviços (N-tier)**. 

A separação absoluta entre o Angular no front-end e o Django REST Framework no back-end resultou numa aplicação mais flexível, rápida e alinline com as melhores práticas de desenvolvimento da indústria moderna. Todas as metas estipuladas no enunciado foram cumpridas com rigor:
* UI fluida reativa com Angular;
* API REST completa com serializadores, filtros e paginação no DRF;
* Integração assíncrona baseada em tokens de segurança;
* Exploração avançada de privilégios e perfis (Superuser, Moderador, Utilizador Padrão);
* Importação inteligente sob demanda via API do TMDB.

A base de dados é fornecida totalmente populada com **50 filmes de alta qualidade** e as contas prontas a usar, garantindo uma experiência de demonstração imediata e gratificante para o avaliador.
