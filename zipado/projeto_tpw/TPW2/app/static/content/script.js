
document.addEventListener("DOMContentLoaded", function() {
    const estrelas = document.querySelectorAll('.estrela');
    const textoNota = document.getElementById('nota-escolhida');
    const inputNotaEscondido = document.getElementById('input-nota'); //
    let classificacaoAtual = parseInt(inputNotaEscondido.value) || 0;

    preencherEstrelas(classificacaoAtual);
    textoNota.innerText = classificacaoAtual;

    function preencherEstrelas(valor) {
        estrelas.forEach(estrela => {
            const valorEstrela = parseInt(estrela.getAttribute('data-valor'));
            if (valorEstrela <= valor) {
                estrela.classList.add('preenchida');
            } else {
                estrela.classList.remove('preenchida');
            }
        });
    }

    estrelas.forEach(estrela => {
        estrela.addEventListener('mouseover', () => {
            const valorHover = parseInt(estrela.getAttribute('data-valor'));
            preencherEstrelas(valorHover);
        });

        estrela.addEventListener('mouseout', () => {
            preencherEstrelas(classificacaoAtual);
        });

        estrela.addEventListener('click', () => {
            classificacaoAtual = parseInt(estrela.getAttribute('data-valor'));

            textoNota.innerText = classificacaoAtual;


            if (inputNotaEscondido) {
                inputNotaEscondido.value = classificacaoAtual;
            }

            preencherEstrelas(classificacaoAtual);
        });
    });
});

document.querySelectorAll('.filtro-btn').forEach(btn => {
    if (btn.classList.contains('btn-limpar')) return;

    btn.addEventListener('click', function(e) {
        e.preventDefault();

        let url = new URL(window.location.href);
        let params = new URLSearchParams(url.search);

        let linkUrl = new URL(this.href, window.location.origin);
        let novoParam = linkUrl.searchParams.get('ordenar');

        // Toggle: Se já estiver ativo, remove. Se não, ativa.
        if (params.get('ordenar') === novoParam) {
            params.delete('ordenar');
        } else {
            params.set('ordenar', novoParam);
        }

        window.location.href = url.pathname + '?' + params.toString();
    });
});

$(document).ready(function() {
    console.log("DOM pronto, a carregar Select2...");

    function ativarSelect2(seletor, placeholder) {
        if ($(seletor).length) {
            $(seletor).select2({
                tags: true,
                placeholder: placeholder,
                allowClear: true,
                width: '100%',
                tokenSeparators: [',', ';']
            });
            console.log("Select2 aplicado a: " + seletor);
        }
    }


    ativarSelect2('#id_realizador', "Seleciona ou escreve o realizador...");

    ativarSelect2('#id_generos', "Seleciona ou escreve os géneros (ex: Ação, Drama)...");
    ativarSelect2('#id_genero', "Seleciona ou escreve o género..."); // Backup caso o nome no model seja singular

    ativarSelect2('#id_atores', "Escreve os atores separados por vírgulas...");
});

$(document).ready(function() {
    $('#id_atores, #id_generos').select2({
        tags: true,
        placeholder: "Seleciona ou escreve para adicionar...",
        allowClear: true,
        width: '100%',
        tokenSeparators: [',']
    });

    $('#id_realizador').select2({
        tags: true,
        placeholder: "Seleciona ou escreve o realizador...",
        allowClear: true,
        width: '100%'
    });
});

