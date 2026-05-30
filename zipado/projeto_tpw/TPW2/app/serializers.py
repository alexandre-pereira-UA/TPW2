from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Genero, Realizador, Ator, Filme, Avaliacao, Guardado, Favorito, LogAtividade


# Serializer para Utilizadores (Corrigido!)
class UserSerializer(serializers.ModelSerializer):
    is_moderador = serializers.SerializerMethodField() # 1. Adicionado aqui!

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'is_superuser', 'is_staff', 'is_moderador']

    # 2. Corrigido o recuo (indentação) para ficar fora da classe Meta!
    def get_is_moderador(self, obj):
        # 1. Verifica se é superuser
        # 2. Verifica se tem o grupo 'coment' (sem acentos, apanha 'comentário', 'comentarios', etc)
        # 3. Verifica se tem a permissão nativa de apagar avaliações
        return obj.is_superuser or obj.groups.filter(name__icontains='coment').exists() or obj.has_perm('app.delete_avaliacao')


# Serializer para Géneros
class GeneroSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genero
        fields = '__all__'


# Serializer para Realizadores
class RealizadorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Realizador
        fields = '__all__'


# Serializer para Atores
class AtorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ator
        fields = '__all__'


class FilmeMinSerializer(serializers.ModelSerializer):
    class Meta:
        model = Filme
        fields = ['id', 'titulo']

# 2. Atualize a classe AvaliacaoSerializer para incluir o filme estruturado:
class AvaliacaoSerializer(serializers.ModelSerializer):
    utilizador = UserSerializer(read_only=True)
    filme = FilmeMinSerializer(read_only=True) # <- Adicionado esta linha!

    class Meta:
        model = Avaliacao
        fields = ['id', 'filme', 'utilizador', 'nota', 'comentario', 'data_postagem']


# Serializer para Leitura de Filmes (traz detalhes completos de atores, géneros e realizador)
class FilmeReadSerializer(serializers.ModelSerializer):
    realizador = RealizadorSerializer(read_only=True)
    generos = GeneroSerializer(many=True, read_only=True)
    atores = AtorSerializer(many=True, read_only=True)
    avaliacoes = AvaliacaoSerializer(many=True, read_only=True)

    class Meta:
        model = Filme
        fields = '__all__'


# Serializer para Escrita de Filmes (permite associar IDs simples)
class FilmeWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Filme
        fields = '__all__'


# Serializer para Favoritos
class FavoritoSerializer(serializers.ModelSerializer):
    filme = FilmeReadSerializer(read_only=True)

    class Meta:
        model = Favorito
        fields = '__all__'


# Serializer para Guardados
class GuardadoSerializer(serializers.ModelSerializer):
    filme = FilmeReadSerializer(read_only=True)

    class Meta:
        model = Guardado
        fields = '__all__'


# --- SERIALIZER: LOGS DE ATIVIDADE (Novo) ---

class LogAtividadeSerializer(serializers.ModelSerializer):
    utilizador = UserSerializer(read_only=True)
    class Meta:
        model = LogAtividade
        fields = ['id', 'utilizador', 'acao', 'data_hora']