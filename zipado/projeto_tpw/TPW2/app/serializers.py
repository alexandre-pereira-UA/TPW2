from rest_framework import serializers
from django.contrib.auth.models import User, Group, Permission
from .models import Genero, Realizador, Ator, Filme, Avaliacao, Guardado, Favorito


# Serializer para Utilizadores
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'is_superuser', 'is_staff']


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


# Serializer para Leitura de Filmes (traz detalhes completos de atores, géneros e realizador)
class FilmeReadSerializer(serializers.ModelSerializer):
    realizador = RealizadorSerializer(read_only=True)
    generos = GeneroSerializer(many=True, read_only=True)
    atores = AtorSerializer(many=True, read_only=True)

    class Meta:
        model = Filme
        fields = '__all__'


# Serializer para Escrita de Filmes (permite associar IDs simples)
class FilmeWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Filme
        fields = '__all__'


# Serializer para Críticas/Avaliações
class AvaliacaoSerializer(serializers.ModelSerializer):
    utilizador = UserSerializer(read_only=True)

    class Meta:
        model = Avaliacao
        fields = ['id', 'filme', 'utilizador', 'nota', 'comentario', 'data_postagem']


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