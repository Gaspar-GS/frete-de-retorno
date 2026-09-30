// =========================================================
// FRETE DE RETORNO
// Formulário → WhatsApp
// =========================================================


// =========================================================
// CONFIGURAÇÃO
// =========================================================

const WHATSAPP = "244953715148";


// =========================================================
// ELEMENTOS
// =========================================================

const formulario = document.getElementById("whatsappForm");

const camposCarga = document.getElementById("camposCarga");
const camposCamiao = document.getElementById("camposCamiao");

const formError = document.getElementById("formError");

const radiosTipo = document.querySelectorAll(
    'input[name="tipo"]'
);


// =========================================================
// TROCAR ENTRE CARGA E CAMIÃO
// =========================================================

function atualizarFormulario(tipo) {

    const modoCamiao = tipo === "truck";

    camposCarga.hidden = modoCamiao;
    camposCamiao.hidden = !modoCamiao;


    // Limpa mensagens anteriores

    if (formError) {
        formError.textContent = "";
    }


    // Campos de carga

    const camposDeCarga = camposCarga.querySelectorAll(
        "input, select, textarea"
    );


    camposDeCarga.forEach(campo => {

        campo.disabled = modoCamiao;

    });


    // Campos de camião

    const camposDeCamiao = camposCamiao.querySelectorAll(
        "input, select, textarea"
    );


    camposDeCamiao.forEach(campo => {

        campo.disabled = !modoCamiao;

    });

}


// =========================================================
// EVENTO DOS BOTÕES CARGA / CAMIÃO
// =========================================================

radiosTipo.forEach(radio => {

    radio.addEventListener("change", function () {

        atualizarFormulario(this.value);

    });

});


// =========================================================
// BOTÕES DO SITE
// =========================================================

document.querySelectorAll("[data-set]").forEach(botao => {

    botao.addEventListener("click", function () {

        const modo = this.dataset.set;

        const radio = document.querySelector(
            `input[name="tipo"][value="${modo}"]`
        );


        if (radio) {

            radio.checked = true;

            atualizarFormulario(modo);

        }

    });

});


// =========================================================
// PARTIDA → DESTINO
// Mantém Luanda ↔ Huambo
// =========================================================

const partida = document.getElementById("partida");
const destino = document.getElementById("destino");


partida.addEventListener("change", function () {

    if (this.value === "Luanda") {

        destino.value = "Huambo";

    }

    else if (this.value === "Huambo") {

        destino.value = "Luanda";

    }

});


destino.addEventListener("change", function () {

    if (this.value === "Luanda") {

        partida.value = "Huambo";

    }

    else if (this.value === "Huambo") {

        partida.value = "Luanda";

    }

});


// =========================================================
// FORMULÁRIO → WHATSAPP
// =========================================================

formulario.addEventListener("submit", function (event) {

    event.preventDefault();


    if (formError) {
        formError.textContent = "";
    }


    // =====================================================
    // DADOS PRINCIPAIS
    // =====================================================

    const tipo = document.querySelector(
        'input[name="tipo"]:checked'
    ).value;


    const nome = document
        .getElementById("nome")
        .value
        .trim();


    const telefone = document
        .getElementById("telefone")
        .value
        .trim();


    const origem = partida.value;

    const destinoValor = destino.value;


    const detalhes = document
        .getElementById("detalhes")
        .value
        .trim();


    // =====================================================
    // VALIDAÇÃO
    // =====================================================

    if (!nome || !telefone) {

        if (formError) {
            formError.textContent =
                "Indique o seu nome e telefone.";
        }

        return;
    }


    if (!origem || !destinoValor) {

        if (formError) {
            formError.textContent =
                "Indique a partida e o destino.";
        }

        return;
    }


    // =====================================================
    // MODO CAMIÃO
    // =====================================================

    if (tipo === "truck") {


        const tipoCamiao = document
            .getElementById("tipoCamiao")
            .value;


        const capacidade = document
            .getElementById("capacidadeCamiao")
            .value
            .trim();


        const regresso = document
            .getElementById("regressoCamiao")
            .value
            .trim();


        const mensagem = [

            "Olá, Frete de Retorno.",

            "",

            "TENHO UM CAMIÃO",

            "",

            `Nome: ${nome}`,

            `Telefone: ${telefone}`,

            `Rota: ${origem} → ${destinoValor}`,

            tipoCamiao
                ? `Tipo de camião: ${tipoCamiao}`
                : "",

            capacidade
                ? `Capacidade: ${capacidade}`
                : "",

            regresso
                ? `Quando costuma regressar: ${regresso}`
                : "",

            detalhes
                ? `Observações: ${detalhes}`
                : ""

        ];


        abrirWhatsApp(mensagem);

        return;
    }


    // =====================================================
    // MODO CARGA
    // =====================================================

    const tipoCarga = document
        .getElementById("tipoCarga")
        .value
        .trim();


    const pesoCarga = document
        .getElementById("pesoCarga")
        .value
        .trim();


    const dataCarga = document
        .getElementById("dataCarga")
        .value;


    let dataFormatada = "";


    if (dataCarga) {

        const partes = dataCarga.split("-");

        dataFormatada =
            `${partes[2]}/${partes[1]}/${partes[0]}`;

    }


    const mensagem = [

        "Olá, Frete de Retorno.",

        "",

        "TENHO UMA CARGA",

        "",

        `Nome: ${nome}`,

        `Telefone: ${telefone}`,

        `Rota: ${origem} → ${destinoValor}`,

        tipoCarga
            ? `Tipo de carga: ${tipoCarga}`
            : "",

        pesoCarga
            ? `Peso aproximado: ${pesoCarga}`
            : "",

        dataFormatada
            ? `Data pretendida: ${dataFormatada}`
            : "",

        detalhes
            ? `Observações: ${detalhes}`
            : ""

    ];


    abrirWhatsApp(mensagem);

});


// =========================================================
// ABRIR WHATSAPP
// =========================================================

function abrirWhatsApp(linhas) {

    const texto = linhas
        .filter(Boolean)
        .join("\n");


    const url =
        `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`;


    window.open(
        url,
        "_blank",
        "noopener,noreferrer"
    );

}


// =========================================================
// ESTADO INICIAL
// =========================================================

atualizarFormulario("cargo");


// =========================================================
// ANO AUTOMÁTICO DO RODAPÉ
// =========================================================

const anoAtual = document.getElementById("anoAtual");


if (anoAtual) {

    anoAtual.textContent =
        new Date().getFullYear();

}
