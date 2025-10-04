let tiempo = 60;
let nivel = 1;
let paresEncontrados = 0;
let totalPares = 6;
let cartasVolteadas = [];
let puedeVoltear = true;
let intervalo;

const tiempoSpan = document.getElementById("tiempo");
const nivelSpan = document.getElementById("nivel");
const paresSpan = document.getElementById("pares");
const memoryGame = document.getElementById("memory-game");

// Sistema de sonidos
const SoundSystem = {
  createSound(freqStart, freqEnd, type, duration, volume) {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(freqStart, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(freqEnd, audioContext.currentTime + duration);
      
      gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
      
      return { audioContext, oscillator, gainNode };
    } catch (error) {
      console.log('Audio no disponible');
    }
  },
  
  playHover() {
    this.createSound(200, 400, 'sine', 0.1, 0.1);
  },
  
  playClick() {
    this.createSound(400, 200, 'square', 0.2, 0.2);
  },
  
  playCardFlip() {
    this.createSound(200, 300, 'sine', 0.2, 0.15);
  },
  
  playCardMatch() {
    // Sonido ascendente para acierto
    this.createSound(300, 800, 'sine', 0.4, 0.3);
    // Segundo tono para más riqueza
    setTimeout(() => this.createSound(400, 600, 'sine', 0.3, 0.2), 100);
  },
  
  playCardMismatch() {
    // Sonido descendente para error
    this.createSound(500, 200, 'sawtooth', 0.3, 0.2);
  },
  
  playLevelComplete() {
    // Fanfarria de victoria
    this.createSound(400, 800, 'sine', 0.5, 0.4);
    setTimeout(() => this.createSound(600, 1000, 'sine', 0.4, 0.3), 200);
    setTimeout(() => this.createSound(800, 1200, 'sine', 0.3, 0.2), 400);
  },
  
  playTimeWarning() {
    this.createSound(400, 300, 'square', 0.3, 0.3);
  },
  
  playTimeUp() {
    this.createSound(500, 100, 'sawtooth', 1.0, 0.4);
  }
};

// Símbolos Dark Fantasy (6 pares)
const simbolos = [
  '👁️', '⚔️', '🛡️', '🏰', '🐉', '👑',
  '👁️', '⚔️', '🛡️', '🏰', '🐉', '👑'
];

function playHoverSound() {
  SoundSystem.playHover();
}

// Mezclar array
function mezclarArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Crear el tablero de juego
function crearTablero() {
  memoryGame.innerHTML = '';
  const simbolosMezclados = mezclarArray([...simbolos]);
  
  simbolosMezclados.forEach(simbolo => {
    const card = document.createElement('div');
    card.classList.add('card');
    
    // Solo el símbolo en el frente, reverso vacío
    card.innerHTML = `
      <div class="front">${simbolo}</div>
      <div class="back"></div>
    `;
    
    card.addEventListener('click', () => voltearCarta(card, simbolo));
    memoryGame.appendChild(card);
  });
}

// Voltear carta
function voltearCarta(card, simbolo) {
  if (!puedeVoltear || card.classList.contains('flipped') || card.classList.contains('matched')) {
    return;
  }
  
  // Sonido al voltear carta
  SoundSystem.playCardFlip();
  
  // Efecto visual al voltear
  card.classList.add('flipped');
  cartasVolteadas.push({card, simbolo});
  
  if (cartasVolteadas.length === 2) {
    puedeVoltear = false;
    setTimeout(verificarPar, 600);
  }
}

// Verificar si las cartas forman un par
function verificarPar() {
  const [carta1, carta2] = cartasVolteadas;
  
  if (carta1.simbolo === carta2.simbolo) {
    // Par encontrado - Éxito
    SoundSystem.playCardMatch();
    
    setTimeout(() => {
      carta1.card.classList.add('matched');
      carta2.card.classList.add('matched');
      paresEncontrados++;
      paresSpan.textContent = `PAREJAS: ${paresEncontrados}/${totalPares}`;
      
      // Efecto visual de éxito
      carta1.card.style.animation = 'pulseSuccess 0.5s ease-in-out';
      carta2.card.style.animation = 'pulseSuccess 0.5s ease-in-out';
      
      setTimeout(() => {
        carta1.card.style.animation = '';
        carta2.card.style.animation = '';
      }, 500);
      
      cartasVolteadas = [];
      puedeVoltear = true;
      
      // Verificar si completó el nivel
      if (paresEncontrados === totalPares) {
        clearInterval(intervalo);
        SoundSystem.playLevelComplete();
        setTimeout(() => {
          const mensaje = `🎭 ¡EL ORDEN HA SIDO RESTAURADO! 🎭\n\nHas completado el Nivel ${nivel}\n⏱️ Tiempo restante: ${tiempo} segundos\n\nLos espíritus ancestrales te observan con aprobación...`;
          alert(mensaje);
          // Aquí puedes redirigir al siguiente nivel
          // window.location.href = "nivel2.html";
        }, 800);
      }
    }, 500);
  } else {
    // No es par - Fracaso
    SoundSystem.playCardMismatch();
    
    setTimeout(() => {
      carta1.card.style.animation = 'shake 0.5s ease-in-out';
      carta2.card.style.animation = 'shake 0.5s ease-in-out';
      
      setTimeout(() => {
        carta1.card.classList.remove('flipped');
        carta2.card.classList.remove('flipped');
        carta1.card.style.animation = '';
        carta2.card.style.animation = '';
        cartasVolteadas = [];
        puedeVoltear = true;
      }, 500);
    }, 800);
  }
}

// Iniciar temporizador
function iniciarTemporizador() {
  clearInterval(intervalo);
  tiempo = 60;
  tiempoSpan.textContent = `TIEMPO: ${tiempo}`;
  tiempoSpan.style.color = '#e0d3b8';
  tiempoSpan.style.animation = '';
  
  intervalo = setInterval(() => {
    if (tiempo > 0) {
      tiempo--;
      tiempoSpan.textContent = `TIEMPO: ${tiempo}`;
      
      // Cambiar color cuando quede poco tiempo
      if (tiempo === 10) {
        SoundSystem.playTimeWarning();
      }
      
      if (tiempo <= 10) {
        tiempoSpan.style.color = '#ff4444';
        tiempoSpan.style.animation = tiempoSpan.style.animation ? '' : 'pulse 1s infinite';
      } else if (tiempo <= 30) {
        tiempoSpan.style.color = '#ffaa00';
      }
    } else {
      clearInterval(intervalo);
      tiempoSpan.style.color = '#ff4444';
      SoundSystem.playTimeUp();
      setTimeout(() => {
        alert("⏳ ¡EL TIEMPO SE AGOTÓ!\n\nLas sombras reclaman su territorio...\nEl ritual debe comenzar de nuevo.");
        reiniciarNivel();
      }, 500);
    }
  }, 1000);
}

// Reiniciar nivel
function reiniciarNivel() {
  SoundSystem.playClick();
  tiempo = 60;
  paresEncontrados = 0;
  cartasVolteadas = [];
  puedeVoltear = true;
  
  tiempoSpan.textContent = `TIEMPO: ${tiempo}`;
  tiempoSpan.style.color = '#e0d3b8';
  tiempoSpan.style.animation = '';
  paresSpan.textContent = `PAREJAS: ${paresEncontrados}/${totalPares}`;
  
  // Limpiar y recrear el tablero
  crearTablero();
  iniciarTemporizador();
}

// Volver al menú
function volver() {
  SoundSystem.playClick();
  if (confirm("¿ABANDONAR EL RITUAL?\n\nEl progreso actual se perderá en las tinieblas...")) {
    clearInterval(intervalo);
    setTimeout(() => {
      window.location.href = "niveles.html";
    }, 300);
  }
}

// Añadir estilos de animación
const style = document.createElement('style');
style.textContent = `
  @keyframes pulseSuccess {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); box-shadow: 0 0 30px #2e8b57; }
    100% { transform: scale(1); }
  }
  
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    75% { transform: translateX(10px); }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
`;
document.head.appendChild(style);

// Inicializar juego
function iniciarJuego() {
  nivelSpan.textContent = "NIVEL: 1 - SOMBRAS ANCESTRALES";
  paresSpan.textContent = `PAREJAS: ${paresEncontrados}/${totalPares}`;
  crearTablero();
  iniciarTemporizador();
}

// Iniciar el juego cuando la página cargue
document.addEventListener('DOMContentLoaded', iniciarJuego);