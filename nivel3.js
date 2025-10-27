let tiempo = 90;
let nivel = 3;
let paresEncontrados = 0;
let totalPares = 10;
let cartasVolteadas = [];
let puedeVoltear = true;
let intervalo;
let efectoActivo = false;
let cartasBloqueadas = [];

const tiempoSpan = document.getElementById("tiempo");
const nivelSpan = document.getElementById("nivel");
const paresSpan = document.getElementById("pares");
const memoryGame = document.getElementById("memory-game");
const efectoActivoDiv = document.getElementById("efecto-activo");
const tiempoExtraDiv = document.getElementById("tiempo-extra");

// Sistema de sonidos
const SoundSystem = {
  sounds: {
    hover: null,
    click: null,
    cardFlip: null,
    cardMatch: null,
    vortex: null,
    ghost: null,
    key: null,
    lightning: null,
    levelComplete: null,
    timeWarning: null,
    timeUp: null
  },
  
  init() {
    // Cargar elementos de audio
    this.sounds.hover = document.getElementById('hoverSound');
    this.sounds.click = document.getElementById('clickSound');
    this.sounds.cardFlip = document.getElementById('cardFlipSound');
    this.sounds.cardMatch = document.getElementById('cardMatchSound');
    this.sounds.vortex = document.getElementById('vortexSound');
    this.sounds.ghost = document.getElementById('ghostSound');
    this.sounds.key = document.getElementById('keySound');
    this.sounds.lightning = document.getElementById('lightningSound');
    this.sounds.levelComplete = document.getElementById('levelCompleteSound');
    this.sounds.timeWarning = document.getElementById('timeWarningSound');
    this.sounds.timeUp = document.getElementById('timeUpSound');
    
    // Configurar volúmenes
    if (this.sounds.vortex) this.sounds.vortex.volume = 0.7;
    if (this.sounds.ghost) this.sounds.ghost.volume = 0.6;
    if (this.sounds.key) this.sounds.key.volume = 0.5;
    if (this.sounds.lightning) this.sounds.lightning.volume = 0.8;
  },
  
  playHover() {
    this.playSound(this.sounds.hover);
  },
  
  playClick() {
    this.playSound(this.sounds.click);
  },
  
  playCardFlip() {
    this.playSound(this.sounds.cardFlip);
  },
  
  playCardMatch() {
    this.playSound(this.sounds.cardMatch);
  },
  
  playVortex() {
    this.playSound(this.sounds.vortex);
  },
  
  playGhost() {
    this.playSound(this.sounds.ghost);
  },
  
  playKey() {
    this.playSound(this.sounds.key);
  },
  
  playLightning() {
    this.playSound(this.sounds.lightning);
  },
  
  playLevelComplete() {
    this.playSound(this.sounds.levelComplete);
  },
  
  playTimeWarning() {
    this.playSound(this.sounds.timeWarning);
  },
  
  playTimeUp() {
    this.playSound(this.sounds.timeUp);
  },
  
  playSound(soundElement) {
    if (soundElement) {
      soundElement.currentTime = 0;
      soundElement.play().catch(error => {
        console.log('Error reproduciendo sonido:', error);
      });
    }
  }
};

// Símbolos Nivel 3 con cartas especiales avanzadas
const simbolosNivel3 = [
  '👁️', '⚔️', '🛡️', '🏰', '🐉', '👑', '🌀', '👻', '🗝️', '⚡',
  '👁️', '⚔️', '🛡️', '🏰', '🐉', '👑', '🌀', '👻', '🗝️', '⚡'
];

// Cartas especiales avanzadas y sus efectos
const cartasEspeciales = {
  '🌀': {
    nombre: 'Vórtice Temporal',
    efecto: function() {
      const tiempoPerdido = 5;
      tiempo = Math.max(0, tiempo - tiempoPerdido);
      tiempoSpan.textContent = `TIEMPO: ${tiempo}`;
      mostrarEfectoActivo('🌀 Vórtice Temporal: -5 segundos!');
      mostrarTiempoExtra(`-${tiempoPerdido}s`);
      SoundSystem.playVortex();
      
      // Efecto visual en todas las cartas
      const cards = document.querySelectorAll('.card');
      cards.forEach(card => {
        card.classList.add('efecto-vortex');
        setTimeout(() => card.classList.remove('efecto-vortex'), 1000);
      });
    }
  },
  '👻': {
    nombre: 'Fantasma Engañoso',
    efecto: function() {
      mostrarEfectoActivo('👻 Fantasma Engañoso: ¡Duplicación temporal!');
      SoundSystem.playGhost();
      duplicarCartaTemporalmente();
    }
  },
  '🗝️': {
    nombre: 'Llave Antigua',
    efecto: function() {
      mostrarEfectoActivo('🗝️ Llave Antigua: ¡Carta bloqueada!');
      SoundSystem.playKey();
      bloquearCartaAleatoria();
    }
  },
  '⚡': {
    nombre: 'Relámpago Ancestral',
    efecto: function() {
      mostrarEfectoActivo('⚡ Relámpago: ¡Revelación momentánea!');
      SoundSystem.playLightning();
      revelarTodasLasCartasMomentaneamente();
    }
  }
};

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
  cartasBloqueadas = [];
  const simbolosMezclados = mezclarArray([...simbolosNivel3]);
  
  simbolosMezclados.forEach(simbolo => {
    const card = document.createElement('div');
    card.classList.add('card');
    
    // Marcar cartas especiales
    if (['🌀', '👻', '🗝️', '⚡'].includes(simbolo)) {
      card.classList.add('especial');
    }
    
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
  if (!puedeVoltear || card.classList.contains('flipped') || card.classList.contains('encontrada') || efectoActivo || cartasBloqueadas.includes(card)) {
    return;
  }
  
  SoundSystem.playCardFlip();
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
    // Par encontrado
    SoundSystem.playCardMatch();
    
    // Verificar si es una carta especial
    if (cartasEspeciales[carta1.simbolo]) {
      efectoActivo = true;
      
      // MARCAR COMO ENCONTRADAS (GRIS)
      carta1.card.style.background = 'linear-gradient(135deg, #666666 0%, #999999 100%)';
      carta2.card.style.background = 'linear-gradient(135deg, #666666 0%, #999999 100%)';
      carta1.card.classList.add('encontrada');
      carta2.card.classList.add('encontrada');
      
      paresEncontrados++;
      paresSpan.textContent = `PAREJAS: ${paresEncontrados}/${totalPares}`;
      
      // APLICAR EL EFECTO ESPECIAL
      setTimeout(() => {
        cartasEspeciales[carta1.simbolo].efecto();
        
        setTimeout(() => {
          cartasVolteadas = [];
          puedeVoltear = true;
          efectoActivo = false;
          verificarNivelCompletado();
        }, 1500);
      }, 500);
    } else {
      // Carta normal - MARCAR COMO ENCONTRADAS (GRIS)
      carta1.card.style.background = 'linear-gradient(135deg, #666666 0%, #999999 100%)';
      carta2.card.style.background = 'linear-gradient(135deg, #666666 0%, #999999 100%)';
      carta1.card.classList.add('encontrada');
      carta2.card.classList.add('encontrada');
      
      paresEncontrados++;
      paresSpan.textContent = `PAREJAS: ${paresEncontrados}/${totalPares}`;
      cartasVolteadas = [];
      puedeVoltear = true;
      verificarNivelCompletado();
    }
  } else {
    // No es par
    setTimeout(() => {
      carta1.card.style.animation = 'shake 0.5s ease-in-out';
      carta2.card.style.animation = 'shake 0.5s ease-in-out';
      
      setTimeout(() => {
        // Voltear las cartas de nuevo
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

// Efectos especiales avanzados
function duplicarCartaTemporalmente() {
  const cards = document.querySelectorAll('.card:not(.encontrada):not(.flipped)');
  if (cards.length > 0) {
    const randomCard = cards[Math.floor(Math.random() * cards.length)];
    const clone = randomCard.cloneNode(true);
    
    // Posicionar el clon cerca de la carta original
    const rect = randomCard.getBoundingClientRect();
    clone.style.position = 'absolute';
    clone.style.left = `${rect.left + 20}px`;
    clone.style.top = `${rect.top + 20}px`;
    clone.style.zIndex = '1000';
    clone.style.opacity = '0.7';
    clone.classList.add('efecto-fantasma');
    
    document.body.appendChild(clone);
    
    // Remover después de 3 segundos
    setTimeout(() => {
      clone.remove();
    }, 3000);
  }
}

function bloquearCartaAleatoria() {
  const cards = document.querySelectorAll('.card.encontrada');
  if (cards.length > 0) {
    const randomCard = cards[Math.floor(Math.random() * cards.length)];
    cartasBloqueadas.push(randomCard);
    randomCard.classList.add('bloqueada');
    randomCard.classList.add('efecto-bloqueo');
    
    setTimeout(() => {
      randomCard.classList.remove('efecto-bloqueo');
    }, 1500);
    
    // Desbloquear después de 5 segundos
    setTimeout(() => {
      const index = cartasBloqueadas.indexOf(randomCard);
      if (index > -1) {
        cartasBloqueadas.splice(index, 1);
        randomCard.classList.remove('bloqueada');
      }
    }, 5000);
  }
}

function revelarTodasLasCartasMomentaneamente() {
  const cards = document.querySelectorAll('.card:not(.encontrada)');
  
  // Aplicar efecto de relámpago a todo el contenedor
  memoryGame.classList.add('efecto-relampago');
  
  // Voltear todas las cartas momentáneamente
  cards.forEach(card => {
    if (!card.classList.contains('flipped')) {
      card.classList.add('flipped');
    }
  });
  
  // Restaurar después de 2 segundos
  setTimeout(() => {
    memoryGame.classList.remove('efecto-relampago');
    cards.forEach(card => {
      if (!card.classList.contains('encontrada') && cartasVolteadas.findIndex(c => c.card === card) === -1) {
        card.classList.remove('flipped');
      }
    });
  }, 2000);
}

function mostrarEfectoActivo(mensaje) {
  efectoActivoDiv.textContent = mensaje;
  efectoActivoDiv.classList.add('mostrar');
  
  setTimeout(() => {
    efectoActivoDiv.classList.remove('mostrar');
  }, 3000);
}

function mostrarTiempoExtra(mensaje) {
  tiempoExtraDiv.textContent = mensaje;
  tiempoExtraDiv.classList.add('mostrar');
  
  setTimeout(() => {
    tiempoExtraDiv.classList.remove('mostrar');
  }, 2000);
}

function verificarNivelCompletado() {
  if (paresEncontrados === totalPares) {
    clearInterval(intervalo);
    SoundSystem.playLevelComplete();
    
    setTimeout(() => {
      const mensaje = `🌌 ¡EL ABISMO ETERNO HA SIDO DOMADO! 🌌\n\nHas completado el Nivel ${nivel}\n⏱️ Tiempo restante: ${tiempo} segundos\n🏆 Parejas encontradas: ${paresEncontrados}/${totalPares}\n\nLos dioses antiguos susurran tu nombre con respeto...`;
      alert(mensaje);
    }, 1000);
  }
}

// Iniciar temporizador
function iniciarTemporizador() {
  clearInterval(intervalo);
  tiempo = 90;
  tiempoSpan.textContent = `TIEMPO: ${tiempo}`;
  tiempoSpan.style.color = '#e0d3b8';
  tiempoSpan.style.animation = '';
  
  intervalo = setInterval(() => {
    if (tiempo > 0) {
      tiempo--;
      tiempoSpan.textContent = `TIEMPO: ${tiempo}`;
      
      if (tiempo === 20) {
        SoundSystem.playTimeWarning();
      }
      
      if (tiempo <= 20) {
        tiempoSpan.style.color = '#ff4444';
        tiempoSpan.style.animation = tiempoSpan.style.animation ? '' : 'pulse 1s infinite';
      } else if (tiempo <= 45) {
        tiempoSpan.style.color = '#ffaa00';
      }
    } else {
      clearInterval(intervalo);
      tiempoSpan.style.color = '#ff4444';
      SoundSystem.playTimeUp();
      setTimeout(() => {
        alert("⏳ ¡EL TIEMPO SE AGOTÓ!\n\nEl abismo te ha consumido...\nEl ritual debe comenzar de nuevo.");
        reiniciarNivel();
      }, 500);
    }
  }, 1000);
}

// Reiniciar nivel
function reiniciarNivel() {
  SoundSystem.playClick();
  tiempo = 90;
  paresEncontrados = 0;
  cartasVolteadas = [];
  puedeVoltear = true;
  efectoActivo = false;
  cartasBloqueadas = [];
  
  tiempoSpan.textContent = `TIEMPO: ${tiempo}`;
  tiempoSpan.style.color = '#e0d3b8';
  tiempoSpan.style.animation = '';
  paresSpan.textContent = `PAREJAS: ${paresEncontrados}/${totalPares}`;
  efectoActivoDiv.classList.remove('mostrar');
  tiempoExtraDiv.classList.remove('mostrar');
  
  crearTablero();
  iniciarTemporizador();
}

// Volver al menú
function volver() {
  SoundSystem.playClick();
  clearInterval(intervalo);
  setTimeout(() => {
    window.location.href = "niveles.html";
  }, 300);
}

// Añadir estilos de animación
const style = document.createElement('style');
style.textContent = `
  @keyframes dragonSuccess {
    0% { 
      transform: rotateY(180deg) scale(1.05);
      box-shadow: 0 0 20px #ff4444;
    }
    25% { 
      transform: rotateY(180deg) scale(1.2) rotate(5deg);
      box-shadow: 0 0 40px #ff6a00, 0 0 60px #ff4444;
    }
    50% { 
      transform: rotateY(180deg) scale(1.15) rotate(-5deg);
      box-shadow: 0 0 50px #ff8c00, 0 0 70px #ff6a00;
    }
    75% { 
      transform: rotateY(180deg) scale(1.1) rotate(2deg);
      box-shadow: 0 0 30px #ff4444;
    }
    100% { 
      transform: rotateY(180deg) scale(1.05);
      box-shadow: 0 0 20px #2e8b57;
    }
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
  SoundSystem.init();
  nivelSpan.textContent = "NIVEL: 3 - ABISMO ETERNO";
  paresSpan.textContent = `PAREJAS: ${paresEncontrados}/${totalPares}`;
  crearTablero();
  iniciarTemporizador();
}

// Iniciar el juego cuando la página cargue
document.addEventListener('DOMContentLoaded', iniciarJuego);