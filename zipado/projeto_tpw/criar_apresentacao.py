import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor

def gerar_apresentacao():
    print("A iniciar a geração do PowerPoint...")
    prs = Presentation()
    
    # Configura o tamanho dos slides para Widescreen (16:9)
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    
    # -------------------------------------------------------------
    # SLIDE 1: Capa de Apresentação (Estilo Escuro / Gold Cinema)
    # -------------------------------------------------------------
    blank_layout = prs.slide_layouts[6]
    slide = prs.slides.add_slide(blank_layout)
    
    # Adiciona fundo preto/indigo profundo
    bg = slide.shapes.add_shape(1, 0, 0, prs.slide_width, prs.slide_height) # MSO_SHAPE.RECTANGLE = 1
    bg.fill.solid()
    bg.fill.fore_color.rgb = RGBColor(9, 9, 13)
    bg.line.fill.background()
    
    # Adiciona caixa de título da Capa
    title_box = slide.shapes.add_textbox(Inches(1.0), Inches(2.2), Inches(11.333), Inches(3.0))
    tf = title_box.text_frame
    tf.word_wrap = True
    
    p1 = tf.paragraphs[0]
    p1.text = "MOVIEZ CATALOG"
    p1.font.name = 'Inter'
    p1.font.size = Pt(56)
    p1.font.bold = True
    p1.font.color.rgb = RGBColor(245, 197, 24) # Amarelo Ouro
    
    p2 = tf.add_paragraph()
    p2.text = "Plataforma Web Desacoplada | Trabalho Prático 2"
    p2.font.name = 'Inter'
    p2.font.size = Pt(22)
    p2.font.color.rgb = RGBColor(255, 255, 255)
    p2.space_before = Pt(10)
    
    p3 = tf.add_paragraph()
    p3.text = "Unidade Curricular: Tecnologias e Programação Web (TPW)\nEngenharia Informática, Universidade de Aveiro\nAno Letivo: 2025/2026"
    p3.font.name = 'Inter'
    p3.font.size = Pt(14)
    p3.font.color.rgb = RGBColor(160, 160, 180)
    p3.space_before = Pt(30)
    
    # -------------------------------------------------------------
    # HELPER: Adicionar Slides de Conteúdo com Estilo Consistente
    # -------------------------------------------------------------
    def add_content_slide(title_text, items):
        s = prs.slides.add_slide(blank_layout)
        
        # Fundo cinemático
        b = s.shapes.add_shape(1, 0, 0, prs.slide_width, prs.slide_height)
        b.fill.solid()
        b.fill.fore_color.rgb = RGBColor(18, 18, 28) # Deep indigo gray
        b.line.fill.background()
        
        # Título do Slide
        t_box = s.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11.733), Inches(1.0))
        tf_title = t_box.text_frame
        tf_title.word_wrap = True
        p_title = tf_title.paragraphs[0]
        p_title.text = title_text
        p_title.font.name = 'Inter'
        p_title.font.size = Pt(32)
        p_title.font.bold = True
        p_title.font.color.rgb = RGBColor(245, 197, 24)
        
        # Caixa de Texto Principal (Bullets)
        b_box = s.shapes.add_textbox(Inches(0.8), Inches(1.7), Inches(11.733), Inches(5.0))
        tf_body = b_box.text_frame
        tf_body.word_wrap = True
        
        for idx, item in enumerate(items):
            if idx == 0:
                p_item = tf_body.paragraphs[0]
            else:
                p_item = tf_body.add_paragraph()
            
            p_item.font.name = 'Inter'
            p_item.space_after = Pt(8)
            
            if item.startswith("    -"):
                # Sub-item (Nível 2)
                p_item.text = item.strip().lstrip("-").strip()
                p_item.level = 2
                p_item.font.size = Pt(15)
                p_item.font.color.rgb = RGBColor(160, 160, 180)
            elif item.startswith("  -") or item.startswith("  *"):
                # Item Secundário (Nível 1)
                p_item.text = item.strip().lstrip("-").lstrip("*").strip()
                p_item.level = 1
                p_item.font.size = Pt(17)
                p_item.font.color.rgb = RGBColor(210, 210, 225)
            else:
                # Tópico Principal (Nível 0)
                p_item.text = item.strip().lstrip("-").lstrip("*").strip()
                p_item.level = 0
                p_item.font.size = Pt(20)
                p_item.font.bold = True
                p_item.font.color.rgb = RGBColor(255, 255, 255)
    
    # -------------------------------------------------------------
    # SLIDE 2: Introdução e Arquitetura do Sistema
    # -------------------------------------------------------------
    add_content_slide(
        "1. Introdução e Arquitetura do Sistema",
        [
            "Evolução da Plataforma Clássica (TP1) para N-Tier Desacoplada",
            "  - Separação completa de responsabilidades entre o cliente e o servidor.",
            "  - Comunicação exclusiva via protocolo HTTP trocando dados em formato JSON.",
            "Tecnologias Utilizadas no Ecossistema",
            "  - Back-end: Django REST Framework (DRF) atuando como API pura.",
            "  - Front-end SPA: Angular (v21+) para uma interface rápida e reativa.",
            "Vantagens e Desempenho",
            "  - Independência total de código, modularidade e excelente fluidez de navegação."
        ]
    )
    
    # -------------------------------------------------------------
    # SLIDE 3: Back-end - Django REST Framework (DRF)
    # -------------------------------------------------------------
    add_content_slide(
        "2. Back-end: Robustez e RESTful APIs",
        [
            "Modelos de Dados Otimizados (SQLite3)",
            "  - Filmes, Atores, Realizadores, Géneros e Críticas/Avaliações.",
            "  - Listas personalizadas através de relacionamentos N-para-N (Favoritos e Guardados).",
            "Camada de Serialização Avançada (serializers.py)",
            "  - Nested Serializers de Leitura: Detalhes aninhados de elenco, equipa e avaliações.",
            "  - Serializers de Escrita: IDs simples e eficientes para gravação rápida.",
            "Endpoints da API REST (/ws/)",
            "  - CRUD completo para todas as entidades principais e controlo transacional de críticas."
        ]
    )
    
    # -------------------------------------------------------------
    # SLIDE 4: Front-end - SPA com Angular 21+
    # -------------------------------------------------------------
    add_content_slide(
        "3. Front-end: SPA Moderna e Reativa",
        [
            "Desenvolvimento Modular em Angular",
            "  - Utilização de Standalone Components e injeção de dependências nativa.",
            "  - Comunicação assíncrona robusta com a API via serviços dedicados.",
            "Grelha de Filmes e Posters Dinâmicos",
            "  - Cards modernos estilizados com Bootstrap flexível (mesma altura).",
            "Alternador de Visualização Premium",
            "  - Modo Grelha Clássica ou Modo Carrossel Nático com efeito blur de fundo.",
            "Carregamento Otimizado por Scroll Infinito",
            "  - Monitorização de scroll no browser para carregar filmes de 6 em 6 (HostListener)."
        ]
    )
    
    # -------------------------------------------------------------
    # SLIDE 5: Segurança e Controlo de Acessos
    # -------------------------------------------------------------
    add_content_slide(
        "4. Segurança, Autenticação e Perfis",
        [
            "Autenticação Segura Baseada em Token",
            "  - DRF TokenAuthentication integrado de forma nativa no login e registo.",
            "  - Persistência no localStorage e anexo automático a pedidos protegidos.",
            "Distinção Robusta de Perfis de Utilizador",
            "  - Superutilizador (Admin): Acesso ao dashboard de estatísticas e gestão total.",
            "  - Moderador (Membro de 'coment'): Permissão nativa para apagar críticas impróprias.",
            "  - Utilizador Comum: Submete notas e comentários, e gere listas personalizadas.",
            "  - Visitante Anónimo: Apenas leitura segura do catálogo de filmes."
        ]
    )
    
    # -------------------------------------------------------------
    # SLIDE 6: Integração com API Externa (TMDB)
    # -------------------------------------------------------------
    add_content_slide(
        "5. Integração com a API Externa do TMDB",
        [
            "Fator de Valorização e Exploração de APIs de Terceiros",
            "  - Conexão em tempo real do Django REST à API pública do The Movie Database.",
            "Importação Automática sob Demanda",
            "  - O administrador pode descarregar 10 novos filmes de sucesso com um único clique.",
            "Normalização de Dados Local",
            "  - Descarrega posters em alta qualidade, sinopses e detalhes técnicos da API.",
            "  - Cria de forma dinâmica Atores, Realizador e Géneros locais evitando registos duplicados."
        ]
    )
    
    # -------------------------------------------------------------
    # SLIDE 7: Estética e Experiência de Utilizador
    # -------------------------------------------------------------
    add_content_slide(
        "6. Design Visual e Interface Premium",
        [
            "Tema Dinâmico Escuro / Claro (Dark/Light Mode)",
            "  - Transição perfeita de contrastes para a navbar superior, cards e tabelas.",
            "  - Estado de tema persistido com segurança no browser do utilizador.",
            "Efeito Glassmorphism de Alta Qualidade",
            "  - Efeito de vidro fosco (blur) e elevação suave 3D nos cards no hover.",
            "Classificação Interativa por Estrelas",
            "  - Sistema visual de estrelas douradas clicáveis para atribuir notas nos detalhes.",
            "Tipografia de Alto Nível",
            "  - Fonte premium 'Inter' importada do Google Fonts em todo o projeto."
        ]
    )
    
    # -------------------------------------------------------------
    # SLIDE 8: Conclusão
    # -------------------------------------------------------------
    add_content_slide(
        "7. Conclusão",
        [
            "Conformidade Absoluta com o Guião do TP2",
            "  - Todos os requisitos obrigatórios e sugestões de exploração cumpridos na totalidade.",
            "Arquitetura de Produção Orientada a Serviços Moderna",
            "  - Base de código modular, rápida, segura e perfeitamente organizada.",
            "Pronto para Entrega e Demonstração Imediata",
            "  - Base de dados SQLite pré-populada com 50 filmes de grande sucesso.",
            "  - 5 contas de teste configuradas com perfis e permissões prontas a usar.",
            "  - Relatório técnico RELATORIO.md completo incluído na raiz."
        ]
    )
    
    # Grava o ficheiro de apresentação no disco
    nome_arquivo = "APRESENTACAO_TP2.pptx"
    prs.save(nome_arquivo)
    print(f"Sucesso! Apresentação PowerPoint gerada em '{nome_arquivo}'.")

if __name__ == "__main__":
    gerar_apresentacao()
