from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Genero, Realizador, Ator, Filme, Avaliacao, Guardado, Favorito
class UserSerializer(serializers.ModelSerializer):
    is_moderador = serializers.SerializerMethodField()
    is_staff_custom = serializers.SerializerMethodField() # Novo campo virtual de Staff

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'is_superuser', 'is_staff_custom', 'is_moderador', 'is_active']

    def get_is_moderador(self, obj):
        return obj.is_superuser or obj.groups.filter(name__icontains='coment').exists()

    def get_is_staff_custom(self, obj):
        return obj.is_staff or obj.is_superuser or obj.groups.exists()


class GeneroSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genero
        fields = '__all__'


class RealizadorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Realizador
        fields = '__all__'


class AtorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ator
        fields = '__all__'


class FilmeMinSerializer(serializers.ModelSerializer):
    class Meta:
        model = Filme
        fields = ['id', 'titulo']

class AvaliacaoSerializer(serializers.ModelSerializer):
    utilizador = UserSerializer(read_only=True)
    filme = FilmeMinSerializer(read_only=True) # <- Adicionado esta linha!

    class Meta:
        model = Avaliacao
        fields = ['id', 'filme', 'utilizador', 'nota', 'comentario', 'data_postagem']


class FilmeReadSerializer(serializers.ModelSerializer):
    realizador = RealizadorSerializer(read_only=True)
    generos = GeneroSerializer(many=True, read_only=True)
    atores = AtorSerializer(many=True, read_only=True)
    avaliacoes = AvaliacaoSerializer(many=True, read_only=True)

    class Meta:
        model = Filme
        fields = '__all__'


class FilmeWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Filme
        fields = '__all__'


class FavoritoSerializer(serializers.ModelSerializer):
    filme = FilmeReadSerializer(read_only=True)

    class Meta:
        model = Favorito
        fields = '__all__'


class GuardadoSerializer(serializers.ModelSerializer):
    filme = FilmeReadSerializer(read_only=True)

    class Meta:
        model = Guardado
        fields = '__all__'