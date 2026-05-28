from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from django.db.models import Q

from django.contrib.auth.models import User
from app.models import Filme, Avaliacao, Favorito, Guardado, Realizador, Ator, Genero
from app.serializers import (
    FilmeReadSerializer, FilmeWriteSerializer, UserSerializer,
    AvaliacaoSerializer, FavoritoSerializer, GuardadoSerializer
)


from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.decorators import login_required, user_passes_test
from .models import Filme, Ator, Realizador, Genero, Avaliacao, Favorito, Guardado
from .forms import PesquisaFilmeForm, RegistoForm, FilmeForm
from django.urls import reverse
from django.contrib.auth.models import User, Group, Permission
from django.db.models import Q
import requests
from django.contrib import messages

from django.contrib.auth.models import Group


@user_passes_test(lambda u: u.is_superuser)
def importar_filmes_api(request):

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
            messages.error(request, "Erro ao conectar com a API do TMDB.")
            return redirect('admin_filmes')

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

        if contagem_novos > 0:
            messages.success(request,
                             f"Sucesso! {contagem_novos} filmes de {ano_sorteado} foram importados com sucesso.")
        else:
            messages.info(request,
                          f"Todos os filmes populares de {ano_sorteado} (página {pagina_sorteada}) já existem na tua base de dados.")

    except Exception as e:
        messages.error(request, f"Ocorreu um erro inesperado: {e}")

    return redirect('admin_filmes')

def lista_filmes(request):
    form = PesquisaFilmeForm(request.GET)
    filmes = Filme.objects.all()

    if form.is_valid():
        query = form.cleaned_data.get('query')
        if query:
            filmes = filmes.filter(
                Q(titulo__icontains=query) |
                Q(atores__nome__icontains=query) |
                Q(realizador__nome__icontains=query)
            ).distinct()

    ordenar = request.GET.get('ordenar')
    if ordenar == 'recentes':
        filmes = filmes.order_by('-data_lancamento')
    elif ordenar == 'antigos':
        filmes = filmes.order_by('data_lancamento')
    elif ordenar == 'alfabetica':
        filmes = filmes.order_by('titulo')

    ids_favoritos = []
    ids_guardados = []
    if request.user.is_authenticated:
        ids_favoritos = Favorito.objects.filter(utilizador=request.user).values_list('filme_id', flat=True)
        ids_guardados = Guardado.objects.filter(utilizador=request.user).values_list('filme_id', flat=True)

    return render(request, 'lista_filmes.html', {
        'filmes': filmes,
        'form': form,
        'ids_favoritos': ids_favoritos,
        'ids_guardados': ids_guardados
    })


def detalhe_filme(request, filme_id):
    filme = get_object_or_404(Filme, id=filme_id)
    origem = request.GET.get('origem')

    is_moderador = False
    if request.user.is_authenticated:
        is_moderador = request.user.is_superuser or request.user.has_perm('app.delete_avaliacao')

    if request.method == "POST" and request.user.is_authenticated:
        nova_nota = request.POST.get('nota')
        novo_comentario = request.POST.get('comentario')
        if nova_nota:
            Avaliacao.objects.update_or_create(
                filme=filme, utilizador=request.user,
                defaults={'nota': int(nova_nota), 'comentario': novo_comentario}
            )
            messages.success(request, "Crítica guardada!")
            return redirect(reverse('detalhe_filme', args=[filme.id]) + (f"?origem={origem}" if origem else ""))

    minha_avaliacao = None
    if request.user.is_authenticated:
        minha_avaliacao = Avaliacao.objects.filter(filme=filme, utilizador=request.user).first()

    outras_avaliacoes = Avaliacao.objects.filter(filme=filme).order_by('-data_postagem')
    if minha_avaliacao:
        outras_avaliacoes = outras_avaliacoes.exclude(id=minha_avaliacao.id)

    return render(request, 'detalhe_filme.html', {
        'filme': filme,
        'avaliacoes': outras_avaliacoes,
        'minha_av': minha_avaliacao,
        'is_moderador': is_moderador,  # Esta variável agora é verdadeira para a Pessoa1
        'nota_user': minha_avaliacao.nota if minha_avaliacao else 0,
        'comentario_user': minha_avaliacao.comentario if minha_avaliacao else "",
        'origem': origem
    })



def registo(request):
    if request.method == 'POST':
        form = RegistoForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('login')
    else:
        form = RegistoForm()
    return render(request, 'registration/registo.html', {'form': form})


def redirecionar_apos_login(request):
    if request.user.is_superuser:
        return redirect('dashboard_admin')
    return redirect('lista_filmes')


def ver_perfil(request, user_id=None):
    target_user = get_object_or_404(User, id=user_id) if user_id else request.user
    origem = request.GET.get('origem')
    grupo_id = request.GET.get('grupo_id')

    return render(request, 'perfil.html', {
        'perfil_user': target_user,
        'origem': origem,
        'grupo_id': grupo_id
    })


@login_required
def editar_perfil(request, user_id):
    perfil_user = get_object_or_404(User, id=user_id)

    if request.method == "POST":
        perfil_user.username = request.POST.get('username')
        perfil_user.first_name = request.POST.get('first_name')
        perfil_user.last_name = request.POST.get('last_name')
        perfil_user.email = request.POST.get('email')

        nova_pw = request.POST.get('password')
        if not perfil_user.is_superuser and nova_pw:
            perfil_user.set_password(nova_pw)
            if request.user == perfil_user:
                update_session_auth_hash(request, perfil_user)

        perfil_user.save()
        messages.success(request, "Perfil atualizado!")
        return redirect('perfil' if not request.user.is_superuser else 'admin_utilizadores')

    return render(request, 'editar_perfil.html', {'perfil_user': perfil_user, 'grupos': Group.objects.all()})


@user_passes_test(lambda u: u.is_superuser)
def dashboard_admin(request):
    context = {
        'total_users': User.objects.count(),
        'total_grupos': Group.objects.count(),
        'total_filmes': Filme.objects.count(),
        'total_atores': Ator.objects.count(),
        'total_realizadores': Realizador.objects.count(),
        'total_generos': Genero.objects.count(),
        'total_avaliacoes': Avaliacao.objects.count(),
    }
    return render(request, 'dashboard_admin.html', context)


@user_passes_test(lambda u: u.is_superuser)
def admin_utilizadores(request):
    query = request.GET.get('q')
    usuarios = User.objects.all().order_by('-date_joined')

    if query:
        usuarios = usuarios.filter(
            Q(username__icontains=query) |
            Q(email__icontains=query)
        )

    return render(request, 'relAdmin/admin_utilizadores.html', {'itens': usuarios, 'query': query})


@user_passes_test(lambda u: u.is_superuser)
def admin_atores(request):
    query = request.GET.get('q')
    atores = Ator.objects.all().order_by('nome')

    if query:
        atores = atores.filter(nome__icontains=query)

    return render(request, 'relAdmin/admin_atores.html', {'itens': atores, 'query': query})


@user_passes_test(lambda u: u.is_superuser)
def admin_realizadores(request):
    query = request.GET.get('q')
    realizadores = Realizador.objects.all().order_by('nome')

    if query:
        realizadores = realizadores.filter(nome__icontains=query)

    return render(request, 'relAdmin/admin_realizadores.html', {'itens': realizadores, 'query': query})


@user_passes_test(lambda u: u.is_superuser)
def admin_generos(request):
    query = request.GET.get('q')
    generos = Genero.objects.all().order_by('nome')

    if query:
        generos = generos.filter(nome__icontains=query)

    return render(request, 'relAdmin/admin_generos.html', {'itens': generos, 'query': query})

@user_passes_test(lambda u: u.is_superuser)
def admin_filmes(request):
    query = request.GET.get('q')
    filmes = Filme.objects.all().order_by('-id')
    if query:
        filmes = filmes.filter(Q(titulo__icontains=query) | Q(realizador__nome__icontains=query))
    return render(request, 'relAdmin/admin_filmes.html', {'itens': filmes, 'query': query})


@user_passes_test(lambda u: u.is_superuser)
def admin_avaliacoes(request):
    query = request.GET.get('q')
    avaliacoes = Avaliacao.objects.all().order_by('-data_postagem')

    if query:
        avaliacoes = avaliacoes.filter(
            Q(utilizador__username__icontains=query) |
            Q(filme__titulo__icontains=query) |
            Q(comentario__icontains=query)
        )

    return render(request, 'relAdmin/admin_avaliacoes.html', {'itens': avaliacoes, 'query': query})

@user_passes_test(lambda u: u.is_superuser)
def adicionar_filme(request):
    if request.method == 'POST':
        dados = request.POST.copy()
        r_val = dados.get('realizador')
        if r_val and not r_val.isdigit():
            obj, _ = Realizador.objects.get_or_create(nome=r_val)
            dados['realizador'] = str(obj.id)
        for field in ['atores', 'generos']:
            vals = dados.getlist(field)
            new_ids = []
            for v in vals:
                if v.isdigit():
                    new_ids.append(v)
                else:
                    model = Ator if field == 'atores' else Genero
                    obj, _ = model.objects.get_or_create(nome=v.strip())
                    new_ids.append(str(obj.id))
            dados.setlist(field, new_ids)
        form = FilmeForm(dados, request.FILES)
        if form.is_valid():
            form.save()
            return redirect('admin_filmes')
    else:
        form = FilmeForm()
    return render(request, 'adicionar_filme.html', {'form': form})


@login_required
@user_passes_test(lambda u: u.is_staff)
def editar_filme(request, id):
    filme = get_object_or_404(Filme, id=id)
    if request.method == 'POST':
        form = FilmeForm(request.POST, request.FILES, instance=filme)
        if form.is_valid():
            form.save()
            return redirect('lista_filmes')
    else:
        form = FilmeForm(instance=filme)
    return render(request, 'adicionar_filme.html', {'form': form, 'editando': True})


@login_required
def meus_favoritos(request):
    favs = Favorito.objects.filter(utilizador=request.user)
    return render(request, 'meus_favoritos.html', {'favoritos': favs})


@login_required
def meus_guardados(request):
    gs = Guardado.objects.filter(utilizador=request.user)
    return render(request, 'meus_guardados.html', {'guardados': gs})


@login_required
def toggle_favorito(request, filme_id):
    filme = get_object_or_404(Filme, id=filme_id)
    fav, created = Favorito.objects.get_or_create(utilizador=request.user, filme=filme)
    if not created: fav.delete()
    return redirect(request.META.get('HTTP_REFERER', 'lista_filmes'))


@login_required
def toggle_guardado(request, filme_id):
    filme = get_object_or_404(Filme, id=filme_id)
    g, created = Guardado.objects.get_or_create(utilizador=request.user, filme=filme)
    if not created: g.delete()
    return redirect(request.META.get('HTTP_REFERER', 'lista_filmes'))


@user_passes_test(lambda u: u.is_superuser)
def editar_item(request, modelo, item_id):
    modelos = {'ator': Ator, 'genero': Genero, 'realizador': Realizador}
    model_class = modelos.get(modelo)

    item = get_object_or_404(model_class, id=item_id)

    if request.method == "POST":
        novo_nome = request.POST.get('nome')
        if novo_nome:
            item.nome = novo_nome
            item.save()
            messages.success(request, f"{modelo.capitalize()} atualizado com sucesso!")
        return redirect(f'admin_{modelo}es' if modelo != 'ator' else 'admin_atores')

    return render(request, 'relAdmin/editar_item_admin.html', {'item': item, 'tipo': modelo})


@user_passes_test(lambda u: u.is_superuser)
def apagar_item(request, modelo, item_id):
    modelos = {'ator': Ator, 'genero': Genero, 'realizador': Realizador}
    model_class = modelos.get(modelo)

    item = get_object_or_404(model_class, id=item_id)
    item.delete()
    messages.success(request, f"{modelo.capitalize()} removido da base de dados.")
    url_redirect = f'admin_{modelo}es' if modelo != 'ator' else 'admin_atores'

    return redirect(url_redirect)

@user_passes_test(lambda u: u.is_superuser)
def apagar_filme(request, filme_id):
    filme = get_object_or_404(Filme, id=filme_id)
    nome_filme = filme.titulo
    filme.delete()
    messages.success(request, f"O filme '{nome_filme}' foi apagado com sucesso.")
    return redirect('admin_filmes')


@user_passes_test(lambda u: u.is_superuser)
def lista_grupos(request):
    grupos = Group.objects.all().order_by('name')
    return render(request, 'relAdmin/admin_permissoes.html', {'grupos': grupos})

@user_passes_test(lambda u: u.is_superuser)
def criar_grupo(request):
    todas_permissoes = Permission.objects.all()
    if request.method == "POST":
        nome = request.POST.get('nome')
        perms_selecionadas = request.POST.getlist('permissoes')
        if nome:
            novo_grupo = Group.objects.create(name=nome)
            novo_grupo.permissions.set(perms_selecionadas)
            messages.success(request, f"Grupo '{nome}' criado!")
            return redirect('lista_grupos')
    return render(request, 'relAdmin/editar_grupo.html', {'todas_permissoes': todas_permissoes, 'modo': 'Criar'})

@user_passes_test(lambda u: u.is_superuser)
def editar_grupo(request, grupo_id):
    grupo = get_object_or_404(Group, id=grupo_id)
    todas_permissoes = Permission.objects.all()
    if request.method == "POST":
        grupo.name = request.POST.get('nome')
        perms_selecionadas = request.POST.getlist('permissoes')
        grupo.permissions.set(perms_selecionadas)
        grupo.save()
        messages.success(request, f"Grupo '{grupo.name}' atualizado!")
        return redirect('lista_grupos')
    return render(request, 'relAdmin/editar_grupo.html', {'grupo': grupo, 'todas_permissoes': todas_permissoes, 'modo': 'Editar'})

@user_passes_test(lambda u: u.is_superuser)
def detalhe_grupo(request, grupo_id):
    grupo = get_object_or_404(Group, id=grupo_id)
    utilizadores = grupo.user_set.all()
    permissoes = grupo.permissions.all().select_related('content_type')
    return render(request, 'relAdmin/detalhe_grupo.html', {'grupo': grupo, 'utilizadores': utilizadores, 'permissoes': permissoes})

@user_passes_test(lambda u: u.is_superuser)
def apagar_grupo(request, grupo_id):
    grupo = get_object_or_404(Group, id=grupo_id)
    grupo.delete()
    messages.success(request, "Grupo removido com sucesso.")
    return redirect('lista_grupos')

@user_passes_test(lambda u: u.is_superuser)
def remover_utilizador_grupo(request, grupo_id, user_id):
    grupo = get_object_or_404(Group, id=grupo_id)
    u = get_object_or_404(User, id=user_id)
    grupo.user_set.remove(u)
    messages.success(request, f"Utilizador {u.username} removido do grupo.")
    return redirect('detalhe_grupo', grupo_id=grupo_id)

@user_passes_test(lambda u: u.is_superuser)
def apagar_avaliacao(request, av_id):
    avaliacao = get_object_or_404(Avaliacao, id=av_id)
    avaliacao.delete()
    messages.success(request, "Comentário removido com sucesso.")
    return redirect('admin_avaliacoes')

@user_passes_test(lambda u: u.is_superuser)
def apagar_utilizador(request, user_id):
    u = get_object_or_404(User, id=user_id)
    if u.is_superuser:
        messages.error(request, "Não é possível apagar um Superutilizador.")
    else:
        u.delete()
        messages.success(request, "Utilizador removido do sistema.")
    return redirect('admin_utilizadores')


@login_required
def apagar_comentario(request, filme_id):
    # Procura a avaliação do utilizador logado para este filme
    avaliacao = Avaliacao.objects.filter(filme_id=filme_id, utilizador=request.user).first()

    if avaliacao:
        avaliacao.delete()
        messages.success(request, "A tua crítica foi removida com sucesso.")
    else:
        messages.error(request, "Não foi possível encontrar a tua crítica.")

    return redirect('detalhe_filme', filme_id=filme_id)


@login_required
def moderar_apagar_comentario(request, avaliacao_id):
    avaliacao = get_object_or_404(Avaliacao, id=avaliacao_id)
    filme_id = avaliacao.filme.id

    # Verifica permissão no Python por segurança
    if request.user.is_superuser or request.user.has_perm('app.delete_avaliacao'):
        avaliacao.delete()
        messages.success(request, "Comentário removido pela moderação.")
    else:
        messages.error(request, "Não tens permissão para isto.")

    return redirect('detalhe_filme', filme_id=filme_id)

@api_view(['POST'])
@permission_classes([AllowAny])
def api_login(request):
    """Gera um Token de Acesso para o Angular autenticar os pedidos"""
    username = request.data.get('username')
    password = request.data.get('password')
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
    """Cria uma nova conta a partir do formulário de registo no Angular"""
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


# --- 2. FILMES (LISTA E DETALHE) ---

@api_view(['GET'])
@permission_classes([AllowAny])
def api_lista_filmes(request):
    """Substitui a view 'lista_filmes' antiga, retornando os filmes em formato JSON"""
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
    """Retorna detalhes de um filme e processa a criação de novas críticas"""
    filme = get_object_or_404(Filme, id=filme_id)

    if request.method == 'GET':
        serializer = FilmeReadSerializer(filme)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        # Requer autenticação por Token para submeter críticas
        if not request.user.is_authenticated:
            return Response({'error': 'Não autenticado'}, status=status.HTTP_401_UNAUTHORIZED)

        nota = request.data.get('nota')
        comentario = request.data.get('comentario')

        avaliacao, criado = Avaliacao.objects.update_or_create(
            filme=filme, utilizador=request.user,
            defaults={'nota': int(nota), 'comentario': comentario}
        )
        return Response(AvaliacaoSerializer(avaliacao).data, status=status.HTTP_201_CREATED)


# --- 3. FAVORITOS E GUARDADOS ---

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
@permission_classes([IsAdminUser]) # Apenas administradores podem aceder a estas estatísticas
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


# --- API: ATORES ---
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


# --- API: GÉNEROS ---
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


# --- API: UTILIZADORES ---
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


# --- API: CRÍTICAS / AVALIAÇÕES ---
@api_view(['GET'])
@permission_classes([IsAdminUser])
def api_lista_avaliacoes(request):
    avaliacoes = Avaliacao.objects.all().order_by('-data_postagem')
    serializer = AvaliacaoSerializer(avaliacoes, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


# Atualize a função api_apagar_avaliacao para ficar assim:
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])  # Permite a ligação de autenticados, mas validamos a segurança no código!
def api_apagar_avaliacao(request, id):
    av = get_object_or_404(Avaliacao, id=id)

    # Validação de segurança idêntica à que tinha no TP1!
    if request.user.is_superuser or request.user.has_perm('app.delete_avaliacao'):
        av.delete()
        return Response({'status': 'apagado'}, status=status.HTTP_200_OK)

    return Response({'error': 'Não tens permissão para isto.'}, status=status.HTTP_403_FORBIDDEN)


# --- API: GRUPOS ---
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
    # Envia também os grupos associados e a data de criação
    data['groups'] = [{'id': g.id, 'name': g.name} for g in u.groups.all()]
    data['date_joined'] = u.date_joined
    return Response(data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_editar_utilizador(request, id):
    u = get_object_or_404(User, id=id)
    # Apenas o próprio utilizador ou um superuser pode editar
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

# --- API: MEUS GUARDADOS (Em Falta) ---

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


# --- API: CRIAR FILME (Em Falta) ---
@api_view(['POST'])
@permission_classes([IsAdminUser]) # Permite acesso a Superusers e membros do Staff
def api_criar_filme(request):
    serializer = FilmeWriteSerializer(data=request.data)
    if serializer.is_valid():
        filme = serializer.save()
        return Response(FilmeReadSerializer(filme).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# --- API: EDITAR FILME (Em Falta) ---
@api_view(['POST', 'PUT'])
@permission_classes([IsAdminUser])
def api_editar_filme(request, id):
    filme = get_object_or_404(Filme, id=id)
    serializer = FilmeWriteSerializer(instance=filme, data=request.data, partial=True)
    if serializer.is_valid():
        filme_atualizado = serializer.save()
        return Response(FilmeReadSerializer(filme_atualizado).data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)