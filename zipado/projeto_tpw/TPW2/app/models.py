from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Genero(models.Model):
    nome = models.CharField(max_length=50)
    def __str__(self): return self.nome

class Realizador(models.Model):
    nome = models.CharField(max_length=70)
    def __str__(self): return self.nome

class Ator(models.Model):
    nome = models.CharField(max_length=70)
    def __str__(self): return self.nome

class Filme(models.Model):
    titulo = models.CharField(max_length=100)
    data_lancamento = models.DateField()
    sinopse = models.TextField(blank=True, null=True)
    cartaz = models.URLField(max_length=500, null=True, blank=True)
    realizador = models.ForeignKey(Realizador, on_delete=models.CASCADE)
    generos = models.ManyToManyField(Genero, related_name='filmes')
    atores = models.ManyToManyField(Ator)

    def __str__(self): return self.titulo

class Avaliacao(models.Model):
    filme = models.ForeignKey(Filme, on_delete=models.CASCADE, related_name='avaliacoes')
    utilizador = models.ForeignKey(User, on_delete=models.CASCADE)
    nota = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comentario = models.TextField(blank=True, null=True)
    data_postagem = models.DateTimeField(default=timezone.now)
    class Meta:
        unique_together = ('filme', 'utilizador')

    def __str__(self):
        return f"{self.utilizador.username} - {self.filme.titulo}: {self.nota}"


class Guardado(models.Model):
    utilizador = models.ForeignKey(User, on_delete=models.CASCADE)
    filme = models.ForeignKey('Filme', on_delete=models.CASCADE)
    data_adicionado = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('utilizador', 'filme')

class Favorito(models.Model):
    utilizador = models.ForeignKey(User, on_delete=models.CASCADE)
    filme = models.ForeignKey('Filme', on_delete=models.CASCADE)
    data_adicionado = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('utilizador', 'filme')