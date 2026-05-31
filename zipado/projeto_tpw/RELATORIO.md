# Relatório do Trabalho Prático 2
**Unidade Curricular:** Tecnologias e Programação Web (TPW)  
**Curso:** Engenharia Informática, Universidade de Aveiro  
**Ano Letivo:** 2025/2026  

### Grupo de Trabalho
* **Guilherme Escórcio** — Nº Mecanográfico: **118648**
* **Alexandre Pereira** — Nº Mecanográfico: **119871**
* **Alexandre Silva** — Nº Mecanográfico: **119583**

---

## 1. Introdução e Enquadramento
Este relatório apresenta em detalhe a conceção, decisões de arquitetura e detalhes técnicos de implementação do **Trabalho Prático 2 (TP2)** para a unidade curricular de **Tecnologias e Programação Web (TPW)**. 

O objetivo principal deste projeto consistiu em evoluir o website de catálogo de filmes desenvolvido no TP1 — que utilizava o paradigma clássico de templates renderizados no servidor com Django — para uma **arquitetura de software moderna N-Tier totalmente desacoplada**. 

Para atingir esta meta, dividimos o ecossistema em duas aplicações e servidores autónomos:
1. **Back-end (API REST)**: Desenvolvido em **Django REST Framework (DRF)**, responsável pela lógica de negócio, persistência dos dados, controlo granular de acessos e fornecimento de endpoints RESTful puros.
2. **Front-end (SPA)**: Desenvolvido em **Angular** (v21+), atuando como uma Single Page Application reativa, focada na experiência do utilizador e na fluidez da navegação.

A nossa plataforma, batizada de **Moviez Catalog**, permite aos utilizadores explorar, pesquisar, filtrar, ordenar, comentar e classificar filmes. A aplicação integra funcionalidades de personalização avançadas (como listas de favoritos, lista de filmes guardados para ver mais tarde e gestão completa de perfis de utilizador) e um **painel de administração e moderação (backoffice)** extremamente detalhado para gestão dos recursos e controlo de grupos/permissões.

---

## 2. Desenho de Arquitetura
O sistema assenta num desacoplamento absoluto em que a comunicação entre o cliente e o servidor ocorre exclusivamente através do protocolo HTTP com a troca de mensagens estruturadas em **JSON**.

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
O servidor original em Django foi inteiramente reestruturado. Eliminámos os templates HTML do lado do servidor, passando o back-end a atuar apenas como uma API RESTful. As views tradicionais foram convertidas em endpoints REST baseados no decorador `@api_view` e classes nativas de permissões do DRF.

### 3.1. Modelos de Dados (`models.py`)
A base de dados SQLite3 armazena as seguintes entidades e relações:
* **Genero, Realizador, Ator**: Modelos auxiliares contendo o nome e dados identificativos básicos.
* **Filme**: O modelo central do domínio. Tem uma relação N-para-1 com `Realizador` e relações N-para-N (`ManyToManyField`) com `Genero` e `Ator`.
* **Avaliacao**: Entidade de ligação N-para-N entre `User` (utilizador) e `Filme`. Permite atribuir uma nota inteira de 1 a 5 estrelas e um comentário escrito. Adicionámos uma restrição de unicidade na base de dados para garantir que cada utilizador apenas pode submeter uma avaliação por filme.
* **Favorito** e **Guardado**: Relações N-para-N personalizadas entre `User` e `Filme` que registam a data de criação, sustentando as listas personalizadas de cada conta.

### 3.2. Serializadores (`serializers.py`)
Criámos serializadores baseados em `ModelSerializer` para expor, formatar e validar os dados transacionados:
* **UserSerializer**: Serializa dados de perfil do utilizador e calcula dinamicamente se o mesmo possui o perfil de moderador (`is_moderador`) através de um `SerializerMethodField` que verifica os grupos do utilizador.
* **FilmeReadSerializer** (Leitura): Traz de forma aninhada (*nested serializers*) todos os detalhes associados ao filme, incluindo o realizador, géneros, atores e avaliações dos utilizadores, otimizando o número de pedidos HTTP feitos pelo cliente.
* **FilmeWriteSerializer** (Escrita): Permite a gravação rápida de novos filmes utilizando apenas IDs simples para relacionamentos, simplificando os formulários de inserção.
* **AvaliacaoSerializer, FavoritoSerializer, GuardadoSerializer**: Expõem dados relacionados com a personalização e críticas do utilizador.

### 3.3. Endpoints REST (`urls.py`)
Todos os endpoints expostos pela nossa API utilizam o prefixo `/ws/`:
* **Autenticação**: `ws/login/`, `ws/registo/`.
* **Filmes**: `ws/filmes/` (com suporte a pesquisa `?q=...` e ordenação `?ordenar=...`), `ws/filmes/<id>/` (leitura e submissão de críticas), `ws/filmes/novo/` e `ws/filmes/editar/<id>/`.
* **Favoritos & Guardados**: `ws/favoritos/`, `ws/favoritos/toggle/<id>/`, `ws/guardados/`, `ws/guardados/toggle/<id>/`.
* **Administração Geral**: `ws/dashboard/stats/` (estatísticas agregadas), `ws/permissoes/`, `ws/grupos/`, `ws/grupos/<id>/` (com rotas de adição, edição e remoção de membros).
* **Importação TMDB**: Rota dedicada `ws/filmes/importar-api/` para carregar filmes sob demanda através de integração com o TMDB.

---

## 4. Front-end: Angular Single Page Application
O cliente é uma SPA reativa construída com **Angular 21+**, utilizando **Standalone Components** para melhor desempenho e organização do código.

### 4.1. Componentes Principais e Melhorias Premium de Design
* **ListaFilmes (`lista-filmes`)**: A página inicial da aplicação que exibe a grelha de filmes organizada em cards do Bootstrap. Fornece pesquisa instantânea e filtros por género, data de lançamento e ordem alfabética. Exibe atalhos interativos (ícones de coração e marcador) para favoritar ou guardar filmes diretamente do card.
  * **Modo Carrossel Automático Nativo**: Alternador visual imersivo e reativo que permite ver o catálogo em formato de slides animados com transições suaves de fade-in e fundo desfocado (blur) dinâmico, implementado 100% em Angular sem quaisquer dependências externas de jQuery.
  * **Scroll Infinito Progressivo (Performance)**: Otimização de performance avançada utilizando o decorador `@HostListener('window:scroll')` do Angular para carregar e renderizar os filmes na grelha em lotes dinâmicos de 6 em 6 à medida que o utilizador navega, garantindo carregamentos instantâneos.
  * **Equalização Flexbox Simétrica**: Ajuste no `styles.css` para forçar os cartões de filme na grelha a terem comportamento flexível e esticarem uniformemente em altura, garantindo simetria perfeita em qualquer resolução.
  * **Estado Vazio de Pesquisa Otimizado**: O bloco `@empty` da grelha de filmes foi reestruturado para distinguir dinamicamente se o catálogo ainda está a ser carregado (exibindo o spinner dourado original) ou se foi o utilizador que fez uma pesquisa sem correspondência na base de dados (exibindo uma mensagem centrada com um ícone de lupa).
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
A comunicação com o servidor é realizada pelo serviço `FilmeService` utilizando APIs assíncronas do JavaScript (`fetch`, `async/await`). 

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

A separação absoluta entre o Angular no front-end e o Django REST Framework no back-end resultou numa aplicação mais flexível, rápida e alinhada com as melhores práticas de desenvolvimento da indústria moderna. Todas as metas estipuladas no enunciado foram cumpridas com rigor:
* UI fluida reativa com Angular;
* API REST completa com serializadores, filtros e paginação no DRF;
* Integração assíncrona baseada em tokens de segurança;
* Exploração avançada de privilégios e perfis (Superuser, Moderador, Utilizador Padrão);
* Importação inteligente sob demanda via API do TMDB.

A base de dados é fornecida totalmente populada com **50 filmes de alta qualidade** e as contas prontas a usar, garantindo uma experiência de demonstração imediata e gratificante para o avaliador.

