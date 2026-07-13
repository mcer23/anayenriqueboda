// 1. TU ENLACE
const urlGoogleSheets = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT8hMdI5i-HsAqb5pJvxwMLcbnYsE6O7YVxyRJmUz0zfrwEaBCP2jz8Qa3e1DfM2vycvOiqOZF74jJX/pub?gid=0&single=true&output=csv";

let invitados = [];

const mapasPorMesa = {
    "5": "assets/5.png",
    "10": "assets/10.png",
    "12": "assets/12.png",
};

// 2. LECTOR DE CSV ROBUSTO (Este sí respeta tus comas internas)
window.onload = async function() {
    try {
        const respuesta = await fetch(urlGoogleSheets);
        const datosCSV = await respuesta.text();
        const filas = datosCSV.split("\n");

        invitados = filas.slice(1).map(fila => {
            if (!fila.trim()) return null;

            // Esta lógica separa por comas pero IGNORA las que están entre comillas
            const columnas = [];
            let celdaActual = '';
            let dentroDeComillas = false;

            for (let i = 0; i < fila.length; i++) {
                let char = fila[i];
                if (char === '"') dentroDeComillas = !dentroDeComillas;
                else if (char === ',' && !dentroDeComillas) {
                    columnas.push(celdaActual.trim());
                    celdaActual = '';
                } else {
                    celdaActual += char;
                }
            }
            columnas.push(celdaActual.trim());

            return {
                nombre: columnas[1],
                acompanante: columnas[2], // Aquí entran todos los acompañantes juntos
                mesa: columnas[3]         // Ya no se desplaza
            };
        }).filter(i => i && i.nombre);
        
        console.log("Datos cargados correctamente:", invitados);
    } catch (error) {
        console.error("Error:", error);
    }
};

// 3. BUSCADOR
function buscarInvitado() {
    const query = document.getElementById("searchInput").value.toLowerCase().trim();
    const card = document.getElementById("resultCard");
    const selector = document.getElementById("selectorInvitados");
    const detalle = document.getElementById("detalleInvitado");

    selector.innerHTML = "";
    detalle.classList.add("hidden");

    if (query.length < 3) { card.classList.add("hidden"); return; }

    const coincidencias = invitados.filter(i => i.nombre.toLowerCase().includes(query));

    if (coincidencias.length > 0) {
        card.classList.remove("hidden");
        if (coincidencias.length > 1) {
            coincidencias.forEach(invitado => {
                const boton = document.createElement("button");
                boton.innerText = invitado.nombre;
                boton.className = "btn-invitado";
                boton.onclick = () => mostrarDetalle(invitado);
                selector.appendChild(boton);
            });
        } else {
            mostrarDetalle(coincidencias[0]);
        }
    } else {
        card.classList.add("hidden");
    }
}

// 4. MOSTRAR DETALLE (Versión corregida para forzar la detección del número y mapa)
function mostrarDetalle(invitado) {
    document.getElementById("selectorInvitados").innerHTML = "";
    const detalle = document.getElementById("detalleInvitado");
    
    document.getElementById("resInvitado").innerText = invitado.nombre;
    
    // Acompañantes (Ya funcionando)
    const resAcompanante = document.getElementById("resAcompanante");
    if (invitado.acompanante) {
        const lista = invitado.acompanante.replace(/"/g, "").split(",");
        resAcompanante.innerHTML = lista.map(n => n.trim()).join("<br>");
    } else {
        resAcompanante.innerText = "Sin acompañante";
    }
    
    // === SOLUCIÓN PARA LA MESA Y EL MAPA ===
    // 1. Limpiamos agresivamente el valor eliminando comillas, saltos de línea (\r, \n) y espacios
    let numeroMesa = "00";
    if (invitado.mesa) {
        numeroMesa = invitado.mesa.replace(/["\r\n]/g, "").trim();
    }
    
    // 2. Pintamos el número limpio en el círculo de la pantalla
    document.getElementById("resMesaNum").innerText = numeroMesa || "00";
    
    // 3. Buscamos en el diccionario. Si no coincide, imprimimos una alerta en la consola para saber qué falló
    const rutaMapa = mapasPorMesa[numeroMesa];
    
    if (rutaMapa) {
        document.getElementById("resMapa").src = rutaMapa;
        console.log("¡Mapa cargado con éxito para la mesa:", numeroMesa);
    } else {
        document.getElementById("resMapa").src = "Mapas/mapa_general.jpg";
        console.warn("Alerta: El script leyó el número '" + numeroMesa + "', pero no existe esa clave exacta en mapasPorMesa al principio del script.");
    }

    detalle.classList.remove("hidden");
}

// ==========================================
// 5. FUNCIÓN PARA LIMPIAR LA BÚSQUEDA
// ==========================================
function limpiarBusqueda() {
    // 1. Limpiamos el cuadro de texto donde el usuario escribe
    document.getElementById("searchInput").value = "";
    
    // 2. Escondemos la tarjeta de resultados completa
    document.getElementById("resultCard").classList.add("hidden");
    
    // 3. Escondemos la sección interna de detalles
    document.getElementById("detalleInvitado").classList.add("hidden");
    
    // 4. Limpiamos los botones de nombres duplicados si existían
    document.getElementById("selectorInvitados").innerHTML = "";
    
    console.log("Búsqueda e interfaz limpiadas con éxito.");
}
