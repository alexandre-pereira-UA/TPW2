from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Genero, Realizador, Ator, Filme, Avaliacao, Guardado, Favorito


# Serializer para Utilizadores (Corrigido!)
class UserSerializer(serializers.ModelSerializer):
    is_moderador = serializers.SerializerMethodField()
    is_staff_custom = serializers.SerializerMethodField() # Novo campo virtual de Staff

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'is_superuser', 'is_staff_custom', 'is_moderador', 'is_active']

    def get_is_moderador(self, obj):
        return obj.is_superuser or obj.groups.filter(name__icontains='coment').exists()

    def get_is_staff_custom(self, obj):
        # Se pertencer a qualquer grupo administrativo ou for staff/superuser, é considerado Staff!
        return obj.is_staff or obj.is_superuser or obj.groups.exists()


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