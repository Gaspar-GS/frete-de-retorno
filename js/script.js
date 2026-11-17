
"use strict";

// =========================================================
// FRETE DE RETORNO
// FORMULÁRIO + MAPA + GPS + WHATSAPP
// MapLibre + OpenFreeMap + OpenStreetMap
// =========================================================


// =========================================================
// 1. CONFIGURAÇÃO
// =========================================================

const WHATSAPP = "244935109387";

const MAPA_ESTILO = "https://tiles.openfreemap.org/styles/liberty";

const NOMINATIM = "https://nominatim.openstreetmap.org";


// =========================================================
// 2. ELEMENTOS
// =========================================================

const formulario = document.getElementById("whatsappForm");

const camposCarga = document.getElementById("camposCarga");
const camposCamiao = document.getElementById("camposCamiao");

const formError = document.getElementById("formError");

const radiosTipo = document.querySelectorAll('input[name="tipo"]');

const mapaElemento = document.getElementById("map");
const mapStatus = document.getElementById("mapStatus");

const mapSearch = document.getElementById("mapSearch");
const mapSearchBtn = document.getElementById("mapSearchBtn");
const mapSearchResults = document.getElementById("mapSearchResults");

const usarGPSBtn = document.getElementById("usarGPS");


// =========================================================
// 3. MUNICÍPIOS
// Listas iniciais. "Outro" permite indicar municípios
// que ainda não estejam incluídos.
// =========================================================

const municipiosAngola = {

    "Bengo": [
        "Ambriz",
        "Bula Atumba",
        "Dande",
        "Dembos",
        "Nambuangongo",
        "Pango Aluquém"
    ],

    "Benguela": [
        "Baía Farta",
        "Balombo",
        "Benguela",
        "Bocoio",
        "Caimbambo",
        "Catumbela",
        "Chongorói",
        "Cubal",
        "Ganda",
        "Lobito"
    ],

    "Bié": [
        "Andulo",
        "Camacupa",
        "Catabola",
        "Chinguar",
        "Chitembo",
        "Cuemba",
        "Cunhinga",
        "Cuíto",
        "N'harea"
    ],

    "Cabinda": [
        "Belize",
        "Buco-Zau",
        "Cabinda",
        "Cacongo"
    ],

    "Cuando": [
        "Calai",
        "Cuangar",
        "Cuchi",
        "Dirico",
        "Mavinga",
        "Menongue",
        "Nancova",
        "Rivungo"
    ],

    "Cubango": [
        "Calai",
        "Cuangar",
        "Dirico",
        "Mucusso",
        "Rivungo"
    ],

    "Cuanza Norte": [
        "Ambaca",
        "Banga",
        "Bolongongo",
        "Cambambe",
        "Cazengo",
        "Golungo Alto",
        "Gonguembo",
        "Lucala",
        "Quiculungo",
        "Samba Cajú"
    ],

    "Cuanza Sul": [
        "Amboim",
        "Cassongue",
        "Cela",
        "Conda",
        "Ebo",
        "Libolo",
        "Mussende",
        "Porto Amboim",
        "Quibala",
        "Quilenda",
        "Seles",
        "Sumbe"
    ],

    "Cunene": [
        "Cahama",
        "Cuanhama",
        "Curoca",
        "Cuvelai",
        "Namacunde",
        "Ombadja"
    ],

    "Huambo": [
        "Bailundo",
        "Caála",
        "Catchiungo",
        "Chicala-Cholohanga",
        "Chinjenje",
        "Ecunha",
        "Huambo",
        "Londuimbali",
        "Longonjo",
        "Mungo",
        "Ucuma"
    ],

    "Huíla": [
        "Caconda",
        "Cacula",
        "Caluquembe",
        "Chibia",
        "Chicomba",
        "Chipindo",
        "Cuvango",
        "Gambos",
        "Humpata",
        "Jamba",
        "Lubango",
        "Matala",
        "Quilengues",
        "Quipungo"
    ],

    "Icolo e Bengo": [
        "Cabo Ledo",
        "Catete",
        "Icolo e Bengo",
        "Quiçama"
    ],

    "Luanda": [
        "Belas",
        "Cacuaco",
        "Cazenga",
        "Kilamba Kiaxi",
        "Luanda",
        "Talatona",
        "Viana"
    ],

    "Lunda Norte": [
        "Cambulo",
        "Capenda-Camulemba",
        "Caungula",
        "Chitato",
        "Cuango",
        "Cuílo",
        "Lóvua",
        "Lubalo",
        "Lucapa",
        "Xá-Muteba"
    ],

    "Lunda Sul": [
        "Cacolo",
        "Dala",
        "Muconda",
        "Saurimo"
    ],

    "Malanje": [
        "Cacuso",
        "Calandula",
        "Cambundi-Catembo",
        "Cangandala",
        "Caombo",
        "Cuaba Nzogo",
        "Cunda-Dia-Baze",
        "Luquembo",
        "Malanje",
        "Marimba",
        "Massango",
        "Mucari",
        "Quela",
        "Quirima"
    ],

    "Moxico": [
        "Camanongue",
        "Léua",
        "Luau",
        "Luena",
        "Lumeje",
        "Lutembo"
    ],

    "Moxico Leste": [
        "Cazombo",
        "Cangamba",
        "Lumbala Nguimbo",
        "Lutembo"
    ],

    "Namibe": [
        "Bibala",
        "Camucuio",
        "Moçâmedes",
        "Tômbwa",
        "Virei"
    ],

    "Uíge": [
        "Alto Cauale",
        "Ambuíla",
        "Bembe",
        "Buengas",
        "Bungo",
        "Damba",
        "Macocola",
        "Mucaba",
        "Negage",
        "Puri",
        "Quimbele",
        "Quitexe",
        "Sanza Pombo",
        "Songo",
        "Uíge",
        "Zombo"
    ],

    "Zaire": [
        "Cuimba",
        "Mbanza Kongo",
        "Nóqui",
        "Nzeto",
        "Soyo",
        "Tomboco"
    ]

};


// =========================================================
// 4. ELEMENTOS DE LOCALIZAÇÃO
// =========================================================

const localizacoes = {

    partida: {
        provincia: document.getElementById("partidaProvincia"),
        municipio: document.getElementById("partidaMunicipio"),
        local: document.getElementById("partidaLocal"),
        latitude: document.getElementById("partidaLat"),
        longitude: document.getElementById("partidaLng"),
        coordenadas: document.getElementById("partidaCoordenadas")
    },

    destino: {
        provincia: document.getElementById("destinoProvincia"),
        municipio: document.getElementById("destinoMunicipio"),
        local: document.getElementById("destinoLocal"),
        latitude: document.getElementById("destinoLat"),
        longitude: document.getElementById("destinoLng"),
        coordenadas: document.getElementById("destinoCoordenadas")
    }

};

let alvoMapa = "partida";

let mapa = null;

let marcadores = {
    partida: null,
    destino: null
};

let coordenadas = {
    partida: null,
    destino: null
};


// =========================================================
// 5. ESTADO DO MAPA
// =========================================================

function atualizarEstadoMapa(mensagem) {

    if (mapStatus) {
        mapStatus.textContent = mensagem;
    }

}


// =========================================================
// 6. CARREGAR MUNICÍPIOS
// =========================================================

function carregarMunicipios(tipo) {

    const campos = localizacoes[tipo];

    if (!campos || !campos.provincia || !campos.municipio) {
        return;
    }

    const provincia = campos.provincia.value;

    campos.municipio.innerHTML = "";

    const opcaoInicial = document.createElement("option");

    opcaoInicial.value = "";

    opcaoInicial.textContent = provincia
        ? "Seleccione o município"
        : "Escolha primeiro a província";

    campos.municipio.appendChild(opcaoInicial);

    if (!provincia) {

        campos.municipio.disabled = true;

        return;
    }

    const lista = municipiosAngola[provincia] || [];

    lista.forEach(nome => {

        const opcao = document.createElement("option");

        opcao.value = nome;
        opcao.textContent = nome;

        campos.municipio.appendChild(opcao);

    });

    const outraOpcao = document.createElement("option");

    outraOpcao.value = "Outro";
    outraOpcao.textContent = "Outro / não listado";

    campos.municipio.appendChild(outraOpcao);

    campos.municipio.disabled = false;

}


// =========================================================
// 7. EVENTOS DAS PROVÍNCIAS
// =========================================================

Object.keys(localizacoes).forEach(tipo => {

    const campos = localizacoes[tipo];

    if (!campos.provincia) return;

    campos.provincia.addEventListener("change", () => {

        carregarMunicipios(tipo);

        campos.local.value = "";

        limparCoordenada(tipo);

    });

});


// =========================================================
// 8. TROCAR ENTRE CARGA E CAMIÃO
// =========================================================

function atualizarFormulario(tipo) {

    const modoCamiao = tipo === "truck";

    if (camposCarga) {

        camposCarga.hidden = modoCamiao;

        camposCarga.querySelectorAll("input, select, textarea")
            .forEach(campo => {
                campo.disabled = modoCamiao;
            });

    }

    if (camposCamiao) {

        camposCamiao.hidden = !modoCamiao;

        camposCamiao.querySelectorAll("input, select, textarea")
            .forEach(campo => {
                campo.disabled = !modoCamiao;
            });

    }

    if (formError) {
        formError.textContent = "";
    }

}

radiosTipo.forEach(radio => {

    radio.addEventListener("change", function () {

        atualizarFormulario(this.value);

    });

});


// =========================================================
// 9. BOTÕES DO SITE
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
// 10. INICIALIZAR MAPA
// =========================================================

function inicializarMapa() {

    if (!mapaElemento || typeof maplibregl === "undefined") {

        atualizarEstadoMapa(
            "Não foi possível carregar o mapa. Verifique a ligação à Internet."
        );

        return;
    }

    try {

        mapa = new maplibregl.Map({

            container: "map",

            style: MAPA_ESTILO,

            center: [17.8739, -11.2027],

            zoom: 5.2,

            minZoom: 3,

            maxZoom: 18,

            attributionControl: true

        });

        mapa.addControl(
            new maplibregl.NavigationControl(),
            "top-right"
        );

        mapa.addControl(
            new maplibregl.ScaleControl(),
            "bottom-left"
        );

        mapa.on("load", () => {

            mapa.resize();

            criarLinhaRota();

            atualizarEstadoMapa(
                "Mapa carregado. Escolha a origem ou o destino e marque um ponto."
            );

        });

        mapa.on("click", async evento => {

            const latitude = evento.lngLat.lat;
            const longitude = evento.lngLat.lng;

            await selecionarPonto(
                alvoMapa,
                latitude,
                longitude
            );

        });

        mapa.on("error", evento => {

            console.warn("Erro no mapa:", evento.error);

        });

    }

    catch (erro) {

        console.error("Erro ao inicializar o mapa:", erro);

        atualizarEstadoMapa(
            "Não foi possível iniciar o mapa."
        );

    }

}


// =========================================================
// 11. SELECCIONAR ORIGEM OU DESTINO
// =========================================================

function definirAlvoMapa(tipo) {

    if (!localizacoes[tipo]) return;

    alvoMapa = tipo;

    document.querySelectorAll("[data-map-target]").forEach(botao => {

        botao.classList.toggle(
            "active",
            botao.dataset.mapTarget === tipo
        );

    });

    atualizarEstadoMapa(
        tipo === "partida"
            ? "A marcar a localização de origem."
            : "A marcar a localização de destino."
    );

}

document.querySelectorAll("[data-map-target]").forEach(botao => {

    botao.addEventListener("click", () => {

        definirAlvoMapa(botao.dataset.mapTarget);

    });

});


// =========================================================
// 12. CRIAR / ACTUALIZAR MARCADOR
// =========================================================

async function selecionarPonto(tipo, latitude, longitude, nomeLocal = null) {

    if (!mapa || !localizacoes[tipo]) return;

    const campos = localizacoes[tipo];

    const ponto = {
        latitude: Number(latitude),
        longitude: Number(longitude)
    };

    if (
        !Number.isFinite(ponto.latitude) ||
        !Number.isFinite(ponto.longitude)
    ) {
        atualizarEstadoMapa("Coordenadas inválidas.");
        return;
    }

    coordenadas[tipo] = ponto;

    campos.latitude.value = ponto.latitude.toFixed(7);
    campos.longitude.value = ponto.longitude.toFixed(7);

    campos.coordenadas.textContent =
        `Latitude: ${ponto.latitude.toFixed(6)} | Longitude: ${ponto.longitude.toFixed(6)}`;

    if (nomeLocal) {

        campos.local.value = nomeLocal;

    } else {

        campos.local.value = "A identificar localização...";

        const endereco = await obterEndereco(
            ponto.latitude,
            ponto.longitude
        );

        if (endereco) {

            campos.local.value = endereco;

        } else {

            campos.local.value = "";

        }

    }

    if (marcadores[tipo]) {

        marcadores[tipo].remove();

    }

    const elemento = document.createElement("div");

    elemento.className = tipo === "partida"
        ? "map-marker map-marker-origin"
        : "map-marker map-marker-destination";

    elemento.textContent = tipo === "partida" ? "O" : "D";

    marcadores[tipo] = new maplibregl.Marker({

        element: elemento,

        draggable: true,

        anchor: "center"

    })

        .setLngLat([ponto.longitude, ponto.latitude])

        .addTo(mapa);

    marcadores[tipo].on("dragend", async () => {

        const novaPosicao = marcadores[tipo].getLngLat();

        await selecionarPonto(
            tipo,
            novaPosicao.lat,
            novaPosicao.lng
        );

    });

    actualizarLinhaRota();

    atualizarEstadoMapa(
        tipo === "partida"
            ? "Origem marcada com sucesso."
            : "Destino marcado com sucesso."
    );

    atualizarEstadoMapaCompleto();

}


// =========================================================
// 13. ACTUALIZAR ESTADO DAS DUAS LOCALIZAÇÕES
// =========================================================

function atualizarEstadoMapaCompleto() {

    const origemSelecionada =
        Boolean(coordenadas.partida);

    const destinoSelecionado =
        Boolean(coordenadas.destino);

    if (origemSelecionada && destinoSelecionado) {

        atualizarEstadoMapa(
            "Origem e destino seleccionados com sucesso."
        );

        return;
    }

    if (origemSelecionada) {

        atualizarEstadoMapa(
            "Origem marcada. Agora seleccione o destino."
        );

        return;
    }

    if (destinoSelecionado) {

        atualizarEstadoMapa(
            "Destino marcado. Agora seleccione a origem."
        );

        return;
    }

    atualizarEstadoMapa(
        "Seleccione a origem ou o destino no mapa."
    );

}


// =========================================================
// 14. LIMPAR COORDENADAS
// =========================================================

function limparCoordenada(tipo) {

    coordenadas[tipo] = null;

    const campos = localizacoes[tipo];

    if (!campos) return;

    campos.latitude.value = "";
    campos.longitude.value = "";

    campos.coordenadas.textContent =
        "Nenhum ponto seleccionado no mapa.";

    if (marcadores[tipo]) {

        marcadores[tipo].remove();

        marcadores[tipo] = null;

    }

    actualizarLinhaRota();

    atualizarEstadoMapaCompleto();

}


// =========================================================
// 15. PESQUISAR LOCALIZAÇÃO
// Pesquisa apenas quando o utilizador clica.
// =========================================================

async function pesquisarLocalizacao() {

    if (!mapSearch || !mapSearchBtn || !mapSearchResults) {
        return;
    }

    const pesquisa = mapSearch.value.trim();

    if (!pesquisa) {

        atualizarEstadoMapa("Introduza um local para pesquisar.");

        return;
    }

    if (!mapa) {

        atualizarEstadoMapa("O mapa ainda não está disponível.");

        return;
    }

    mapSearchBtn.disabled = true;
    mapSearchBtn.textContent = "A pesquisar...";

    mapSearchResults.innerHTML = "";
    mapSearchResults.hidden = true;

    try {

        const url = new URL(`${NOMINATIM}/search`);

        url.searchParams.set("format", "jsonv2");
        url.searchParams.set("q", `${pesquisa}, Angola`);
        url.searchParams.set("countrycodes", "ao");
        url.searchParams.set("limit", "5");
        url.searchParams.set("addressdetails", "1");

        const resposta = await fetch(url);

        if (!resposta.ok) {

            throw new Error("Erro na pesquisa de localização.");

        }

        const resultados = await resposta.json();

        if (!resultados.length) {

            atualizarEstadoMapa(
                "Não encontrámos esse local. Experimente outra referência."
            );

            return;
        }

        mostrarResultadosPesquisa(resultados);

        atualizarEstadoMapa(
            `${resultados.length} resultado(s) encontrado(s). Seleccione um local.`
        );

    }

    catch (erro) {

        console.error("Erro na pesquisa:", erro);

        atualizarEstadoMapa(
            "Não foi possível pesquisar. Tente novamente ou marque o ponto manualmente."
        );

    }

    finally {

        mapSearchBtn.disabled = false;
        mapSearchBtn.textContent = "Pesquisar";

    }

}

if (mapSearchBtn) {

    mapSearchBtn.addEventListener("click", pesquisarLocalizacao);

}

if (mapSearch) {

    mapSearch.addEventListener("keydown", evento => {

        if (evento.key === "Enter") {

            evento.preventDefault();

            pesquisarLocalizacao();

        }

    });

}


// =========================================================
// 16. MOSTRAR RESULTADOS DA PESQUISA
// =========================================================

function mostrarResultadosPesquisa(resultados) {

    if (!mapSearchResults) return;

    mapSearchResults.innerHTML = "";

    resultados.forEach(resultado => {

        const botao = document.createElement("button");

        botao.type = "button";

        botao.className = "map-result-item";

        botao.textContent = resultado.display_name;

        botao.addEventListener("click", async () => {

            const latitude = Number(resultado.lat);
            const longitude = Number(resultado.lon);

            mapa.flyTo({

                center: [longitude, latitude],

                zoom: 15,

                essential: true

            });

            await selecionarPonto(
                alvoMapa,
                latitude,
                longitude,
                resultado.display_name
            );

            mapSearchResults.hidden = true;

            mapSearchResults.innerHTML = "";

        });

        mapSearchResults.appendChild(botao);

    });

    mapSearchResults.hidden = false;

}


// =========================================================
// 17. OBTER ENDEREÇO A PARTIR DAS COORDENADAS
// =========================================================

async function obterEndereco(latitude, longitude) {

    try {

        const url = new URL(`${NOMINATIM}/reverse`);

        url.searchParams.set("format", "jsonv2");
        url.searchParams.set("lat", latitude);
        url.searchParams.set("lon", longitude);
        url.searchParams.set("zoom", "18");
        url.searchParams.set("addressdetails", "1");

        const resposta = await fetch(url);

        if (!resposta.ok) {

            throw new Error("Não foi possível identificar o endereço.");

        }

        const dados = await resposta.json();

        return dados.display_name || null;

    }

    catch (erro) {

        console.warn("Erro ao obter endereço:", erro);

        return null;

    }

}


// =========================================================
// 18. UTILIZAR GPS
// =========================================================

if (usarGPSBtn) {

    usarGPSBtn.addEventListener("click", () => {

        if (!navigator.geolocation) {

            atualizarEstadoMapa(
                "O seu navegador não suporta geolocalização."
            );

            return;
        }

        usarGPSBtn.disabled = true;
        usarGPSBtn.textContent = "A obter localização...";

        navigator.geolocation.getCurrentPosition(

            async posicao => {

                try {

                    const latitude = posicao.coords.latitude;
                    const longitude = posicao.coords.longitude;

                    if (mapa) {

                        mapa.flyTo({

                            center: [longitude, latitude],

                            zoom: 16,

                            essential: true

                        });

                    }

                    await selecionarPonto(
                        alvoMapa,
                        latitude,
                        longitude
                    );

                }

                catch (erro) {

                    console.error("Erro ao seleccionar GPS:", erro);

                    atualizarEstadoMapa(
                        "Não foi possível seleccionar a localização GPS."
                    );

                }

                finally {

                    usarGPSBtn.disabled = false;

                    usarGPSBtn.innerHTML =
                        "<span>⌖</span> Usar a minha localização";

                }

            },

            erro => {

                console.warn("Erro GPS:", erro);

                let mensagem = "Não foi possível obter a localização.";

                if (erro.code === erro.PERMISSION_DENIED) {

                    mensagem =
                        "Autorização de localização recusada. Permita o acesso ao GPS.";

                }

                else if (erro.code === erro.POSITION_UNAVAILABLE) {

                    mensagem =
                        "Localização indisponível neste momento.";

                }

                else if (erro.code === erro.TIMEOUT) {

                    mensagem =
                        "A localização demorou demasiado tempo. Tente novamente.";

                }

                atualizarEstadoMapa(mensagem);

                usarGPSBtn.disabled = false;

                usarGPSBtn.innerHTML =
                    "<span>⌖</span> Usar a minha localização";

            },

            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
            }

        );

    });

}


// =========================================================
// 19. CRIAR LINHA ENTRE ORIGEM E DESTINO
// Linha ilustrativa directa, não é uma rota rodoviária.
// =========================================================

function criarLinhaRota() {

    if (!mapa || !mapa.isStyleLoaded()) return;

    if (mapa.getSource("rota-frete")) {

        actualizarLinhaRota();

        return;

    }

    mapa.addSource("rota-frete", {

        type: "geojson",

        data: {

            type: "FeatureCollection",

            features: []

        }

    });

    mapa.addLayer({

        id: "linha-rota-frete",

        type: "line",

        source: "rota-frete",

        layout: {

            "line-cap": "round",

            "line-join": "round"

        },

        paint: {

            "line-color": "#D92332",

            "line-width": 4,

            "line-dasharray": [2, 2]

        }

    });

    actualizarLinhaRota();

}


// =========================================================
// 20. ACTUALIZAR LINHA DA VIAGEM
// =========================================================

function actualizarLinhaRota() {

    if (!mapa || !mapa.getSource("rota-frete")) return;

    const origem = coordenadas.partida;
    const destino = coordenadas.destino;

    const features = [];

    if (origem && destino) {

        features.push({

            type: "Feature",

            geometry: {

                type: "LineString",

                coordinates: [

                    [origem.longitude, origem.latitude],

                    [destino.longitude, destino.latitude]

                ]

            },

            properties: {}

        });

    }

    mapa.getSource("rota-frete").setData({

        type: "FeatureCollection",

        features

    });

}


// =========================================================
// 21. OBTER DADOS DA LOCALIZAÇÃO
// =========================================================

function obterDadosLocalizacao(tipo) {

    const campos = localizacoes[tipo];

    return {

        provincia: campos.provincia.value,

        municipio: campos.municipio.value,

        local: campos.local.value.trim(),

        latitude: campos.latitude.value,

        longitude: campos.longitude.value

    };

}


// =========================================================
// 22. VALIDAR LOCALIZAÇÕES
// =========================================================

function validarLocalizacao(tipo) {

    const dados = obterDadosLocalizacao(tipo);

    const nome = tipo === "partida"
        ? "origem"
        : "destino";

    if (!dados.provincia) {

        throw new Error(
            `Seleccione a província de ${nome}.`
        );

    }

    if (!dados.municipio) {

        throw new Error(
            `Seleccione o município de ${nome}.`
        );

    }

    if (!dados.local || dados.local === "A identificar localização...") {

        throw new Error(
            `Indique a localização exacta de ${nome}.`
        );

    }

    return dados;

}


// =========================================================
// 23. FORMATAR LOCALIZAÇÃO PARA WHATSAPP
// =========================================================

function formatarLocalizacao(titulo, dados) {

    const linhas = [

        `${titulo}:`,

        `Província: ${dados.provincia}`,

        `Município: ${dados.municipio}`,

        `Local: ${dados.local}`

    ];

    if (dados.latitude && dados.longitude) {

        linhas.push(
            `Coordenadas: ${dados.latitude}, ${dados.longitude}`
        );

        linhas.push(
            `Mapa: https://www.google.com/maps?q=${dados.latitude},${dados.longitude}`
        );

    }

    return linhas.join("\n");

}


// =========================================================
// 24. SUBMISSÃO DO FORMULÁRIO
// =========================================================

if (formulario) {

    formulario.addEventListener("submit", function (evento) {

        evento.preventDefault();

        if (formError) {

            formError.textContent = "";

        }

        try {

            const radioSelecionado = document.querySelector(
                'input[name="tipo"]:checked'
            );

            if (!radioSelecionado) {

                throw new Error("Seleccione o tipo de pedido.");

            }

            const tipo = radioSelecionado.value;

            const nome = document.getElementById("nome").value.trim();

            const telefone = document.getElementById("telefone").value.trim();

            const detalhes = document.getElementById("detalhes").value.trim();

            if (!nome || !telefone) {

                throw new Error("Indique o seu nome e telefone.");

            }

            const origem = validarLocalizacao("partida");

            const destino = validarLocalizacao("destino");

            if (
                origem.provincia === destino.provincia &&
                origem.municipio === destino.municipio &&
                origem.local.toLowerCase() === destino.local.toLowerCase()
            ) {

                throw new Error(
                    "A origem e o destino não podem ser iguais."
                );

            }

            const mensagem = [

                "Olá, Frete de Retorno.",

                "",

                tipo === "truck"
                    ? "🚛 TENHO UM CAMIÃO"
                    : "📦 TENHO UMA CARGA",

                "",

                "DADOS DO CLIENTE",

                `Nome: ${nome}`,

                `Telefone: ${telefone}`,

                "",

                formatarLocalizacao("ORIGEM", origem),

                "",

                formatarLocalizacao("DESTINO", destino),

                ""

            ];


            // =============================================
            // MODO CAMIÃO
            // =============================================

            if (tipo === "truck") {

                const tipoCamiao = document
                    .getElementById("tipoCamiao")
                    .value;

                const capacidade = document
                    .getElementById("capacidadeCamiao")
                    .value.trim();

                const regresso = document
                    .getElementById("regressoCamiao")
                    .value.trim();

                mensagem.push("INFORMAÇÕES DO CAMIÃO");

                if (tipoCamiao) {

                    mensagem.push(`Tipo de camião: ${tipoCamiao}`);

                }

                if (capacidade) {

                    mensagem.push(`Capacidade: ${capacidade}`);

                }

                if (regresso) {

                    mensagem.push(`Regresso habitual: ${regresso}`);

                }

            }


            // =============================================
            // MODO CARGA
            // =============================================

            else {

                const tipoCarga = document
                    .getElementById("tipoCarga")
                    .value.trim();

                const pesoCarga = document
                    .getElementById("pesoCarga")
                    .value.trim();

                const dataCarga = document
                    .getElementById("dataCarga")
                    .value;

                let dataFormatada = "";

                if (dataCarga) {

                    const partes = dataCarga.split("-");

                    dataFormatada =
                        `${partes[2]}/${partes[1]}/${partes[0]}`;

                }

                mensagem.push("INFORMAÇÕES DA CARGA");

                if (tipoCarga) {

                    mensagem.push(`Tipo de carga: ${tipoCarga}`);

                }

                if (pesoCarga) {

                    mensagem.push(`Peso aproximado: ${pesoCarga}`);

                }

                if (dataFormatada) {

                    mensagem.push(`Data pretendida: ${dataFormatada}`);

                }

            }


            // =============================================
            // OBSERVAÇÕES
            // =============================================

            if (detalhes) {

                mensagem.push("");

                mensagem.push(`Observações: ${detalhes}`);

            }

            abrirWhatsApp(mensagem);

        }

        catch (erro) {

            if (formError) {

                formError.textContent = erro.message;

            }

            else {

                alert(erro.message);

            }

        }

    });

}


// =========================================================
// 25. ABRIR WHATSAPP
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
// 26. INICIALIZAÇÃO
// =========================================================

atualizarFormulario("cargo");

inicializarMapa();

definirAlvoMapa("partida");


// =========================================================
// 27. ANO AUTOMÁTICO
// =========================================================

const anoAtual = document.getElementById("anoAtual");

if (anoAtual) {

    anoAtual.textContent = new Date().getFullYear();

}
