from django.urls import path
from . import views
from django.contrib.auth import views as auth_views

urlpatterns = [
    # JSON para Angular depois ir apagando as antigas

    path('ws/login/', views.api_login, name='api_login'),
    path('ws/registo/', views.api_registo, name='api_registo'),
    path('ws/filmes/', views.api_lista_filmes, name='api_lista_filmes'),
    path('ws/filmes/<int:filme_id>/', views.api_detalhe_filme, name='api_detalhe_filme'),
    path('ws/favoritos/', views.api_meus_favoritos, name='api_meus_favoritos'),
    path('ws/favoritos/toggle/<int:filme_id>/', views.api_toggle_favorito, name='api_toggle_favorito'),
    path('ws/dashboard/stats/', views.api_dashboard_stats, name='api_dashboard_stats'),
    # --- ROTAS DA API REST (Em Falta) ---

    # Atores
    path('ws/atores/', views.api_lista_atores, name='api_lista_atores'),
    path('ws/atores/apagar/<int:id>/', views.api_apagar_ator, name='api_apagar_ator'),

    # Realizadores
    path('ws/realizadores/', views.api_lista_realizadores, name='api_lista_realizadores'),
    path('ws/realizadores/apagar/<int:id>/', views.api_apagar_realizador, name='api_apagar_realizador'),

    # Generos
    path('ws/generos/', views.api_lista_generos, name='api_lista_generos'),
    path('ws/generos/apagar/<int:id>/', views.api_apagar_genero, name='api_apagar_genero'),

    # Utilizadores
    path('ws/utilizadores/', views.api_lista_utilizadores, name='api_lista_utilizadores'),
    path('ws/utilizadores/apagar/<int:id>/', views.api_apagar_utilizador, name='api_apagar_utilizador'),

    # Avaliacoes
    path('ws/avaliacoes/', views.api_lista_avaliacoes, name='api_lista_avaliacoes'),
    path('ws/avaliacoes/apagar/<int:id>/', views.api_apagar_avaliacao, name='api_apagar_avaliacao'),

    # Grupos
    path('ws/grupos/', views.api_lista_grupos, name='api_lista_grupos'),
    path('ws/grupos/apagar/<int:id>/', views.api_apagar_grupo, name='api_apagar_grupo'),

    path('ws/utilizadores/<int:id>/', views.api_detalhe_utilizador, name='api_detalhe_utilizador'),
    path('ws/utilizadores/editar/<int:id>/', views.api_editar_utilizador, name='api_editar_utilizador'),

# Rotas de Guardados
    path('ws/guardados/', views.api_meus_guardados, name='api_meus_guardados'),
    path('ws/guardados/toggle/<int:filme_id>/', views.api_toggle_guardado, name='api_toggle_guardado'),

# Rotas de Criar e Editar Filmes
    path('ws/filmes/novo/', views.api_criar_filme, name='api_criar_filme'),
    path('ws/filmes/editar/<int:id>/', views.api_editar_filme, name='api_editar_filme'),

# Rotas de Grupos e Permissões Administrativas
    path('ws/permissoes/', views.api_lista_permissoes, name='api_lista_permissoes'),
    path('ws/grupos/<int:id>/', views.api_detalhe_grupo, name='api_detalhe_grupo'),
    path('ws/grupos/novo/', views.api_criar_grupo, name='api_criar_grupo'),
    path('ws/grupos/editar/<int:id>/', views.api_editar_grupo, name='api_editar_grupo'),
    path('ws/grupos/<int:grupo_id>/remover/<int:user_id>/', views.api_remover_utilizador_grupo, name='api_remover_utilizador_grupo'),
# Rota de Importação automática de Filmes do TMDB via API
    path('ws/filmes/importar-api/', views.api_importar_filmes_api, name='api_importar_filmes_api'),
    path('ws/filmes/<int:filme_id>/comentario/apagar/', views.api_apagar_comentario, name='api_apagar_comentario'),
# Rota para ler o Histórico de Auditoria do Staff
    path('ws/admin/logs/', views.api_lista_logs, name='api_lista_logs'),


]
