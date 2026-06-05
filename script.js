let mazo = [];
const figuras = ["C", "D", "H", "S"]; // C = Tréboles, D = Diamantes, H = Corazones, S = Espadas
const alfabeticos = ["A", "J", "Q", "K"];

let puntosJugador = 0;
let puntosPC = 0;

// Arreglos para llevar el registro de las cartas activas en la ronda
let cartasJugadorAcumuladas = [];
let cartasPCAcumuladas = [];

// 1. Vinculamos todos los elementos del HTML
const boton_iniciar_juego = document.querySelector('.btn-nuevo');
const boton_pedir         = document.querySelector('.btn-pedir');
const boton_parar         = document.querySelector('.btn-parar');

const puntosHTML          = document.querySelectorAll('.puntos'); // [0] Jugador, [1] PC
const contenedorJugador   = document.querySelector('#jugador-cartas');
const contenedorPC        = document.querySelector('#pc-cartas');

// Función para inicializar o reiniciar el estado de la partida
const iniciar_juego = () => {
    crear_mazo();
    
    // Reiniciar puntuaciones y limpiar arreglos
    puntosJugador = 0;
    puntosPC = 0;
    cartasJugadorAcumuladas = [];
    cartasPCAcumuladas = [];
    
    // Limpiar marcadores visuales
    puntosHTML[0].innerText = 0;
    puntosHTML[1].innerText = 0;
    
    // Vaciar los contenedores de las cartas
    contenedorJugador.innerHTML = '';
    contenedorPC.innerHTML = '';
    
    // Activar controles de juego
    boton_pedir.disabled = false;
    boton_parar.disabled = false;

    // Repartir automáticamente las dos primeras cartas al jugador
    repartir_carta_jugador();
    repartir_carta_jugador();
}

// Función para generar la baraja completa de 52 cartas
const crear_mazo = () => {
    mazo = []; 

    // Cartas numéricas (2 al 10)
    for (let figura of figuras) {
        for (let valor = 2; valor <= 10; valor++) {
            mazo.push(`${valor}${figura}`);
        }
    }
    
    // Cartas de letras (A, J, Q, K)
    for (let figura of figuras) {
        for (let alfabetico of alfabeticos) {
            mazo.push(`${alfabetico}${figura}`);
        }
    }
    
    barajar_mazo();
    console.log("¡Mazo creado y barajado con éxito!");
    return mazo;
}

// Algoritmo de Fisher-Yates para mezclar las cartas de forma aleatoria
const barajar_mazo = () => {
    for (let i = mazo.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [mazo[i], mazo[j]] = [mazo[j], mazo[i]];
    }
}

// Determinar el valor numérico base de cada carta
const valor_carta = (carta) => {
    const valor = carta.substring(0, carta.length - 1);
    
    if (isNaN(valor)) {
        // J, Q, K valen 10. El As ('A') vale 11 por defecto.
        return (valor === 'A') ? 11 : 10;
    }
    
    return parseInt(valor);
}

// Calcular el total de puntos gestionando la flexibilidad del As (11 o 1)
const calcular_puntos = (cartas) => {
    let total = 0;
    let ases = 0;

    for (let carta of cartas) {
        let valor = valor_carta(carta);
        total += valor;
        if (carta.startsWith('A')) ases++;
    }

    // Si el total excede 21 y el jugador tiene ases, restamos 10 puntos por cada uno
    while (total > 21 && ases > 0) {
        total -= 10;
        ases--;
    }

    return total;
}

// Crea la etiqueta de imagen apuntando a tu carpeta local 'cartas'
const crear_carta_html = (carta) => {
    const img = document.createElement('img');
    
    // Si tus imágenes terminan en .jpg en lugar de .png, edita la extensión aquí abajo
    img.src = `cartas/${carta}.png`; 
    img.classList.add('carta-imagen');
    img.alt = `Carta ${carta}`; 
    
    return img;
}

// Función dedicada a entregarle una carta al jugador
const repartir_carta_jugador = () => {
    if (mazo.length === 0) return;
    
    const carta = mazo.pop();
    cartasJugadorAcumuladas.push(carta);
    
    // Renderizar imagen en pantalla
    contenedorJugador.appendChild(crear_carta_html(carta));
    
    // Actualizar puntos en tiempo real
    puntosJugador = calcular_puntos(cartasJugadorAcumuladas);
    puntosHTML[0].innerText = puntosJugador;
    
    // Validar condiciones críticas del jugador
    if (puntosJugador > 21) {
        deshabilitar_controles();
        setTimeout(() => alert(`Te pasaste de 21 (${puntosJugador}). ¡Gana la PC! 🤖`), 200);
    } else if (puntosJugador === 21) {
        // Si llega a 21 exactos de forma ideal, pasa el turno a la PC de inmediato
        parar_juego();
    }
}

// 2. Función para cuando presionas "Pedir Carta"
const pedir_carta = () => {
    if (mazo.length === 0) {
        alert("Por favor, presiona 'Juego Nuevo' para empezar.");
        return;
    }
    repartir_carta_jugador();
}

// 3. Función para cuando presionas "Parar" (Plantarse)
const parar_juego = () => {
    deshabilitar_controles();
    turno_pc();
}

// 4. Inteligencia Artificial / Lógica para el turno de la PC
const turno_pc = () => {
    // Regla del Casino: La PC pide carta si tiene menos de 17 puntos 
    // O si está por debajo del jugador mientras el jugador no se haya pasado.
    if (puntosPC < 17 && puntosPC <= puntosJugador && puntosJugador <= 21) {
        const carta = mazo.pop();
        cartasPCAcumuladas.push(carta);
        
        contenedorPC.appendChild(crear_carta_html(carta));
        puntosPC = calcular_puntos(cartasPCAcumuladas);
        puntosHTML[1].innerText = puntosPC;
        
        // Un retraso de 600ms para simular que la computadora analiza su jugada
        setTimeout(turno_pc, 600);
    } else {
        // Si la PC ya no debe pedir más cartas, se evalúa la ronda
        determinar_ganador();
    }
}

// Evalúa las puntuaciones y arroja el cuadro de alerta con el resultado
const determinar_ganador = () => {
    setTimeout(() => {
        if (puntosPC === puntosJugador) {
            alert(`¡Es un empate! Ambos tienen ${puntosJugador} 🤝`);
        } else if (puntosJugador > 21) {
            alert("¡Gana la PC! 🤖");
        } else if (puntosPC > 21) {
            alert(`¡Felicidades! La PC se pasó con ${puntosPC} puntos. ¡Tú ganas! 🎉`);
        } else if (puntosJugador > puntosPC) {
            alert(`¡Ganaste la partida! Combinación de ${puntosJugador} contra ${puntosPC} de la PC 😎`);
        } else {
            alert(`Gana la PC: ${puntosPC} a ${puntosJugador} 🤖`);
        }
    }, 300);
}

const deshabilitar_controles = () => {
    boton_pedir.disabled = true;
    boton_parar.disabled = true;
}

// 5. Escuchas de eventos para activar los clicks de los botones
boton_iniciar_juego.addEventListener("click", iniciar_juego);
boton_pedir.addEventListener("click", pedir_carta);
boton_parar.addEventListener("click", parar_juego);

// Deshabilitar botones de acción hasta que se inicialice un "Juego Nuevo"
boton_pedir.disabled = true;
boton_parar.disabled = true;