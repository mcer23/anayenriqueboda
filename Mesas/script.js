// 1. PEGA AQUÍ TU ENLACE DE GOOGLE SHEETS (DEBE TERMINAR EN output=csv)
const urlGoogleSheets = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT8hMdI5i-HsAqb5pJvxwMLcbnYsE6O7YVxyRJmUz0zfrwEaBCP2jz8Qa3e1DfM2vycvOiqOZF74jJX/pub?gid=0&single=true&output=csv";


let invitados = [];

// Diccionario de mapas (Asocia cada mesa con la ruta de su imagen local)
const mapasPorMesa = {
    "Mesa 5": "assets/5.png",
    "Mesa 10": "assets/10.png",
    "Mesa 12": "assets/12.png",
   
    // Agrega las rutas de tus demás mesas aquí...
};

// 2. Jalar los datos de la URL en cuanto carga la página
window.onload = async function() {
    try {
        const respuesta = await fetch(urlGoogleSheets);
        const datosCSV = await respuesta.text();
        
        // Separamos el archivo por filas
        const filas = datosCSV.split("\n");
        
        // Recorremos las filas (empezamos en 1 para saltarnos los encabezados)
        invitados = filas.slice(1).map(fila => {
            // Dividimos la fila por comas
            const columnas = fila.split(",");
            
            // Ajusta los números [0, 1, 2...] según el orden de tus columnas en Excel:
            // [0] es Columna A, [1] es Columna B, [2] es Columna C, etc.
            return {
                id: columnas[0]?.trim(),
                nombre: columnas[1]?.trim(),
                acompanante: columnas[2]?.trim(),
                mesa: columnas[3]?.trim()
            };
        }).filter(i => i.nombre); // Filtra filas vacías
        
        console.log("¡Base de datos de Google Sheets cargada en vivo con éxito!");
    } catch (error) {
        console.error("Error al conectar con Google Sheets:", error);
    }
};

// 3. Función de búsqueda automática (Sin botones, se ejecuta letra por letra)
function buscarInvitado() {
    const query = document.getElementById("searchInput").value.toLowerCase().trim();
    const card = document.getElementById("resultCard");
    const selector = document.getElementById("selectorInvitados");
    const detalle = document.getElementById("detalleInvitado");

    // Limpiamos pantallas anteriores
    selector.innerHTML = "";
    detalle.classList.add("hidden");

    if (query === "" || query.length < 3) {
        card.classList.add("hidden");
        return;
    }

    // .filter encuentra A TODOS los que coincidan con la búsqueda
    const coincidencias = invitados.filter(i => i.nombre.toLowerCase().includes(query));

    if (coincidencias.length > 0) {
        card.classList.remove("hidden");

        // Si hay más de una coincidencia (Homónimos)
        if (coincidencias.length > 1) {
            selector.innerHTML = `<p class="info-text" style="color:#666; margin-bottom:10px;">Encontramos varios resultados. Toca tu nombre:</p>`;
            
            // Creamos un botón por cada persona encontrada
            coincidencias.forEach(invitado => {
                const boton = document.createElement("button");
                boton.innerText = invitado.nombre;
                boton.className = "btn-invitado"; // Puedes darle estilo en tu CSS
                boton.onclick = () => mostrarDetalle(invitado);
                selector.appendChild(boton);
            });
        } else {
            // Si solo hay uno, mostramos la información directo sin hacer clic en nada
            mostrarDetalle(coincidencias[0]);
        }
    } else {
        card.classList.add("hidden");
    }
}

// Función secundaria que pinta el mapa y la mesa de la persona elegida
function mostrarDetalle(invitado) {
    document.getElementById("selectorInvitados").innerHTML = ""; // Limpia los botones
    const detalle = document.getElementById("detalleInvitado");
    
    document.getElementById("resInvitado").innerText = invitado.nombre;
    document.getElementById("resAcompanante").innerText = invitado.acompanante || "Sin acompañante";
    // Extraemos solo los dígitos del campo mesa para el círculo numérico (ej: "Mesa 5" -> "5")
    const soloNumero = invitado.mesa.replace(/\D/g, "");
    document.getElementById("resMesaNum").innerText = soloNumero || "00";
    // Cargamos la imagen desde el diccionario nativo; si no se encuentra, carga una por defecto
    document.getElementById("resMapa").src = mapasPorMesa[invitado.mesa] || "Mapas/mapa_general.jpg";

    // Desplegamos toda la información de golpe
    detalle.classList.remove("hidden");
}
