import os

ARQUIVO_SAIDA = "estrutura_e_conteudo.txt"

# Pastas que serão totalmente ignoradas pelo script
PASTAS_IGNORADAS = {
    ".git", "node_modules", "__pycache__", "venv", ".venv",
    "env", "dist", "build", ".next", ".idea", ".vscode"
}

# Ficheiros específicos a ignorar
ARQUIVOS_IGNORADOS = {
    ARQUIVO_SAIDA, "estrutura_e_codigo.py", "package-lock.json",
    "yarn.lock", "pnpm-lock.yaml", ".DS_Store"
}

# FILTRO CRÍTICO: Só leremos o conteúdo em texto destas duas extensões
EXTENSOES_CONTEUDO = {".py", ".html"}


def gerar_arvore(f_saida):
    """Escreve a estrutura visual completa do projeto no ficheiro de saída."""
    f_saida.write(f"{'=' * 80}\n")
    f_saida.write("1. ESTRUTURA COMPLETA DE PASTAS E FICHEIROS\n")
    f_saida.write(f"{'=' * 80}\n\n")

    for raiz, pastas, arquivos in os.walk("."):
        # Modifica as pastas para evitar entrar nas ignoradas
        pastas[:] = [p for p in pastas if p not in PASTAS_IGNORADAS]

        caminho_relativo = os.path.relpath(raiz, ".")
        if caminho_relativo == ".":
            nivel = 0
            f_saida.write("📁 [Raiz do Projeto]\n")
        else:
            nivel = caminho_relativo.count(os.sep) + 1
            indentacao = "  " * nivel
            f_saida.write(f"{indentacao}📁 {os.path.basename(raiz)}/\n")

        indentacao_arq = "  " * (nivel + 1)
        for arquivo in arquivos:
            if arquivo not in ARQUIVOS_IGNORADOS:
                # Mostra todos os ficheiros na árvore para mapeamento
                f_saida.write(f"{indentacao_arq}📄 {arquivo}\n")
    f_saida.write("\n\n")


def mapear_conteudo_selecionado():
    print("A mapear estrutura e a recolher código Python e HTML...")
    arquivos_processados = 0

    with open(ARQUIVO_SAIDA, "w", encoding="utf-8") as f_saida:
        # Parte 1: Desenhar o mapa do projeto
        gerar_arvore(f_saida)

        # Parte 2: Inserir o conteúdo na íntegra de Python e HTML
        f_saida.write(f"{'=' * 80}\n")
        f_saida.write("2. CONTEÚDO DOS FICHEIROS PYTHON (.py) E HTML (.html)\n")
        f_saida.write(f"{'=' * 80}\n\n")

        for raiz, pastas, arquivos in os.walk("."):
            pastas[:] = [p for p in pastas if p not in PASTAS_IGNORADAS]

            for arquivo in arquivos:
                caminho_completo = os.path.join(raiz, arquivo)
                caminho_relativo = os.path.relpath(caminho_completo, ".")
                _, extensao = os.path.splitext(arquivo)

                # Ignora se estiver na lista negra ou se não for .py/.html
                if arquivo in ARQUIVOS_IGNORADOS or extensao.lower() not in EXTENSOES_CONTEUDO:
                    continue

                try:
                    with open(caminho_completo, "r", encoding="utf-8") as f_entrada:
                        conteudo = f_entrada.read()

                    # Cabeçalho de separação para cada ficheiro encontrado
                    f_saida.write(f"\n{'-' * 80}\n")
                    f_saida.write(f"FICHEIRO: {caminho_relativo}\n")
                    f_saida.write(f"{'-' * 80}\n\n")
                    f_saida.write(conteudo)
                    f_saida.write("\n")

                    print(f"✓ Conteúdo adicionado: {caminho_relativo}")
                    arquivos_processados += 1
                except Exception as e:
                    print(f"✗ Erro ao ler {caminho_relativo}: {e}")

    print(f"\nPronto! Relatório gerado em '{ARQUIVO_SAIDA}' com {arquivos_processados} ficheiros detalhados.")


if __name__ == "__main__":
    mapear_conteudo_selecionado()