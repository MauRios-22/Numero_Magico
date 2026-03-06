// Variables del juego
let numeroMagico;
let intentoActual;
let maximoDeIntentos = 10;
let listaIntentos = [];
let finDelJuego = false;
let musicaIniciada = false; // Nueva variable para controlar si la música ya se inició

// Referencias a elementos del DOM
const inputDeNumero = document.getElementById('guessInput');
const btnIngresar = document.getElementById('submitBtn');
const btnReiniciar = document.getElementById('resetBtn');
const mensajeDeFeedBack = document.getElementById('feedbackMessage');
const listaIntentos_DOM = document.getElementById('attemptsList');
const numeroDeIntentos = document.getElementById('attempts');
const intentosRestantes = document.getElementById('remaining');
const iconoPersonaje = document.getElementById('characterIcon');
const bonfireIcon = document.getElementById('bonfireIcon');
const textoViaje = document.getElementById('journeyText');
const contenedorGifVictoria = document.getElementById('victoryGifContainer');
const contenedorGifDerrota = document.getElementById('defeatGifContainer');

// audio elements
const musicaFondo = document.getElementById('musicaFondo');
const musicaVictoria = document.getElementById('musicaVictoria');
const musicaDerrota = document.getElementById('musicaDerrota');

// Event Listeners
btnIngresar.addEventListener('click', hacerConjetura);
btnReiniciar.addEventListener('click', reiniciarJuego);
inputDeNumero.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !finDelJuego) {
        hacerConjetura();
    }
});

// Inicializar el juego
function iniciarJuego() {
    numeroMagico = Math.floor(Math.random() * 100) + 1;
    intentoActual = 1;
    listaIntentos = [];
    finDelJuego = false;
    
    // Limpiar UI
    inputDeNumero.value = '';
    inputDeNumero.disabled = false;
    btnIngresar.disabled = false;
    btnIngresar.style.display = 'block';
    btnReiniciar.style.display = 'none';
    mensajeDeFeedBack.className = 'feedback-message hidden';
    mensajeDeFeedBack.innerHTML = '';
    
    // Actualizar displays
    actualizarVistas();
    actualizarListaIntentos();
    
    // Reiniciar personaje
    iconoPersonaje.src = 'assets/images/personaje.gif';
    iconoPersonaje.style.left = '5%';
    textoViaje.textContent = '🌍 Muy lejos aún...';
    
    inputDeNumero.focus();
    
    // No iniciar música automáticamente aquí, se hará en la primera interacción del usuario
    // asegurar que pistas de victoria/derrota estén pausadas
    if (musicaVictoria) {
        musicaVictoria.pause();
        musicaVictoria.currentTime = 0;
    }
    if (musicaDerrota) {
        musicaDerrota.pause();
        musicaDerrota.currentTime = 0;
    }
    
    console.log('Juego iniciado - Número mágico:', numeroMagico); // Para debugging
}

// Función para realizar una conjetura
function hacerConjetura() {
    const conjetura = parseInt(inputDeNumero.value);
    
    // Validación
    if (isNaN(conjetura) || conjetura < 1 || conjetura > 100) {
        mostarRetroalimentacion('Por favor, ingresa un número válido entre 1 y 100', 'error');
        activarEfectoDaño();
        return;
    }
    
    if (finDelJuego) {
        return;
    }
    
    // Iniciar música de fondo en la primera interacción del usuario
    if (!musicaIniciada) {
        if (musicaFondo) {
            musicaFondo.volume = 0.5;
            musicaFondo.currentTime = 0;
            musicaFondo.play().catch(() => {});
        }
        musicaIniciada = true;
    }
    
    // Agregar intento a la lista
    listaIntentos.push(conjetura);
    
    // Actualizar posición del personaje basado en cercanía
    actualizarPosicionPersonaje(conjetura);
    
    // Mostrar mensaje de feedback
    if (conjetura === numeroMagico) {
        // ¡Ganaste con la fogata!
        mostarRetroalimentacion(
            `🔥 ¡VICTORIA! ¡Lo adivinaste en ${intentoActual} ${intentoActual === 1 ? 'intento' : 'intentos'}!`,
            'success'
        );
        animacionVictoria();
        terminarJuego(true);
    } else if (conjetura > numeroMagico) {
        // El número es mayor - DAÑO
        mostarRetroalimentacion(
            `⚔️ ¡DAÑO! El número mágico es MENOR que ${conjetura}. Intento ${intentoActual} de ${maximoDeIntentos}.`,
            'higher'
        );
        activarEfectoDaño();
        intentoActual++;
        actualizarVistas();
    } else {
        // El número es menor - DAÑO
        mostarRetroalimentacion(
            `⚔️ ¡DAÑO! El número mágico es MAYOR que ${conjetura}. Intento ${intentoActual} de ${maximoDeIntentos}.`,
            'lower'
        );
        activarEfectoDaño();
        intentoActual++;
        actualizarVistas();
    }
    
    // Verificar si se acabaron los intentos - MUERTE
    if (intentoActual > maximoDeIntentos && conjetura !== numeroMagico) {
        mostarRetroalimentacion(
            `💀 FUISTE DERROTADO. El número mágico era: <strong>${numeroMagico}</strong>`,
            'error'
        );
        animacionMuerte();
        terminarJuego(false);
    }
    
    // Actualizar lista de intentos
    actualizarListaIntentos();
    
    // Limpiar input
    inputDeNumero.value = '';
    inputDeNumero.focus();
}

// Función para mostrar feedback
function mostarRetroalimentacion(message, type) {
    mensajeDeFeedBack.innerHTML = message;
    mensajeDeFeedBack.className = `feedback-message ${type}`;
}

// Función para terminar el juego
function terminarJuego(victoria) {
    finDelJuego = true;
    inputDeNumero.disabled = true;
    btnIngresar.disabled = true;
    btnReiniciar.style.display = 'block';
    
    if (victoria) {
        // Cambiar imagen del personaje al estado ganador (opcional)       
        iconoPersonaje.src = 'assets/images/personaje_victoria.gif';
        iconoPersonaje.style.left = '85%';
        textoViaje.textContent = '✨ ¡Descansando en la fogata sagrada!';
        // audio
        if (musicaFondo) musicaFondo.pause();
        if (musicaVictoria) {
            musicaVictoria.currentTime = 0;
            musicaVictoria.play().catch(() => {});
        }
    } else {
        // Cambiar imagen del personaje al estado perdedor (opcional)
        iconoPersonaje.src = 'assets/images/personaje_muerte.gif';
        iconoPersonaje.style.left = '5%';
        textoViaje.textContent = '⚰️ El viajero no logró llegar...';
        // audio
        if (musicaFondo) musicaFondo.pause();
        if (musicaDerrota) {
            musicaDerrota.currentTime = 0;
            musicaDerrota.play().catch(() => {});
        }
    }
}

// Función para actualizar displays
function actualizarVistas() {
    numeroDeIntentos.textContent = intentoActual;
    intentosRestantes.textContent = maximoDeIntentos - intentoActual + 1;
}

// Función para actualizar la lista de intentos
function actualizarListaIntentos() {
    if (listaIntentos.length === 0) {
        listaIntentos_DOM.innerHTML = '<p class="empty-message">Sin intentos aún</p>';
        return;
    }
    
    // Crear badges para cada intento
    const recuadros = listaIntentos.map(attempt => {
        return `<div class="attempt-badge">${attempt}</div>`;
    }).join('');
    
    listaIntentos_DOM.innerHTML = recuadros;
}

// Función para actualizar la posición del personaje basado en cercanía
function actualizarPosicionPersonaje(conjetura) {
    const distancia = Math.abs(conjetura - numeroMagico);
    const distanciaMaxima = 100;
    
    // Calcular el progreso basado en la distancia (más cercano = más progreso)
    const progreso = ((distanciaMaxima - distancia) / distanciaMaxima) * 100;
    
    iconoPersonaje.style.left = (5 + progreso * 0.85) + '%';
    
    // Cambiar el mensaje según la cercanía
    if (distancia > 50) {
        textoViaje.textContent = '🌍 Muy lejos aún...';
    } else if (distancia > 30) {
        textoViaje.textContent = '🚶 El fuego se acerca...';
    } else if (distancia > 15) {
        textoViaje.textContent = '🔥 ¡Casi llegas!';
    } else if (distancia > 0) {
        textoViaje.textContent = '🏃 ¡La salvación está cerca!';
    }
}

// Función para reiniciar el juego
function reiniciarJuego() {
    musicaIniciada = false; // Reset para permitir iniciar música en nueva partida
    iniciarJuego();
}

// Función para generar efecto de daño
function activarEfectoDaño() {
    document.body.classList.add('damage-screen');
    setTimeout(() => {
        document.body.classList.remove('damage-screen');
    }, 400);
}

// Animación de victoria con fogata
function animacionVictoria() {
    // Mostrar GIF de victoria con texto superpuesto
    contenedorGifVictoria.classList.remove('hidden');
    
    setTimeout(() => {
        contenedorGifVictoria.classList.add('hidden');
    }, 3000);
}

// Animación de muerte
function animacionMuerte() {
    // Mostrar GIF de derrota con texto superpuesto
    contenedorGifDerrota.classList.remove('hidden');
    
    setTimeout(() => {
        contenedorGifDerrota.classList.add('hidden');
    }, 3000);
}

// Inicializar el juego cuando se cargue la página
window.addEventListener('DOMContentLoaded', iniciarJuego);
