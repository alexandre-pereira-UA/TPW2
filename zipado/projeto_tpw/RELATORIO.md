<p align="center">
  <img src="https://upload.wikimedia.org/wikipedia/pt/d/d4/Logotipo_da_Universidade_de_Aveiro.png" width="300" alt="Universidade de Aveiro">
</p>

<h1 align="center" style="margin-top: 30px; font-size: 32px; font-weight: bold;">MOVIEZ CATALOG</h1>
<h3 align="center" style="color: #666; font-size: 20px; margin-top: 5px;">Plataforma Web Desacoplada</h3>

<br><br>

<p align="center">
  <strong>Tecnologias e Programação Web (TPW)</strong><br>
  Engenharia Informática — Departamento de Eletrónica, Telecomunicações e Informática (DETI)<br>
  Universidade de Aveiro — Ano Letivo: 2025/2026
</p>

<br><br><br>

<p align="center" style="font-size: 16px; line-height: 1.6;">
  <strong>Grupo de Trabalho:</strong><br>
  👤 Guilherme Escórcio — Nº 118648<br>
  👤 Alexandre Pereira — Nº 119871<br>
  👤 Alexandre Silva — Nº 119583
</p>

<div style="page-break-after: always;"></div>

## 1. Descrição Geral e Arquitetura
O **Moviez Catalog** é uma plataforma de catálogo cinematográfico assente numa **arquitetura N-tier totalmente desacoplada**. O projeto divide-se em duas camadas isoladas que comunicam exclusivamente por pedidos HTTP transacionando dados em formato **JSON**:
1. **Back-end (API REST)**: Desenvolvido em **Django REST Framework (DRF)**. Gere o modelo de dados, as críticas dos utilizadores, as permissões de acesso e disponibiliza endpoints RESTful puros com autenticação segura.
2. **Front-end (SPA)**: Desenvolvido em **Angular** (v21+). Disponibiliza uma interface moderna, reativa e fluida baseada em Standalone Components e Bootstrap.

### 🌐 Alojamento em Produção (Exploração)
Para testar a arquitetura distribuída em cenários reais, publicámos ambas as camadas na Cloud:
* **API Back-end (DRF)**: [https://escorcio.pythonanywhere.com/ws/](https://escorcio.pythonanywhere.com/ws/)
* **SPA Front-end (Angular)**: [https://tpw-2.vercel.app/](https://tpw-2.vercel.app/)

> [!NOTE]
> Como o front-end está configurado para comunicar com a API em produção no PythonAnywhere, o avaliador pode navegar na SPA localmente (`npm start`) sem necessidade de correr o servidor Django local.

---

## 2. Principais Funcionalidades Implementadas
Em conformidade com os requisitos mínimos e os tópicos de valorização técnica exigidos pelo guião, foram implementadas as seguintes soluções:
* **Autenticação segura por Token**: Implementação de `TokenAuthentication` do DRF. O token é persistido no `localStorage` do navegador e anexado de forma automática a todos os pedidos em rotas protegidas.
* **Scroll Infinito Otimizado**: Integração da diretiva `@HostListener('window:scroll')` no Angular para carregar e renderizar os filmes na grelha em lotes progressivos de 6 em 6, otimizando o tempo de resposta e poupando largura de banda.
* **Alternador de Layout Premium (Grelha / Carrossel)**: Seletor visual que permite ver os filmes numa grelha clássica Bootstrap ou num Carrossel Nativo de slides com efeitos suaves de fade-in e fundo desfocado (blur) dinâmico.
* **Sistema de Classificação Interativo**: Interface de estrelas douradas clicáveis para que utilizadores registados atribuam notas de 1 a 5 estrelas e submetam críticas por filme.
* **Importador TMDB em Tempo Real**: Rota administrativa dedicada que consome a API do *The Movie Database* (TMDB) para descarregar novos filmes populares e criar dinamicamente os géneros, atores e realizadores correspondentes na base de dados SQLite3 local.
* **Controlo Granular de Perfis e Permissões**: 
  * *Administrador*: Acesso total a estatísticas agregadas e ao backoffice administrativo.
  * *Moderador* (membro do grupo `'coment'`): Possui permissão nativa para apagar qualquer comentário ofensivo diretamente na página do filme.
  * *Utilizador Registado*: Gere listas personalizadas (Favoritos e Guardados) e faz avaliações.
  * *Visitante Anónimo*: Apenas leitura do catálogo.

---

## 3. Instruções para Execução e Teste

### 3.1. Executar o Servidor Back-end (DRF)
1. Navegue até à pasta do servidor: `cd TPW2/zipado/projeto_tpw/TPW2`
2. Crie o ambiente virtual, ative-o e instale as dependências:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate
   pip install django djangorestframework django-cors-headers requests sqlparse tzdata
   ```
3. Inicie o servidor Django: `python manage.py runserver` (disponível em `http://localhost:8000`).

### 3.2. Executar o Front-end (Angular SPA)
1. Navegue até à pasta do cliente-side: `cd TPW2/zipado/projeto_tpw/client-side`
2. Instale as dependências e inicie a aplicação:
   ```bash
   npm install
   npm start
   ```
3. A SPA ficará disponível em `http://localhost:4200` (pode ser testada localmente de imediato).

---

## 4. Contas de Teste Pré-Configuradas
Para facilitar a avaliação de todas as permissões e perfis de segurança, configurámos as seguintes credenciais de teste na base de dados SQLite (a palavra-passe é idêntica ao username):

| Username | Perfil / Função Principal | Privilégios no Sistema |
| :--- | :--- | :--- |
| **`superuser`** | Administrador Geral | Acesso total ao Backoffice, gestão de utilizadores e importação TMDB. |
| **`GerirComentariosUser`** | Moderador (Grupo 'coment') | Pode visualizar filmes e apagar qualquer comentário ofensivo de terceiros. |
| **`GerirFilmesUser`** | Gestor de Conteúdos (Staff) | Acesso ao painel admin para criar/editar registos de filmes. |
| **`UtilizadorComum`** | Utilizador Registado | Gere os seus favoritos/guardados, edita o perfil e publica críticas. |
| **`teste`** | Conta de Teste Simples | Permite testes rápidos de utilizador comum. |

---

## 5. Conclusão
O desenvolvimento do **Moviez Catalog** permitiu consolidar de forma sólida os conceitos de **arquitetura orientada a serviços (N-tier)**. A separação completa entre o front-end Angular e o back-end Django REST Framework resultou numa aplicação modular, segura e alinhada com as melhores práticas da indústria moderna, cumprindo a 100% todos os requisitos do guião prático.
