import requests
import random
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User, Group
from django.db.models import Q

# REST Framework Imports
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token

# Models e Serializers locais
from app.models import Filme, Avaliacao, Favorito, Guardado, Realizador, Ator, Genero
from app.serializers import (
    FilmeReadSerializer, FilmeWriteSerializer, UserSerializer,
    AvaliacaoSerializer, FavoritoSerializer, GuardadoSerializer,
    RealizadorSerializer, AtorSerializer, GeneroSerializer
)


@api_view(['POST'])
@permission_classes([AllowAny])
def api_login(request):
    """Gera um Token de Acesso para o Angular autenticar os pedidos e valida bloqueios"""
    username = request.data.get('username')
    password = request.data.get('password')

    try:
        user_obj = User.objects.get(username=username)
        if not user_obj.is_active:
            return Response({'error': 'A tua conta foi bloqueada pela administração do site.'},
                            status=status.HTTP_403_FORBIDDEN)
    except User.DoesNotExist:
        pass

    user = authenticate(username=username, password=password)
    if user is not None:
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)

    return Response({'error': 'Credenciais inválidas'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def api_registo(request):
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')
    first_name = request.data.get('first_name', '')
    last_name = request.data.get('last_name', '')

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Este username já está em uso.'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(
        username=username, password=password, email=email,
        first_name=first_name, last_name=last_name
    )
    token, _ = Token.objects.get_or_create(user=user)
    return Response({
        'token': token.key,
        'user': UserSerializer(user).data
    }, status=status.HTTP_201_CREATED)



@api_view(['GET'])
@permission_classes([AllowAny])
def api_lista_filmes(request):
    filmes = Filme.objects.all()
    query = request.query_params.get('q')
    ordenar = request.query_params.get('ordenar')

    if query:
        filmes = filmes.filter(
            Q(titulo__icontains=query) |
            Q(atores__nome__icontains=query) |
            Q(realizador__nome__icontains=query)
        ).distinct()

    if ordenar == 'recentes':
        filmes = filmes.order_by('-data_lancamento')
    elif ordenar == 'antigos':
        filmes = filmes.order_by('data_lancamento')
    elif ordenar == 'alfabetica':
        filmes = filmes.order_by('titulo')

    serializer = FilmeReadSerializer(filmes, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def api_detalhe_filme(request, filme_id):
    filme = get_object_or_404(Filme, id=filme_id)

    if request.method == 'GET':
        serializer = FilmeReadSerializer(filme)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        if not request.user.is_authenticated:
            return Response({'error': 'Não autenticado'}, status=status.HTTP_401_UNAUTHORIZED)

        nota = request.data.get('nota')
        comentario = request.data.get('comentario')

        avaliacao, criado = Avaliacao.objects.update_or_create(
            filme=filme, utilizador=request.user,
            defaults={'nota': int(nota), 'comentario': comentario}
        )
        return Response(AvaliacaoSerializer(avaliacao).data, status=status.HTTP_201_CREATED)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_meus_favoritos(request):
    favs = Favorito.objects.filter(utilizador=request.user)
    serializer = FavoritoSerializer(favs, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_toggle_favorito(request, filme_id):
    filme = get_object_or_404(Filme, id=filme_id)
    fav, created = Favorito.objects.get_or_create(utilizador=request.user, filme=filme)
    if not created:
        fav.delete()
        return Response({'status': 'removido'}, status=status.HTTP_200_OK)
    return Response({'status': 'adicionado'}, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def api_dashboard_stats(request):
    data = {
        'total_users': User.objects.count(),
        'total_grupos': Group.objects.count(),
        'total_filmes': Filme.objects.count(),
        'total_atores': Ator.objects.count(),
        'total_realizadores': Realizador.objects.count(),
        'total_generos': Genero.objects.count(),
        'total_avaliacoes': Avaliacao.objects.count(),
    }
    return Response(data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def api_lista_atores(request):
    atores = Ator.objects.all().order_by('nome')
    serializer = AtorSerializer(atores, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def api_apagar_ator(request, id):
    ator = get_object_or_404(Ator, id=id)
    ator.delete()
    return Response({'status': 'apagado'}, status=status.HTTP_200_OK)


# --- API: REALIZADORES ---
@api_view(['GET'])
@permission_classes([AllowAny])
def api_lista_realizadores(request):
    realizadores = Realizador.objects.all().order_by('nome')
    serializer = RealizadorSerializer(realizadores, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def api_apagar_realizador(request, id):
    realizador = get_object_or_404(Realizador, id=id)
    realizador.delete()
    return Response({'status': 'apagado'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def api_lista_generos(request):
    generos = Genero.objects.all().order_by('nome')
    serializer = GeneroSerializer(generos, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def api_apagar_genero(request, id):
    genero = get_object_or_404(Genero, id=id)
    genero.delete()
    return Response({'status': 'apagado'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def api_lista_utilizadores(request):
    utilizadores = User.objects.all().order_by('-date_joined')
    serializer = UserSerializer(utilizadores, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def api_apagar_utilizador(request, id):
    u = get_object_or_404(User, id=id)
    if u.is_superuser:
        return Response({'error': 'Não é possível apagar um Superutilizador.'}, status=status.HTTP_400_BAD_REQUEST)
    u.delete()
    return Response({'status': 'apagado'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def api_lista_avaliacoes(request):
    avaliacoes = Avaliacao.objects.all().order_by('-data_postagem')
    serializer = AvaliacaoSerializer(avaliacoes, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def api_apagar_avaliacao(request, id):
    av = get_object_or_404(Avaliacao, id=id)

    if request.user.is_superuser or request.user.has_perm('app.delete_avaliacao'):
        av.delete()
        return Response({'status': 'apagado'}, status=status.HTTP_200_OK)

    return Response({'error': 'Não tens permissão para isto.'}, status=status.HTTP_403_FORBIDDEN)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def api_lista_grupos(request):
    grupos = Group.objects.all().order_by('name')
    data = []
    for g in grupos:
        data.append({
            'id': g.id,
            'name': g.name,
            'user_set_count': g.user_set.count()
        })
    return Response(data, status=status.HTTP_200_OK)

@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def api_apagar_grupo(request, id):
    grupo = get_object_or_404(Group, id=id)
    grupo.delete()
    return Response({'status': 'apagado'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_detalhe_utilizador(request, id):
    u = get_object_or_404(User, id=id)
    serializer = UserSerializer(u)
    data = serializer.data
    data['groups'] = [{'id': g.id, 'name': g.name} for g in u.groups.all()]
    data['date_joined'] = u.date_joined
    return Response(data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_editar_utilizador(request, id):
    u = get_object_or_404(User, id=id)
    if request.user.id != u.id and not request.user.is_superuser:
        return Response({'error': 'Não tem permissão para editar este perfil.'}, status=status.HTTP_403_FORBIDDEN)

    data = request.data
    u.username = data.get('username', u.username)
    u.first_name = data.get('first_name', u.first_name)
    u.last_name = data.get('last_name', u.last_name)
    u.email = data.get('email', u.email)

    password = data.get('password')
    if password:
        u.set_password(password)

    grupo_id = data.get('grupo')
    if request.user.is_superuser and grupo_id is not None:
        u.groups.clear()
        if grupo_id != '':
            from django.contrib.auth.models import Group
            g = get_object_or_404(Group, id=int(grupo_id))
            u.groups.add(g)

    u.save()
    return Response(UserSerializer(u).data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_meus_guardados(request):
    gs = Guardado.objects.filter(utilizador=request.user)
    serializer = GuardadoSerializer(gs, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_toggle_guardado(request, filme_id):
    filme = get_object_or_404(Filme, id=filme_id)
    g, created = Guardado.objects.get_or_create(utilizador=request.user, filme=filme)
    if not created:
        g.delete()
        return Response({'status': 'removido'}, status=status.HTTP_200_OK)
    return Response({'status': 'adicionado'}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def api_criar_filme(request):
    serializer = FilmeWriteSerializer(data=request.data)
    if serializer.is_valid():
        filme = serializer.save()
        return Response(FilmeReadSerializer(filme).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST', 'PUT'])
@permission_classes([IsAdminUser])
def api_editar_filme(request, id):
    filme = get_object_or_404(Filme, id=id)
    serializer = FilmeWriteSerializer(instance=filme, data=request.data, partial=True)
    if serializer.is_valid():
        filme_atualizado = serializer.save()
        return Response(FilmeReadSerializer(filme_atualizado).data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def api_lista_permissoes(request):
    from django.contrib.auth.models import Permission
    permissoes = Permission.objects.all().select_related('content_type').order_by('content_type__model', 'codename')
    data = []
    for p in permissoes:
        data.append({
            'id': p.id,
            'name': p.name,
            'content_type_model': p.content_type.model
        })
    return Response(data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def api_detalhe_grupo(request, id):
    from django.contrib.auth.models import Group
    grupo = get_object_or_404(Group, id=id)
    utilizadores = [{'id': u.id, 'username': u.username, 'email': u.email} for u in grupo.user_set.all()]
    permissoes = [{'id': p.id, 'name': p.name} for p in grupo.permissions.all()]

    return Response({
        'grupo': {'id': grupo.id, 'name': grupo.name},
        'utilizadores': utilizadores,
        'permissoes': permissoes
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def api_criar_grupo(request):
    from django.contrib.auth.models import Group
    nome = request.data.get('nome')
    perms_ids = request.data.get('permissoes', [])

    if not nome:
        return Response({'error': 'Nome do grupo é obrigatório.'}, status=status.HTTP_400_BAD_REQUEST)

    if Group.objects.filter(name=nome).exists():
        return Response({'error': 'Já existe um grupo com este nome.'}, status=status.HTTP_400_BAD_REQUEST)

    grupo = Group.objects.create(name=nome)
    grupo.permissions.set(perms_ids)
    return Response({'status': 'criado'}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def api_editar_grupo(request, id):
    from django.contrib.auth.models import Group
    grupo = get_object_or_404(Group, id=id)
    nome = request.data.get('nome')
    perms_ids = request.data.get('permissoes', [])

    if not nome:
        return Response({'error': 'Nome do grupo é obrigatório.'}, status=status.HTTP_400_BAD_REQUEST)

    grupo.name = nome
    grupo.permissions.set(perms_ids)
    grupo.save()
    return Response({'status': 'atualizado'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def api_remover_utilizador_grupo(request, grupo_id, user_id):
    from django.contrib.auth.models import Group
    grupo = get_object_or_404(Group, id=grupo_id)
    u = get_object_or_404(User, id=user_id)
    grupo.user_set.remove(u)
    return Response({'status': 'removido'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def api_importar_filmes_api(request):
    API_KEY = '8e831ce268683e2c393d39b71fbdd357'
    LANGUAGE = 'pt-PT'

    ano_sorteado = random.randint(1980, 2024)
    pagina_sorteada = random.randint(1, 10)

    url_discover = (
        f'https://api.themoviedb.org/3/discover/movie?'
        f'api_key={API_KEY}&language={LANGUAGE}&sort_by=popularity.desc'
        f'&primary_release_year={ano_sorteado}&page={pagina_sorteada}'
        f'&include_adult=false'
    )

    try:
        resposta = requests.get(url_discover, timeout=10)
        if resposta.status_code != 200:
            return Response({"error": "Erro ao conectar com a API do TMDB."}, status=status.HTTP_400_BAD_REQUEST)

        dados_filmes = resposta.json().get('results', [])
        contagem_novos = 0

        for item in dados_filmes:
            if contagem_novos >= 10:
                break

            titulo = item.get('title')[:100]

            if Filme.objects.filter(titulo=titulo).exists():
                continue

            sinopse = item.get('overview', 'Sem sinopse disponível.')
            data_lancamento = item.get('release_date')
            poster_path = item.get('poster_path')
            filme_id_tmdb = item.get('id')

            if not data_lancamento or not poster_path:
                continue

            cartaz_url = f"https://image.tmdb.org/t/p/w500{poster_path}"

            url_creditos = f'https://api.themoviedb.org/3/movie/{filme_id_tmdb}/credits?api_key={API_KEY}&language={LANGUAGE}'
            creditos_resp = requests.get(url_creditos).json()

            nome_realizador = "Desconhecido"
            for crew in creditos_resp.get('crew', []):
                if crew.get('job') == 'Director':
                    nome_realizador = crew.get('name')[:70]
                    break

            realizador_obj, _ = Realizador.objects.get_or_create(nome=nome_realizador)

            novo_filme = Filme.objects.create(
                titulo=titulo,
                data_lancamento=data_lancamento,
                sinopse=sinopse,
                cartaz=cartaz_url,
                realizador=realizador_obj
            )

            for ator in creditos_resp.get('cast', [])[:4]:
                ator_obj, _ = Ator.objects.get_or_create(nome=ator.get('name')[:70])
                novo_filme.atores.add(ator_obj)

            url_detalhes = f'https://api.themoviedb.org/3/movie/{filme_id_tmdb}?api_key={API_KEY}&language={LANGUAGE}'
            detalhes_resp = requests.get(url_detalhes).json()
            for genre in detalhes_resp.get('genres', []):
                genero_obj, _ = Genero.objects.get_or_create(nome=genre.get('name')[:50])
                novo_filme.generos.add(genero_obj)

            contagem_novos += 1

        return Response({"status": "sucesso", "novos_filmes": contagem_novos}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def api_apagar_comentario(request, filme_id):
    # Procura a avaliação do utilizador autenticado para este filme específico
    avaliacao = Avaliacao.objects.filter(filme_id=filme_id, utilizador=request.user).first()

    if avaliacao:
        avaliacao.delete()
        return Response({'status': 'comentario_apagado'}, status=status.HTTP_200_OK)

    return Response({'error': 'Não foi possível encontrar a sua crítica neste filme.'},
                    status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def api_toggle_bloqueio_utilizador(request, id):
    u = get_object_or_404(User, id=id)
    if u.is_superuser:
        return Response({'error': 'Não é possível bloquear um Superutilizador.'}, status=status.HTTP_400_BAD_REQUEST)
    u.is_active = not u.is_active
    u.save()
    status_str = 'bloqueado' if not u.is_active else 'desbloqueado'
    return Response({'status': status_str, 'is_active': u.is_active}, status=status.HTTP_200_OK)