import requests
import time
from django.core.management.base import BaseCommand
from app.models import Filme, Ator, Realizador, Genero

class Command(BaseCommand):
    help = 'Importa milhares de filmes do TMDB para a base de dados'

    def handle(self, *args, **kwargs):
        API_KEY = '8e831ce268683e2c393d39b71fbdd357'
        LANGUAGE = 'pt-PT'
        PAGES = 50

        self.stdout.write(self.style.WARNING(f'A iniciar a importação de {PAGES * 20} filmes. Vai beber um café, isto pode demorar uns minutos...'))

        for page in range(1, PAGES + 1):
            url_filmes = f'https://api.themoviedb.org/3/movie/top_rated?api_key={API_KEY}&language={LANGUAGE}&page={page}'
            resposta = requests.get(url_filmes)
            
            if resposta.status_code != 200:
                self.stdout.write(self.style.ERROR(f'Erro na página {page}. A abortar.'))
                break

            dados_filmes = resposta.json().get('results', [])

            for item in dados_filmes:
                titulo = item.get('title')[:100]
                sinopse = item.get('overview', 'Sem sinopse disponível.')
                data_lancamento = item.get('release_date')
                poster_path = item.get('poster_path')
                filme_id_tmdb = item.get('id')

                if not data_lancamento or not poster_path:
                    continue

                cartaz_url = f"https://image.tmdb.org/t/p/w500{poster_path}"

                time.sleep(0.1)

                url_creditos = f'https://api.themoviedb.org/3/movie/{filme_id_tmdb}/credits?api_key={API_KEY}&language={LANGUAGE}'
                creditos_resp = requests.get(url_creditos).json()
                
                nome_realizador = "Desconhecido"
                for crew in creditos_resp.get('crew', []):
                    if crew.get('job') == 'Director':
                        nome_realizador = crew.get('name')[:70]
                        break
                
                realizador_obj, _ = Realizador.objects.get_or_create(nome=nome_realizador)

                filme_obj, criado = Filme.objects.get_or_create(
                    titulo=titulo,
                    defaults={
                        'data_lancamento': data_lancamento,
                        'sinopse': sinopse,
                        'cartaz': cartaz_url,
                        'realizador': realizador_obj
                    }
                )

                if criado:
                    atores_lista = creditos_resp.get('cast', [])[:4]
                    for ator in atores_lista:
                        ator_obj, _ = Ator.objects.get_or_create(nome=ator.get('name')[:70])
                        filme_obj.atores.add(ator_obj)

                    url_detalhes = f'https://api.themoviedb.org/3/movie/{filme_id_tmdb}?api_key={API_KEY}&language={LANGUAGE}'
                    detalhes_resp = requests.get(url_detalhes).json()
                    
                    for genre in detalhes_resp.get('genres', []):
                        genero_obj, _ = Genero.objects.get_or_create(nome=genre.get('name')[:50])
                        filme_obj.generos.add(genero_obj)
                    
                    self.stdout.write(self.style.SUCCESS(f" Adicionado: {titulo}"))
                else:
                    self.stdout.write(f"Já existe: {titulo}")

        self.stdout.write(self.style.SUCCESS('Importação em massa concluída com sucesso!'))
