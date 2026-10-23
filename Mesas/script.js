
// ======================================================
// 1. CONFIGURACIÓN DE GOOGLE SHEETS
// ======================================================

const urlGoogleSheets = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT8hMdI5i-HsAqb5pJvxwMLcbnYsE6O7YVxyRJmUz0zfrwEaBCP2jz8Qa3e1DfM2vycvOiqOZF74jJX/pub?gid=0&single=true&output=csv";

let invitados = [];


// ======================================================
// 2. CONFIGURACIÓN DE MAPAS POR MESA
// ======================================================

const mapasPorMesa = {
    "5": "assets/5.png",
    "10": "assets/10.png",
    "12": "assets/12.png",
};


// ======================================================
// 3. NORMALIZAR TELÉFONOS
// ======================================================

function normalizarTelefono(telefono) {
    let digitos = String(telefono || "").replace(/\D/g, "");

    // Eliminar el prefijo mexicano 52 si tiene 12 dígitos.
    if (digitos.length === 12 && digitos.startsWith("52")) {
        digitos = digitos.slice(2);
    }

    return digitos;
}


// ======================================================
// 4. PROCESAR ARCHIVO CSV
// ======================================================

function parsearCSV(fila) {
    const columnas = [];
    let celdaActual = "";
    let dentroDeComillas = false;

    for (let i = 0; i < fila.length; i++) {
        const char = fila[i];

        if (char === '"') {
            if (dentroDeComillas && fila[i + 1] === '"') {
                celdaActual += '"';
                i++;
            } else {
                dentroDeComillas = !dentroDeComillas;
            }
        } else if (char === "," && !dentroDeComillas) {
            columnas.push(celdaActual.trim());
            celdaActual = "";
        } else {
            celdaActual += char;
        }
    }

    columnas.push(celdaActual.trim());

    return columnas;
}


// ======================================================
// 5. CARGAR INVITADOS DESDE GOOGLE SHEETS
// ======================================================

// Columnas:
// A = ID
// B = Teléfono
// C = Nombre del invitado
// D = Nombre del acompañante
// E = Número de mesa

window.onload = async function () {
    try {
        const respuesta = await fetch(urlGoogleSheets);

        if (!respuesta.ok) {
            throw new Error("No se pudo cargar Google Sheets.");
        }

        const datosCSV = await respuesta.text();

        const filas = datosCSV
            .replace(/^\uFEFF/, "")
            .split(/\r?\n/);

        invitados = filas.slice(1)
            .filter(fila => fila.trim())
            .map(fila => {
                const columnas = parsearCSV(fila);

                return {
                    id: columnas[0] || "",
                    telefono: normalizarTelefono(columnas[1] || ""),
                    nombre: columnas[2] || "",
                    acompanante: columnas[3] || "",
                    mesa: (columnas[4] || "")
                        .replace(/["\r\n]/g, "")
                        .trim()
                };
            })
            .filter(invitado =>
                invitado.nombre &&
                invitado.telefono.length === 10
            );

        console.log("Invitados cargados:", invitados.length);

    } catch (error) {
        console.error("Error al cargar invitados:", error);
    }
};


// ======================================================
// 6. BUSCAR INVITADO POR TELÉFONO
// ======================================================

function buscarInvitado() {
    const input = document.getElementById("searchInput");
    const query = normalizarTelefono(input.value);

    const card = document.getElementById("resultCard");
    const selector = document.getElementById("selectorInvitados");
    const detalle = document.getElementById("detalleInvitado");

    selector.innerHTML = "";
    detalle.classList.add("hidden");

    // Esperar hasta que se ingresen los 10 dígitos.
    if (query.length !== 10) {
        card.classList.add("hidden");
        return;
    }

    // Buscar coincidencia exacta del teléfono.
    const coincidencias = invitados.filter(
        invitado => invitado.telefono === query
    );

    if (coincidencias.length === 1) {
        card.classList.remove("hidden");
        mostrarDetalle(coincidencias[0]);

    } else if (coincidencias.length > 1) {
        card.classList.remove("hidden");

        selector.textContent =
            "Este número está asociado a varios registros. Contacta a los anfitriones.";

    } else {
        card.classList.remove("hidden");

        selector.textContent =
            "No encontramos una invitación con ese número. Verifica los 10 dígitos.";
    }
}


// ======================================================
// 7. MOSTRAR DETALLES DE LA INVITACIÓN
// ======================================================

function mostrarDetalle(invitado) {
    document.getElementById("selectorInvitados").innerHTML = "";

    const detalle = document.getElementById("detalleInvitado");

    // Nombre del invitado: columna C.
    document.getElementById("resInvitado").textContent =
        invitado.nombre;

    // Nombre del acompañante: columna D.
    document.getElementById("resAcompanante").textContent =
        invitado.acompanante.trim() || "Sin acompañante";

    // Número de mesa: columna E.
    const numeroMesa = invitado.mesa || "00";

    document.getElementById("resMesaNum").textContent =
        numeroMesa;

    // Cargar el mapa de la mesa correspondiente.
    const rutaMapa = mapasPorMesa[numeroMesa];

    document.getElementById("resMapa").src =
        rutaMapa || "Mapas/mapa_general.jpg";

    detalle.classList.remove("hidden");
}


// ======================================================
// 8. LIMPIAR BÚSQUEDA
// ======================================================

function limpiarBusqueda() {
    document.getElementById("searchInput").value = "";

    document.getElementById("resultCard")
        .classList.add("hidden");

    document.getElementById("detalleInvitado")
        .classList.add("hidden");

    document.getElementById("selectorInvitados").innerHTML = "";

    console.log("Búsqueda limpiada correctamente.");
}
