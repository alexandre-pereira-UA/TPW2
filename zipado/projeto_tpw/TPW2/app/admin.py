from django.contrib import admin
from app.models import Realizador, Ator, Filme, Genero, Avaliacao

admin.site.register(Realizador)
admin.site.register(Ator)
admin.site.register(Filme)
admin.site.register(Genero)

@admin.register(Avaliacao)
class AvaliacaoAdmin(admin.ModelAdmin):
    list_display = ('utilizador', 'filme', 'nota', 'data_postagem')
    list_filter = ('nota', 'filme')
