
"use strict";

// ======================================================
// FRETE DE RETORNO — SCRIPT PRINCIPAL
// Pesquisa dinâmica + mapa + formulário em duas etapas
// ======================================================

// 1. CONFIGURAÇÕES
const WHATSAPP = "244953715148";
const MAPA_ESTILO = "https://tiles.openfreemap.org/styles/liberty";
const NOMINATIM = "https://nominatim.openstreetmap.org";

const CENTRO_ANGOLA = [-11.2027, 17.8739];
const ZOOM_INICIAL = 5.2;

const TEMPO_PESQUISA = 700;
const MINIMO_CARACTERES = 3;

// ======================================================
// 2. ELEMENTOS DO HTML
// ======================================================

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

const mapSearch = document.getElementById("mapSearch");
const mapSearchBtn = document.getElementById("mapSearchBtn");
const mapSearchResults = document.getElementById("mapSearchResults");

const usarGPS = document.getElementById("usarGPS");
const anoAtual = document.getElementById("anoAtual");

// ======================================================
// 3. MUNICÍPIOS DE ANGOLA
// ======================================================

const municipiosAngola = {
    "Bengo": ["Ambriz", "Bula Atumba", "Dande", "Dembos", "Nambuangongo", "Pango Aluquém"],
    "Benguela": ["Baía Farta", "Balombo", "Benguela", "Bocoio", "Caimbambo", "Catumbela", "Chongorói", "Cubal", "Ganda", "Lobito"],
    "Bié": ["Andulo", "Camacupa", "Catabola", "Chinguar", "Chitembo", "Cuemba", "Cunhinga", "Cuíto", "Nharea"],
    "Cabinda": ["Belize", "Buco-Zau", "Cabinda", "Cacongo"],
    "Cuando": ["Cuito Cuanavale", "Dirico", "Mavinga", "Rivungo"],
    "Cubango": ["Calai", "Cuangar", "Cuchi", "Cutato", "Menongue", "Nancova"],
    "Cuanza Norte": ["Ambaca", "Banga", "Bolongongo", "Cambambe", "Cazengo", "Golungo Alto", "Gonguembo", "Lucala", "Quiculungo", "Samba Caju"],
    "Cuanza Sul": ["Amboim", "Cassongue", "Cela", "Conda", "Ebo", "Libolo", "Mussende", "Porto Amboim", "Quibala", "Quilenda", "Seles", "Sumbe"],
    "Cunene": ["Cahama", "Cuanhama", "Curoca", "Cuvelai", "Namacunde", "Ombadja"],
    "Huambo": ["Bailundo", "Caála", "Catchiungo", "Ecunha", "Huambo", "Londuimbali", "Longonjo", "Mungo", "Tchicala-Tcholoanga", "Tchindjenje", "Ucuma"],
    "Huíla": ["Caconda", "Cacula", "Caluquembe", "Chibia", "Chicomba", "Chipindo", "Cuvango", "Gambos", "Humpata", "Jamba", "Lubango", "Matala", "Quilengues", "Quipungo"],
    "Icolo e Bengo": ["Catete", "Bom Jesus", "Cabiri", "Caculo Cahango", "Cassoneca", "Sequele"],
    "Luanda": ["Belas", "Cacuaco", "Cazenga", "Ingombota", "Kilamba Kiaxi", "Maianga", "Mulenvos", "Mussulo", "Rangel", "Sambizanga", "Talatona", "Viana"],
    "Lunda Norte": ["Cambulo", "Capenda Camulemba", "Caungula", "Chitato", "Cuango", "Cuilo", "Lóvua", "Lubalo", "Lucapa", "Xá-Muteba"],
    "Lunda Sul": ["Cacolo", "Dala", "Muconda", "Saurimo"],
    "Malanje": ["Cacuso", "Calandula", "Cambundi-Catembo", "Cangandala", "Caombo", "Cuaba Nzogo", "Cunda-Dia-Baze", "Luquembo", "Malanje", "Marimba", "Massango", "Mucari", "Quela", "Quirima"],
    "Moxico": ["Camanongue", "Léua", "Luau", "Luena", "Luchazes", "Cameia"],
    "Moxico Leste": ["Cazombo", "Lóvua do Zambeze", "Luacano", "Nana Candundo"],
    "Namibe": ["Bibala", "Camucuio", "Moçâmedes", "Tômbwa", "Virei"],
    "Uíge": ["Alto Cauale", "Ambuila", "Bembe", "Buengas", "Bungo", "Damba", "Milunga", "Mucaba", "Negage", "Puri", "Quimbele", "Quitexe", "Sanza Pombo", "Songo", "Uíge", "Zombo"],
    "Zaire": ["Cuimba", "M'banza Kongo", "Noqui", "N'zeto", "Soyo", "Tomboco"]
};

// ======================================================
// 4. LOCALIZAÇÕES
// ======================================================

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

const marcadores = {
    partida: null,
    destino: null
};

const coordenadas = {
    partida: null,
    destino: null
};

let linhaRotaCriada = false;

let temporizadorPesquisa = null;
let controladorPesquisa = null;
let numeroPesquisa = 0;

// ======================================================
// 5. FUNÇÕES AUXILIARES
// ======================================================

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

// ======================================================
// 6. MUNICÍPIOS
// ======================================================

function carregarMunicipios(tipo) {
    const dados = localizacoes[tipo];

    if (!dados || !dados.provincia || !dados.municipio) return;

    const provincia = dados.provincia.value;
    const municipio = dados.municipio;

    municipio.innerHTML = "";

    const lista = municipiosAngola[provincia] || [];

    lista.forEach(nome => {
        const option = document.createElement("option");

        option.value = nome;
        option.textContent = nome;

        municipio.appendChild(option);
    });
}

// ======================================================
// 7. TIPO DE PEDIDO
// ======================================================

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

    document.querySelectorAll("[data-set]").forEach(botao => {
        botao.classList.toggle(
            "active",
            botao.dataset.set === tipo
        );
    });

    limparErro();
    limparErro(formErrorDetalhes);
}

document.querySelectorAll('input[name="tipo"]').forEach(radio => {
    radio.addEventListener("change", () => {
        atualizarFormulario(radio.value);
    });
});

document.querySelectorAll("[data-set]").forEach(botao => {
    botao.addEventListener("click", () => {
        atualizarFormulario(botao.dataset.set);
    });
});

// ======================================================
// 8. ETAPAS DO FORMULÁRIO
// ======================================================

function mostrarEtapa(numero) {
    const mostrarPercurso = numero === 1;

    if (etapaPercurso) {
        etapaPercurso.hidden = !mostrarPercurso;
    }

    if (etapaDetalhes) {
        etapaDetalhes.hidden = mostrarPercurso;
    }

    limparErro();
    limparErro(formErrorDetalhes);

    if (formulario) {
        formulario.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}

function obterDescricaoLocal(tipo) {
    const dados = localizacoes[tipo];

    if (!dados) return "";

    const local = dados.local?.value.trim() || "";
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
        partidaInfo.textContent = origem || "Localização não indicada";
    }

    if (destinoInfo) {
        destinoInfo.textContent = destino || "Localização não indicada";
    }
}

function continuarParaDetalhes() {
    limparErro();

    if (!validarLocalizacao("partida")) {
        mostrarErro("Indique o local de origem.");
        definirAlvoMapa("partida");
        localizacoes.partida.local?.focus();
        return;
    }

    if (!validarLocalizacao("destino")) {
        mostrarErro("Indique o local de destino.");
        definirAlvoMapa("destino");
        localizacoes.destino.local?.focus();
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

// ======================================================
// 9. INICIALIZAÇÃO DO MAPA
// ======================================================

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
            "Pesquise um local ou escolha a origem e o destino."
        );
    });

    mapa.on("click", evento => {
        if (!alvoMapa) return;

        selecionarPonto(
            alvoMapa,
            evento.lngLat.lat,
            evento.lngLat.lng
        );
    });

    mapa.on("error", evento => {
        console.warn("Erro no mapa:", evento.error || evento);
    });

    window.addEventListener("resize", () => {
        if (mapa) mapa.resize();
    });
}

// ======================================================
// 10. DEFINIR ORIGEM OU DESTINO
// ======================================================

function definirAlvoMapa(tipo) {
    if (!localizacoes[tipo]) return;

    alvoMapa = tipo;

    document.querySelectorAll("[data-map-target]").forEach(botao => {
        const ativo = botao.dataset.mapTarget === tipo;

        botao.classList.toggle("active", ativo);
        botao.setAttribute("aria-pressed", String(ativo));
    });

    const nome = tipo === "partida" ? "origem" : "destino";

    atualizarEstadoMapa(
        `A pesquisar ou seleccionar o local de ${nome}.`
    );
}

document.querySelectorAll("[data-map-target]").forEach(botao => {
    botao.addEventListener("click", () => {
        definirAlvoMapa(botao.dataset.mapTarget);
    });
});

// ======================================================
// 11. SELECCIONAR UM PONTO NO MAPA
// ======================================================

async function selecionarPonto(tipo, lat, lng, resultado = null) {
    if (!localizacoes[tipo]) return;

    if (!coordenadasValidas(lat, lng)) {
        atualizarEstadoMapa("Coordenadas inválidas.", "erro");
        return;
    }

    lat = Number(lat);
    lng = Number(lng);

    coordenadas[tipo] = { lat, lng };

    const dados = localizacoes[tipo];

    definirValor(dados.latitude, lat);
    definirValor(dados.longitude, lng);
    definirValor(dados.coordenadas, formatarCoordenadas(lat, lng));

    if (marcadores[tipo]) {
        marcadores[tipo].remove();
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
        boxShadow: "0 2px 12px rgba(0,0,0,.35)",
        cursor: "grab"
    });

    const marcador = new maplibregl.Marker({
        element: elementoMarcador,
        draggable: true
    })
        .setLngLat([lng, lat])
        .addTo(mapa);

    marcadores[tipo] = marcador;

    marcador.on("dragend", async () => {
        const posicao = marcador.getLngLat();

        await selecionarPonto(
            tipo,
            posicao.lat,
            posicao.lng
        );
    });

    atualizarLinhaRota();

    if (resultado) {
        preencherLocalizacao(tipo, resultado);
    } else {
        await obterEndereco(tipo, lat, lng);
    }

    atualizarResumoPercurso();

    const nome = tipo === "partida" ? "Origem" : "Destino";

    atualizarEstadoMapa(
        `${nome} seleccionada: ${obterDescricaoLocal(tipo)}`
    );
}

// ======================================================
// 12. PREENCHER DADOS DA LOCALIZAÇÃO
// ======================================================

function preencherLocalizacao(tipo, resultado) {
    const campos = localizacoes[tipo];

    if (!campos) return;

    const endereco = resultado.address || {};

    definirValor(campos.local, obterNomeLocal(resultado));
    definirValor(campos.provincia, obterNomeProvincia(endereco));
    definirValor(campos.municipio, obterNomeMunicipio(endereco));

    atualizarResumoPercurso();
}

// ======================================================
// 13. IDENTIFICAR ENDEREÇO PELO MAPA
// ======================================================

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

        if (!campos.local.value.trim()) {
            definirValor(
                campos.local,
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

// ======================================================
// 14. PESQUISA AUTOMÁTICA DE LOCALIZAÇÕES
// ======================================================

function agendarPesquisa(consulta, tipo) {
    clearTimeout(temporizadorPesquisa);

    if (controladorPesquisa) {
        controladorPesquisa.abort();
    }

    const texto = consulta.trim();

    if (texto.length < MINIMO_CARACTERES) {
        if (mapSearchResults) {
            mapSearchResults.innerHTML = "";
            mapSearchResults.hidden = true;
        }

        return;
    }

    alvoMapa = tipo;

    definirAlvoMapa(tipo);

    temporizadorPesquisa = setTimeout(() => {
        pesquisarLocalizacao(texto, tipo);
    }, TEMPO_PESQUISA);
}

async function pesquisarLocalizacao(consulta, tipo = alvoMapa) {
    if (!mapSearchResults || !mapa) return;

    const texto = consulta.trim();

    if (texto.length < MINIMO_CARACTERES) return;

    if (controladorPesquisa) {
        controladorPesquisa.abort();
    }

    controladorPesquisa = new AbortController();

    const pedidoAtual = ++numeroPesquisa;

    atualizarEstadoMapa(`A procurar "${texto}"...`);

    try {
        const parametros = new URLSearchParams({
            format: "jsonv2",
            q: texto,
            countrycodes: "ao",
            limit: "6",
            addressdetails: "1"
        });

        const url = `${NOMINATIM}/search?${parametros.toString()}`;

        const resposta = await fetch(url, {
            headers: {
                Accept: "application/json"
            },
            signal: controladorPesquisa.signal
        });

        if (!resposta.ok) {
            throw new Error("Falha na pesquisa.");
        }

        const resultados = await resposta.json();

        if (pedidoAtual !== numeroPesquisa) return;

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

// ======================================================
// 15. MOSTRAR RESULTADOS DA PESQUISA
// ======================================================

function mostrarResultadosPesquisa(resultados, tipo) {
    if (!mapSearchResults) return;

    mapSearchResults.innerHTML = "";

    if (!resultados || resultados.length === 0) {
        mapSearchResults.hidden = true;
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
            complemento || resultado.display_name;

        botao.appendChild(tituloElemento);
        botao.appendChild(detalheElemento);

        botao.addEventListener("click", async () => {
            const lat = Number(resultado.lat);
            const lng = Number(resultado.lon);

            if (!coordenadasValidas(lat, lng)) return;

            alvoMapa = tipo;

            if (mapa) {
                mapa.flyTo({
                    center: [lng, lat],
                    zoom: 15,
                    essential: true
                });
            }

            await selecionarPonto(
                tipo,
                lat,
                lng,
                resultado
            );

            mapSearchResults.hidden = true;

            if (mapSearch) {
                mapSearch.value = "";
            }

            atualizarResumoPercurso();

            const campo = localizacoes[tipo].local;

            if (campo) {
                campo.value = obterNomeLocal(resultado);
            }

            atualizarEstadoMapa(
                `Local seleccionado: ${obterDescricaoLocal(tipo)}`
            );
        });

        mapSearchResults.appendChild(botao);
    });

    mapSearchResults.hidden = false;
}

// ======================================================
// 16. PESQUISA NO CAMPO DO MAPA
// ======================================================

if (mapSearch) {
    mapSearch.addEventListener("input", () => {
        agendarPesquisa(mapSearch.value, alvoMapa);
    });

    mapSearch.addEventListener("keydown", evento => {
        if (evento.key === "Enter") {
            evento.preventDefault();

            clearTimeout(temporizadorPesquisa);

            pesquisarLocalizacao(
                mapSearch.value,
                alvoMapa
            );
        }

        if (evento.key === "Escape" && mapSearchResults) {
            mapSearchResults.hidden = true;
        }
    });
}

if (mapSearchBtn) {
    mapSearchBtn.addEventListener("click", () => {
        pesquisarLocalizacao(mapSearch.value, alvoMapa);
    });
}

// ======================================================
// 17. PESQUISA DIRECTAMENTE NA ORIGEM E NO DESTINO
// ======================================================

["partida", "destino"].forEach(tipo => {
    const campo = localizacoes[tipo].local;

    if (!campo) return;

    campo.addEventListener("input", () => {
        // Ao escrever, ainda não existe uma localização confirmada.
        coordenadas[tipo] = null;

        if (marcadores[tipo]) {
            marcadores[tipo].remove();
            marcadores[tipo] = null;
        }

        const dados = localizacoes[tipo];

        definirValor(dados.latitude, "");
        definirValor(dados.longitude, "");
        definirValor(dados.coordenadas, "");
        definirValor(dados.provincia, "");
        definirValor(dados.municipio, "");

        definirAlvoMapa(tipo);

        agendarPesquisa(campo.value, tipo);

        atualizarResumoPercurso();
    });

    campo.addEventListener("focus", () => {
        definirAlvoMapa(tipo);

        if (campo.value.trim().length >= MINIMO_CARACTERES) {
            agendarPesquisa(campo.value, tipo);
        }
    });

    campo.addEventListener("keydown", evento => {
        if (evento.key === "Enter") {
            evento.preventDefault();

            clearTimeout(temporizadorPesquisa);

            pesquisarLocalizacao(campo.value, tipo);
        }
    });
});

// ======================================================
// 18. GPS
// ======================================================

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

    atualizarEstadoMapa("A obter a tua localização GPS...");

    navigator.geolocation.getCurrentPosition(
        async posicao => {
            const lat = posicao.coords.latitude;
            const lng = posicao.coords.longitude;

            if (mapa) {
                mapa.flyTo({
                    center: [lng, lat],
                    zoom: 16,
                    essential: true
                });
            }

            await selecionarPonto(alvoMapa, lat, lng);

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

// ======================================================
// 19. LINHA DA ROTA
// ======================================================

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

// ======================================================
// 20. DADOS E VALIDAÇÃO DAS LOCALIZAÇÕES
// ======================================================

function obterDadosLocalizacao(tipo) {
    const dados = localizacoes[tipo];

    return {
        provincia: dados.provincia?.value.trim() || "",
        municipio: dados.municipio?.value.trim() || "",
        local: dados.local?.value.trim() || "",
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

    return temLocal || temCoordenadas;
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

// ======================================================
// 21. DESCRIÇÃO DOS LOCAIS
// ======================================================

function montarDescricaoLocal(tipo) {
    return obterDescricaoLocal(tipo) || "Não indicado";
}

// ======================================================
// 22. SUBMISSÃO DO FORMULÁRIO
// ======================================================

if (formulario) {
    formulario.addEventListener("submit", evento => {
        evento.preventDefault();

        limparErro(formErrorDetalhes);

        const nome = obterValor("nome");
        const telefone = obterValor("telefone");

        const tipoSelecionado = document.querySelector(
            'input[name="tipo"]:checked'
        );

        const tipo = tipoSelecionado ? tipoSelecionado.value : "cargo";

        if (!nome) {
            mostrarErro("Informe o seu nome.", formErrorDetalhes);
            document.getElementById("nome")?.focus();
            return;
        }

        if (!telefone) {
            mostrarErro("Informe o seu número de telefone.", formErrorDetalhes);
            document.getElementById("telefone")?.focus();
            return;
        }

        if (!validarLocalizacao("partida") || !validarLocalizacao("destino")) {
            mostrarEtapa(1);
            mostrarErro("Verifique a origem e o destino antes de continuar.");
            return;
        }

        if (mesmaLocalizacao()) {
            mostrarErro("A origem e o destino não podem ser iguais.", formErrorDetalhes);
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

// ======================================================
// 23. WHATSAPP
// ======================================================

function abrirWhatsApp(mensagem) {
    const url =
        `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensagem)}`;

    window.open(url, "_blank", "noopener,noreferrer");
}

// ======================================================
// 24. INICIALIZAÇÃO GERAL
// ======================================================

atualizarFormulario("cargo");

if (anoAtual) {
    anoAtual.textContent = new Date().getFullYear();
}

mostrarEtapa(1);

inicializarMapa();

definirAlvoMapa("partida");
