from django.urls import path
from . import views
from django.contrib.auth import views as auth_views

urlpatterns = [
    path('', views.lista_filmes, name='lista_filmes'),
    path('filme/<int:filme_id>/', views.detalhe_filme, name='detalhe_filme'),
    path('filme/adicionar/', views.adicionar_filme, name='adicionar_filme'),
    path('editar-filme/<int:id>/', views.editar_filme, name='editar_filme'),

    path('registo/', views.registo, name='registo'),
    path('login/', auth_views.LoginView.as_view(template_name='registration/login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('verificar-login/', views.redirecionar_apos_login, name='verificar_login'),

    path('perfil/', views.ver_perfil, name='perfil'),

    path('perfil/<int:user_id>/', views.ver_perfil, name='perfil_detalhado'),

    path('perfil/<int:user_id>/', views.ver_perfil, name='perfil_utilizador'),    # Edição de perfil (agora aceita ID opcional na view para servir a todos)
    path('perfil/editar/<int:user_id>/', views.editar_perfil, name='editar_perfil'),

    path('favoritos/', views.meus_favoritos, name='meus_favoritos'),
    path('guardados/', views.meus_guardados, name='meus_guardados'),
    path('favorito/toggle/<int:filme_id>/', views.toggle_favorito, name='toggle_favorito'),
    path('guardado/toggle/<int:filme_id>/', views.toggle_guardado, name='toggle_guardado'),

    path('dashboard/', views.dashboard_admin, name='dashboard_admin'),
    path('dashboard/utilizadores/', views.admin_utilizadores, name='admin_utilizadores'),

    path('dashboard/grupos/', views.lista_grupos, name='lista_grupos'),
    # Grupos
    path('dashboard/grupos/novo/', views.criar_grupo, name='criar_grupo'),
    path('dashboard/grupos/editar/<int:grupo_id>/', views.editar_grupo, name='editar_grupo'),
    path('dashboard/grupos/apagar/<int:grupo_id>/', views.apagar_grupo, name='apagar_grupo'),
    path('dashboard/grupos/<int:grupo_id>/', views.detalhe_grupo, name='detalhe_grupo'),
    path('dashboard/grupos/<int:grupo_id>/remover/<int:user_id>/', views.remover_utilizador_grupo,
         name='remover_user_grupo'),
    path('dashboard/filmes/', views.admin_filmes, name='admin_filmes'),
    path('dashboard/atores/', views.admin_atores, name='admin_atores'),
    path('dashboard/realizadores/', views.admin_realizadores, name='admin_realizadores'),
    path('dashboard/generos/', views.admin_generos, name='admin_generos'),
    path('dashboard/avaliacoes/', views.admin_avaliacoes, name='admin_avaliacoes'),

    path('dashboard/editar/<str:modelo>/<int:item_id>/', views.editar_item, name='editar_item_admin'),

    path('dashboard/filmes/apagar/<int:filme_id>/', views.apagar_filme, name='apagar_filme_admin'),


    path('dashboard/avaliacoes/apagar/<int:av_id>/', views.apagar_avaliacao, name='apagar_avaliacao'),

    path('dashboard/utilizadores/apagar/<int:user_id>/', views.apagar_utilizador, name='apagar_utilizador'),


    path('dashboard/apagar/<str:modelo>/<int:item_id>/', views.apagar_item, name='apagar_item_admin'),

    path('dashboard/filmes/importar-api/', views.importar_filmes_api, name='importar_filmes_api'),

    path('filme/<int:filme_id>/comentario/apagar/', views.apagar_comentario, name='apagar_comentario'),

    path('comentario/moderar/apagar/<int:avaliacao_id>/', views.moderar_apagar_comentario, name='moderar_apagar_comentario'),

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


]
