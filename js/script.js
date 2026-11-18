"use strict";

// ======================================================
// FRETE DE RETORNO — SCRIPT PRINCIPAL
// Pesquisa automática + mapa + formulário em duas etapas
// ======================================================

// 1. CONFIGURAÇÕES

const WHATSAPP = "244935109387";
const MAPA_ESTILO = "https://tiles.openfreemap.org/styles/liberty";
const NOMINATIM = "https://nominatim.openstreetmap.org";

const CENTRO_ANGOLA = [-11.2027, 17.8739];
const ZOOM_INICIAL = 5.2;

const TEMPO_PESQUISA = 600;
const MINIMO_CARACTERES = 3;

// 2. ELEMENTOS HTML

const formulario = document.getElementById("whatsappForm");

const camposCarga = document.getElementById("camposCarga");
const camposCamiao = document.getElementById("camposCamiao");

const formError = document.getElementById("formError");
const formErrorDetalhes = document.getElementById("formErrorDetalhes");

const etapaPercurso = document.getElementById("etapaPercurso");
const etapaDetalhes = document.getElementById("etapaDetalhes");

const continuarDetalhes = document.getElementById("continuarDetalhes");
const voltarPercurso = document.getElementById("voltarPercurso");
const voltarPercursoSecundario = document.getElementById("voltarPercursoSecundario");

const resumoOrigem = document.getElementById("resumoOrigem");
const resumoDestino = document.getElementById("resumoDestino");

const partidaInfo = document.getElementById("partidaInfo");
const destinoInfo = document.getElementById("destinoInfo");

const mapaElemento = document.getElementById("map");
const mapStatus = document.getElementById("mapStatus");

const usarGPS = document.getElementById("usarGPS");
const anoAtual = document.getElementById("anoAtual");

// 3. CAMPOS DE LOCALIZAÇÃO

const localizacoes = {
    partida: {
        campo: document.getElementById("partidaLocal"),
        resultados: document.getElementById("partidaResultados"),
        provincia: document.getElementById("partidaProvincia"),
        municipio: document.getElementById("partidaMunicipio"),
        latitude: document.getElementById("partidaLat"),
        longitude: document.getElementById("partidaLng"),
        coordenadas: document.getElementById("partidaCoordenadas")
    },

    destino: {
        campo: document.getElementById("destinoLocal"),
        resultados: document.getElementById("destinoResultados"),
        provincia: document.getElementById("destinoProvincia"),
        municipio: document.getElementById("destinoMunicipio"),
        latitude: document.getElementById("destinoLat"),
        longitude: document.getElementById("destinoLng"),
        coordenadas: document.getElementById("destinoCoordenadas")
    }
};

let mapa = null;
let alvoMapa = "partida";

const marcadores = {
    partida: null,
    destino: null
};

const coordenadas = {
    partida: null,
    destino: null
};

const temporizadoresPesquisa = {
    partida: null,
    destino: null
};

const controladoresPesquisa = {
    partida: null,
    destino: null
};

const numerosPesquisa = {
    partida: 0,
    destino: 0
};

let linhaRotaCriada = false;

// 4. FUNÇÕES AUXILIARES

function obterValor(id) {
    const elemento = document.getElementById(id);
    return elemento ? elemento.value.trim() : "";
}

function definirValor(elemento, valor) {
    if (elemento) {
        elemento.value = valor || "";
    }
}

function atualizarEstadoMapa(mensagem, tipo = "normal") {
    if (!mapStatus) return;

    mapStatus.textContent = mensagem;
    mapStatus.dataset.status = tipo;
}

function mostrarErro(mensagem, elemento = formError) {
    if (!elemento) return;

    elemento.textContent = mensagem;
    elemento.hidden = false;

    elemento.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });
}

function limparErro(elemento = formError) {
    if (!elemento) return;

    elemento.textContent = "";
    elemento.hidden = true;
}

function formatarCoordenadas(lat, lng) {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

function coordenadasValidas(lat, lng) {
    return (
        Number.isFinite(Number(lat)) &&
        Number.isFinite(Number(lng)) &&
        Math.abs(Number(lat)) <= 90 &&
        Math.abs(Number(lng)) <= 180
    );
}

function obterNomeProvincia(endereco) {
    return (
        endereco.state ||
        endereco.province ||
        endereco.region ||
        ""
    );
}

function obterNomeMunicipio(endereco) {
    return (
        endereco.city ||
        endereco.town ||
        endereco.municipality ||
        endereco.county ||
        endereco.village ||
        ""
    );
}

function obterNomeLocal(resultado) {
    const endereco = resultado.address || {};

    return (
        resultado.name ||
        endereco.neighbourhood ||
        endereco.suburb ||
        endereco.quarter ||
        endereco.village ||
        endereco.town ||
        endereco.city ||
        resultado.display_name ||
        ""
    );
}

// 5. TIPO DE PEDIDO

function atualizarFormulario(tipo) {
    document.querySelectorAll('input[name="tipo"]').forEach(radio => {
        radio.checked = radio.value === tipo;
    });

    if (camposCarga) {
        camposCarga.hidden = tipo !== "cargo";
    }

    if (camposCamiao) {
        camposCamiao.hidden = tipo !== "truck";
    }

    limparErro();
    limparErro(formErrorDetalhes);
}

document.querySelectorAll('input[name="tipo"]').forEach(radio => {
    radio.addEventListener("change", () => {
        atualizarFormulario(radio.value);
    });
});

// 6. DESCRIÇÃO DAS LOCALIZAÇÕES

function obterDescricaoLocal(tipo) {
    const dados = localizacoes[tipo];

    if (!dados) return "";

    const local = dados.campo?.value.trim() || "";
    const municipio = dados.municipio?.value.trim() || "";
    const provincia = dados.provincia?.value.trim() || "";

    const partes = [];

    [local, municipio, provincia].forEach(parte => {
        if (
            parte &&
            !partes.some(existente =>
                existente.toLowerCase() === parte.toLowerCase()
            )
        ) {
            partes.push(parte);
        }
    });

    return partes.join(", ");
}

function atualizarResumoPercurso() {
    const origem = obterDescricaoLocal("partida");
    const destino = obterDescricaoLocal("destino");

    if (resumoOrigem) {
        resumoOrigem.textContent = origem || "Origem não seleccionada";
    }

    if (resumoDestino) {
        resumoDestino.textContent = destino || "Destino não seleccionado";
    }

    if (partidaInfo) {
        partidaInfo.textContent = origem || "Indique o local de origem.";
    }

    if (destinoInfo) {
        destinoInfo.textContent = destino || "Indique o local de destino.";
    }
}

// 7. ETAPAS DO FORMULÁRIO

function mostrarEtapa(numero) {
    const mostrarPercurso = numero === 1;

    if (etapaPercurso) {
        etapaPercurso.hidden = !mostrarPercurso;
    }

    if (etapaDetalhes) {
        etapaDetalhes.hidden = mostrarPercurso;
    }

    fecharTodasSugestoes();

    limparErro();
    limparErro(formErrorDetalhes);

    if (formulario) {
        formulario.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}

function continuarParaDetalhes() {
    limparErro();

    if (!validarLocalizacao("partida")) {
        mostrarErro("Seleccione uma localização válida para a origem.");
        localizacoes.partida.campo?.focus();
        return;
    }

    if (!validarLocalizacao("destino")) {
        mostrarErro("Seleccione uma localização válida para o destino.");
        localizacoes.destino.campo?.focus();
        return;
    }

    if (mesmaLocalizacao()) {
        mostrarErro("A origem e o destino não podem ser iguais.");
        return;
    }

    atualizarResumoPercurso();
    mostrarEtapa(2);
}

if (continuarDetalhes) {
    continuarDetalhes.addEventListener("click", continuarParaDetalhes);
}

if (voltarPercurso) {
    voltarPercurso.addEventListener("click", () => mostrarEtapa(1));
}

if (voltarPercursoSecundario) {
    voltarPercursoSecundario.addEventListener("click", () => mostrarEtapa(1));
}

// 8. FECHAR SUGESTÕES

function fecharSugestoes(tipo) {
    const resultados = localizacoes[tipo]?.resultados;
    const campo = localizacoes[tipo]?.campo;

    if (resultados) {
        resultados.hidden = true;
    }

    if (campo) {
        campo.setAttribute("aria-expanded", "false");
    }
}

function fecharTodasSugestoes() {
    fecharSugestoes("partida");
    fecharSugestoes("destino");
}

// 9. INICIALIZAÇÃO DO MAPA

function inicializarMapa() {
    if (!mapaElemento) {
        console.error("Elemento #map não encontrado.");
        return;
    }

    if (typeof maplibregl === "undefined") {
        atualizarEstadoMapa("Não foi possível carregar o mapa.", "erro");
        return;
    }

    mapa = new maplibregl.Map({
        container: mapaElemento,
        style: MAPA_ESTILO,
        center: CENTRO_ANGOLA,
        zoom: ZOOM_INICIAL,
        attributionControl: true
    });

    mapa.addControl(
        new maplibregl.NavigationControl(),
        "top-right"
    );

    mapa.addControl(
        new maplibregl.ScaleControl({
            maxWidth: 100,
            unit: "metric"
        }),
        "bottom-left"
    );

    mapa.on("load", () => {
        mapa.resize();
        criarLinhaRota();

        atualizarEstadoMapa(
            "Pesquise a origem e o destino para visualizar o percurso."
        );
    });

    mapa.on("error", evento => {
        console.warn("Erro no mapa:", evento.error || evento);
    });

    window.addEventListener("resize", () => {
        if (mapa) {
            mapa.resize();
        }
    });
}

// 10. DEFINIR LOCAL ACTIVO

function definirAlvoMapa(tipo) {
    if (!localizacoes[tipo]) return;

    alvoMapa = tipo;
}

// 11. LIMPAR LOCALIZAÇÃO ANTIGA

function limparLocalizacao(tipo) {
    const dados = localizacoes[tipo];

    if (!dados) return;

    coordenadas[tipo] = null;

    if (marcadores[tipo]) {
        marcadores[tipo].remove();
        marcadores[tipo] = null;
    }

    definirValor(dados.provincia, "");
    definirValor(dados.municipio, "");
    definirValor(dados.latitude, "");
    definirValor(dados.longitude, "");
    definirValor(dados.coordenadas, "");

    atualizarLinhaRota();
    atualizarResumoPercurso();
}

// 12. SELECCIONAR LOCALIZAÇÃO

async function selecionarPonto(tipo, lat, lng, resultado = null) {
    if (!localizacoes[tipo]) return;

    if (!coordenadasValidas(lat, lng)) {
        atualizarEstadoMapa("Coordenadas inválidas.", "erro");
        return;
    }

    lat = Number(lat);
    lng = Number(lng);

    const dados = localizacoes[tipo];

    coordenadas[tipo] = { lat, lng };

    definirValor(dados.latitude, lat);
    definirValor(dados.longitude, lng);
    definirValor(dados.coordenadas, formatarCoordenadas(lat, lng));

    if (marcadores[tipo]) {
        marcadores[tipo].remove();
        marcadores[tipo] = null;
    }

    const cor = tipo === "partida" ? "#16A36A" : "#DC5555";

    const elementoMarcador = document.createElement("div");

    elementoMarcador.className = `marcador-frete marcador-${tipo}`;

    Object.assign(elementoMarcador.style, {
        width: "22px",
        height: "22px",
        borderRadius: "50%",
        background: cor,
        border: "3px solid #ffffff",
        boxShadow: "0 2px 12px rgba(0,0,0,.35)"
    });

    if (mapa && typeof maplibregl !== "undefined") {
        const marcador = new maplibregl.Marker({
            element: elementoMarcador
        })
            .setLngLat([lng, lat])
            .addTo(mapa);

        marcadores[tipo] = marcador;
    }

    if (resultado) {
        preencherLocalizacao(tipo, resultado);
    } else {
        await obterEndereco(tipo, lat, lng);
    }

    atualizarLinhaRota();
    atualizarResumoPercurso();
    ajustarVisualizacaoRota();

    fecharSugestoes(tipo);

    atualizarEstadoMapa(
        `${tipo === "partida" ? "Origem" : "Destino"} seleccionado: ${obterDescricaoLocal(tipo)}`
    );
}

// 13. PREENCHER DADOS DA LOCALIZAÇÃO

function preencherLocalizacao(tipo, resultado) {
    const campos = localizacoes[tipo];

    if (!campos) return;

    const endereco = resultado.address || {};

    definirValor(campos.campo, obterNomeLocal(resultado));
    definirValor(campos.provincia, obterNomeProvincia(endereco));
    definirValor(campos.municipio, obterNomeMunicipio(endereco));

    atualizarResumoPercurso();
}

// 14. IDENTIFICAR ENDEREÇO POR COORDENADAS

async function obterEndereco(tipo, lat, lng) {
    try {
        const url =
            `${NOMINATIM}/reverse?format=jsonv2` +
            `&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;

        const resposta = await fetch(url, {
            headers: {
                Accept: "application/json"
            }
        });

        if (!resposta.ok) {
            throw new Error("Não foi possível identificar o endereço.");
        }

        const dados = await resposta.json();

        preencherLocalizacao(tipo, dados);

        return dados;

    } catch (erro) {
        console.warn("Erro ao identificar endereço:", erro);

        const campos = localizacoes[tipo];

        if (!campos.campo.value.trim()) {
            definirValor(
                campos.campo,
                `Localização GPS (${lat.toFixed(5)}, ${lng.toFixed(5)})`
            );
        }

        atualizarEstadoMapa(
            "Ponto marcado. Não foi possível identificar o nome exacto."
        );

        atualizarResumoPercurso();

        return null;
    }
}

// 15. PESQUISA AUTOMÁTICA

function agendarPesquisa(consulta, tipo) {
    clearTimeout(temporizadoresPesquisa[tipo]);

    if (controladoresPesquisa[tipo]) {
        controladoresPesquisa[tipo].abort();
        controladoresPesquisa[tipo] = null;
    }

    const texto = consulta.trim();

    if (texto.length < MINIMO_CARACTERES) {
        fecharSugestoes(tipo);
        return;
    }

    definirAlvoMapa(tipo);

    temporizadoresPesquisa[tipo] = setTimeout(() => {
        pesquisarLocalizacao(texto, tipo);
    }, TEMPO_PESQUISA);
}

async function pesquisarLocalizacao(consulta, tipo) {
    const dados = localizacoes[tipo];

    if (!dados || !dados.resultados || !mapa) return;

    const texto = consulta.trim();

    if (texto.length < MINIMO_CARACTERES) {
        fecharSugestoes(tipo);
        return;
    }

    if (controladoresPesquisa[tipo]) {
        controladoresPesquisa[tipo].abort();
    }

    const controlador = new AbortController();

    controladoresPesquisa[tipo] = controlador;

    const pedidoAtual = ++numerosPesquisa[tipo];

    atualizarEstadoMapa(`A procurar "${texto}"...`);

    try {
        const parametros = new URLSearchParams({
            format: "jsonv2",
            q: texto,
            countrycodes: "ao",
            limit: "7",
            addressdetails: "1"
        });

        const url = `${NOMINATIM}/search?${parametros.toString()}`;

        const resposta = await fetch(url, {
            headers: {
                Accept: "application/json"
            },
            signal: controlador.signal
        });

        if (!resposta.ok) {
            throw new Error("Falha na pesquisa.");
        }

        const resultados = await resposta.json();

        if (pedidoAtual !== numerosPesquisa[tipo]) return;

        // Evita mostrar resultados de uma pesquisa anterior.
        if (dados.campo.value.trim() !== texto) return;

        mostrarResultadosPesquisa(resultados, tipo);

        if (!resultados.length) {
            atualizarEstadoMapa("Não encontramos esse local.", "erro");
            return;
        }

        atualizarEstadoMapa(
            `${resultados.length} sugestões encontradas.`
        );

    } catch (erro) {
        if (erro.name === "AbortError") return;

        console.error("Erro na pesquisa:", erro);

        atualizarEstadoMapa(
            "Não foi possível pesquisar. Verifique a ligação à internet.",
            "erro"
        );
    }
}

// 16. MOSTRAR SUGESTÕES

function mostrarResultadosPesquisa(resultados, tipo) {
    const dados = localizacoes[tipo];

    if (!dados || !dados.resultados) return;

    const contentor = dados.resultados;

    contentor.innerHTML = "";

    if (!resultados || resultados.length === 0) {
        fecharSugestoes(tipo);
        return;
    }

    resultados.forEach(resultado => {
        const botao = document.createElement("button");

        botao.type = "button";
        botao.className = "map-search-result";

        const endereco = resultado.address || {};

        const titulo = obterNomeLocal(resultado);

        const complemento = [
            obterNomeMunicipio(endereco),
            obterNomeProvincia(endereco)
        ].filter(Boolean).join(", ");

        const tituloElemento = document.createElement("strong");
        tituloElemento.textContent = titulo;

        const detalheElemento = document.createElement("small");
        detalheElemento.textContent =
            complemento || resultado.display_name || "";

        botao.appendChild(tituloElemento);
        botao.appendChild(detalheElemento);

        botao.addEventListener("click", async () => {
            const lat = Number(resultado.lat);
            const lng = Number(resultado.lon);

            if (!coordenadasValidas(lat, lng)) return;

            clearTimeout(temporizadoresPesquisa[tipo]);

            if (controladoresPesquisa[tipo]) {
                controladoresPesquisa[tipo].abort();
            }

            definirAlvoMapa(tipo);

            definirValor(dados.campo, obterNomeLocal(resultado));

            fecharSugestoes(tipo);

            if (mapa) {
                mapa.flyTo({
                    center: [lng, lat],
                    zoom: 14,
                    essential: true,
                    duration: 1200
                });
            }

            await selecionarPonto(
                tipo,
                lat,
                lng,
                resultado
            );
        });

        contentor.appendChild(botao);
    });

    contentor.hidden = false;

    dados.campo.setAttribute("aria-expanded", "true");
}

// 17. EVENTOS DOS CAMPOS DE ORIGEM E DESTINO

["partida", "destino"].forEach(tipo => {
    const dados = localizacoes[tipo];

    if (!dados.campo) return;

    dados.campo.addEventListener("input", () => {
        limparErro();

        limparLocalizacao(tipo);

        definirAlvoMapa(tipo);

        agendarPesquisa(dados.campo.value, tipo);
    });

    dados.campo.addEventListener("focus", () => {
        definirAlvoMapa(tipo);

        const texto = dados.campo.value.trim();

        if (texto.length >= MINIMO_CARACTERES) {
            agendarPesquisa(texto, tipo);
        }
    });

    dados.campo.addEventListener("keydown", evento => {
        if (evento.key === "Enter") {
            evento.preventDefault();

            clearTimeout(temporizadoresPesquisa[tipo]);

            pesquisarLocalizacao(
                dados.campo.value,
                tipo
            );
        }

        if (evento.key === "Escape") {
            fecharSugestoes(tipo);
        }
    });
});

// 18. FECHAR SUGESTÕES AO CLICAR FORA

document.addEventListener("click", evento => {
    Object.keys(localizacoes).forEach(tipo => {
        const dados = localizacoes[tipo];

        if (!dados.campo || !dados.resultados) return;

        const clicouNoCampo = dados.campo.contains(evento.target);
        const clicouNasSugestoes = dados.resultados.contains(evento.target);

        if (!clicouNoCampo && !clicouNasSugestoes) {
            fecharSugestoes(tipo);
        }
    });
});

// 19. GPS

function usarLocalizacaoGPS() {
    if (!navigator.geolocation) {
        atualizarEstadoMapa(
            "O teu navegador não suporta localização GPS.",
            "erro"
        );
        return;
    }

    if (usarGPS) {
        usarGPS.disabled = true;
    }

    // O GPS é usado como origem.
    definirAlvoMapa("partida");

    atualizarEstadoMapa("A obter a tua localização GPS...");

    navigator.geolocation.getCurrentPosition(
        async posicao => {
            const lat = posicao.coords.latitude;
            const lng = posicao.coords.longitude;

            if (mapa) {
                mapa.flyTo({
                    center: [lng, lat],
                    zoom: 15,
                    essential: true
                });
            }

            limparLocalizacao("partida");

            await selecionarPonto(
                "partida",
                lat,
                lng
            );

            if (usarGPS) {
                usarGPS.disabled = false;
            }
        },

        erro => {
            console.warn("Erro GPS:", erro);

            let mensagem = "Não foi possível obter a localização.";

            if (erro.code === erro.PERMISSION_DENIED) {
                mensagem = "Permita o acesso à localização no navegador.";
            } else if (erro.code === erro.POSITION_UNAVAILABLE) {
                mensagem = "A localização não está disponível.";
            } else if (erro.code === erro.TIMEOUT) {
                mensagem = "O tempo para obter a localização terminou.";
            }

            atualizarEstadoMapa(mensagem, "erro");

            if (usarGPS) {
                usarGPS.disabled = false;
            }
        },

        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 10000
        }
    );
}

if (usarGPS) {
    usarGPS.addEventListener("click", usarLocalizacaoGPS);
}

// 20. CRIAR LINHA DA ROTA

function criarLinhaRota() {
    if (!mapa || linhaRotaCriada) return;

    if (!mapa.getSource("rota-frete")) {
        mapa.addSource("rota-frete", {
            type: "geojson",
            data: {
                type: "Feature",
                geometry: {
                    type: "LineString",
                    coordinates: []
                }
            }
        });
    }

    if (!mapa.getLayer("linha-rota-frete")) {
        mapa.addLayer({
            id: "linha-rota-frete",
            type: "line",
            source: "rota-frete",
            paint: {
                "line-color": "#d6a64f",
                "line-width": 4,
                "line-opacity": 0.9,
                "line-dasharray": [2, 2]
            }
        });
    }

    linhaRotaCriada = true;

    atualizarLinhaRota();
}

// 21. ACTUALIZAR LINHA DA ROTA

function atualizarLinhaRota() {
    if (!mapa || !mapa.getSource("rota-frete")) return;

    const origem = coordenadas.partida;
    const destino = coordenadas.destino;

    const pontos = origem && destino
        ? [
            [origem.lng, origem.lat],
            [destino.lng, destino.lat]
        ]
        : [];

    mapa.getSource("rota-frete").setData({
        type: "Feature",
        geometry: {
            type: "LineString",
            coordinates: pontos
        },
        properties: {}
    });
}

// 22. AJUSTAR VISUALIZAÇÃO DO MAPA

function ajustarVisualizacaoRota() {
    if (!mapa) return;

    const origem = coordenadas.partida;
    const destino = coordenadas.destino;

    if (origem && destino) {
        const limites = new maplibregl.LngLatBounds();

        limites.extend([origem.lng, origem.lat]);
        limites.extend([destino.lng, destino.lat]);

        mapa.fitBounds(limites, {
            padding: {
                top: 65,
                bottom: 65,
                left: 65,
                right: 65
            },
            maxZoom: 11,
            duration: 1000
        });

        return;
    }

    if (origem) {
        mapa.flyTo({
            center: [origem.lng, origem.lat],
            zoom: 12,
            duration: 900
        });

        return;
    }

    if (destino) {
        mapa.flyTo({
            center: [destino.lng, destino.lat],
            zoom: 12,
            duration: 900
        });
    }
}

// 23. VALIDAR LOCALIZAÇÕES

function obterDadosLocalizacao(tipo) {
    const dados = localizacoes[tipo];

    return {
        provincia: dados.provincia?.value.trim() || "",
        municipio: dados.municipio?.value.trim() || "",
        local: dados.campo?.value.trim() || "",
        latitude: dados.latitude?.value.trim() || "",
        longitude: dados.longitude?.value.trim() || "",
        coordenadas: dados.coordenadas?.value.trim() || ""
    };
}

function validarLocalizacao(tipo) {
    const dados = obterDadosLocalizacao(tipo);

    const temLocal = Boolean(dados.local);

    const temCoordenadas = coordenadasValidas(
        dados.latitude,
        dados.longitude
    );

    return temLocal && temCoordenadas;
}

function mesmaLocalizacao() {
    const origem = coordenadas.partida;
    const destino = coordenadas.destino;

    if (origem && destino) {
        const distanciaLat = Math.abs(origem.lat - destino.lat);
        const distanciaLng = Math.abs(origem.lng - destino.lng);

        return distanciaLat < 0.0001 && distanciaLng < 0.0001;
    }

    const dadosOrigem = obterDadosLocalizacao("partida");
    const dadosDestino = obterDadosLocalizacao("destino");

    return Boolean(
        dadosOrigem.local &&
        dadosDestino.local &&
        dadosOrigem.local.toLowerCase() === dadosDestino.local.toLowerCase()
    );
}

// 24. DESCRIÇÃO DOS LOCAIS

function montarDescricaoLocal(tipo) {
    return obterDescricaoLocal(tipo) || "Não indicado";
}

// 25. ENVIO DO FORMULÁRIO

if (formulario) {
    formulario.addEventListener("submit", evento => {
        evento.preventDefault();

        limparErro(formErrorDetalhes);

        const nome = obterValor("nome");
        const telefone = obterValor("telefone");

        const tipoSelecionado = document.querySelector(
            'input[name="tipo"]:checked'
        );

        const tipo = tipoSelecionado
            ? tipoSelecionado.value
            : "cargo";

        if (!nome) {
            mostrarErro("Informe o seu nome.", formErrorDetalhes);
            document.getElementById("nome")?.focus();
            return;
        }

        if (!telefone) {
            mostrarErro(
                "Informe o seu número de telefone.",
                formErrorDetalhes
            );

            document.getElementById("telefone")?.focus();
            return;
        }

        if (
            !validarLocalizacao("partida") ||
            !validarLocalizacao("destino")
        ) {
            mostrarEtapa(1);

            mostrarErro(
                "Verifique a origem e o destino antes de continuar."
            );

            return;
        }

        if (mesmaLocalizacao()) {
            mostrarErro(
                "A origem e o destino não podem ser iguais.",
                formErrorDetalhes
            );

            return;
        }

        const origem = montarDescricaoLocal("partida");
        const destino = montarDescricaoLocal("destino");

        let mensagem = "";

        mensagem += "*NOVO PEDIDO — FRETE DE RETORNO*\n\n";

        mensagem += `*Nome:* ${nome}\n`;
        mensagem += `*Telefone:* ${telefone}\n\n`;

        mensagem += tipo === "cargo"
            ? "*TIPO DE PEDIDO: TENHO UMA CARGA*\n\n"
            : "*TIPO DE PEDIDO: TENHO UM CAMIÃO*\n\n";

        mensagem += "*PERCURSO*\n";
        mensagem += `*Origem:* ${origem}\n`;
        mensagem += `*Destino:* ${destino}\n\n`;

        if (tipo === "cargo") {
            mensagem += "*INFORMAÇÕES DA CARGA*\n";

            mensagem += `*Tipo de carga:* ${obterValor("tipoCarga") || "Não indicado"}\n`;
            mensagem += `*Peso:* ${obterValor("pesoCarga") || "Não indicado"}\n`;
            mensagem += `*Data:* ${obterValor("dataCarga") || "Não indicada"}\n\n`;
        } else {
            mensagem += "*INFORMAÇÕES DO CAMIÃO*\n";

            mensagem += `*Tipo de camião:* ${obterValor("tipoCamiao") || "Não indicado"}\n`;
            mensagem += `*Capacidade:* ${obterValor("capacidadeCamiao") || "Não indicada"}\n`;
            mensagem += `*Regresso:* ${obterValor("regressoCamiao") || "Não indicado"}\n\n`;
        }

        const detalhes = obterValor("detalhes");

        if (detalhes) {
            mensagem += "*OBSERVAÇÕES*\n";
            mensagem += `${detalhes}\n\n`;
        }

        mensagem += "_Pedido enviado através do site Frete de Retorno._";

        abrirWhatsApp(mensagem);
    });
}

// 26. WHATSAPP

function abrirWhatsApp(mensagem) {
    const url =
        `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensagem)}`;

    window.open(url, "_blank", "noopener,noreferrer");
}

// 27. INICIALIZAÇÃO GERAL

atualizarFormulario("cargo");

if (anoAtual) {
    anoAtual.textContent = new Date().getFullYear();
}

mostrarEtapa(1);

inicializarMapa();
