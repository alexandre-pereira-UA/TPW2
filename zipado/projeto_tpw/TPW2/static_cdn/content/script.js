document.addEventListener("DOMContentLoaded", function() {
    const estrelas = document.querySelectorAll('.estrela');
    const textoNota = document.getElementById('nota-escolhida');
    let classificacaoAtual = 0;

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
        });
    });
});