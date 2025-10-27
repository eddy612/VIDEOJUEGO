let tiempo = 75;
let nivel = 2;
let paresEncontrados = 0;
let totalPares = 8;
let cartasVolteadas = [];
let puedeVoltear = true;
let intervalo;
let efectoActivo = false;

const tiempoSpan = document.getElementById("tiempo");
const nivelSpan = document.getElementById("nivel");
const paresSpan = document.getElementById("pares");
const memoryGame = document.getElementById("memory-game");
const efectoActivoDiv = document.getElementById("efecto-activo");

// Sistema de sonidos
const SoundSystem = {
  sounds: {
    hover: null,
    click: null,
    cardFlip: null,
    cardMatch: null,
    spider: null,
    skull: null,
    moon: null,
    fire: null,
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
    this.sounds.spider = document.getElementById('spiderSound');
    this.sounds.skull = document.getElementById('skullSound');
    this.sounds.moon = document.getElementById('moonSound');
    this.sounds.fire = document.getElementById('fireSound');
    this.sounds.levelComplete = document.getElementById('levelCompleteSound');
    this.sounds.timeWarning = document.getElementById('timeWarningSound');
    this.sounds.timeUp = document.getElementById('timeUpSound');
    
    // Configurar volúmenes
    if (this.sounds.spider) this.sounds.spider.volume = 0.6;
    if (this.sounds.skull) this.sounds.skull.volume = 0.7;
    if (this.sounds.moon) this.sounds.moon.volume = 0.5;
    if (this.sounds.fire) this.sounds.fire.volume = 0.6;
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
  
  playSpider() {
    this.playSound(this.sounds.spider);
  },
  
  playSkull() {
    this.playSound(this.sounds.skull);
  },
  
  playMoon() {
    this.playSound(this.sounds.moon);
  },
  
  playFire() {
    this.playSound(this.sounds.fire);
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

// Símbolos Nivel 2 con cartas especiales
const simbolosNivel2 = [
  '👁️', '⚔️', '🛡️', '🏰', '🐉', '👑', '🕷️', '💀',
  '👁️', '⚔️', '🛡️', '🏰', '🐉', '👑', '🕷️', '💀'
];

// Cartas especiales y sus efectos
const cartasEspeciales = {
  '🕷️': {
    nombre: 'Araña del Caos',
    efecto: function() {
      mostrarEfectoActivo('🕷️ Araña del Caos: ¡Las cartas se mezclan!');
      SoundSystem.playSpider();
      mezclarTableroVisualmente();
    }
  },
  '💀': {
    nombre: 'Calavera Maldita',
    efecto: function() {
      mostrarEfectoActivo('💀 Calavera Maldita: ¡Cartas volteadas!');
      SoundSystem.playSkull();
      voltearCartasAleatorias(2);
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
  const simbolosMezclados = mezclarArray([...simbolosNivel2]);
  
  simbolosMezclados.forEach(simbolo => {
    const card = document.createElement('div');
    card.classList.add('card');
    
    if (simbolo === '🕷️' || simbolo === '💀') {
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
  if (!puedeVoltear || card.classList.contains('flipped') || card.classList.contains('encontrada') || efectoActivo) {
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
        }, 1000);
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

// Efectos especiales
function mezclarTableroVisualmente() {
  const cards = document.querySelectorAll('.card:not(.encontrada)');
  cards.forEach(card => {
    card.style.animation = 'mezclar 0.8s ease-in-out';
  });
  
  setTimeout(() => {
    cards.forEach(card => {
      card.style.animation = '';
    });
  }, 800);
}

function voltearCartasAleatorias(cantidad) {
  const cards = Array.from(document.querySelectorAll('.card.flipped:not(.encontrada)'));
  const cartasParaVoltear = cards.sort(() => 0.5 - Math.random()).slice(0, cantidad);
  
  cartasParaVoltear.forEach(card => {
    setTimeout(() => {
      card.classList.remove('flipped');
    }, 300);
  });
}

function mostrarEfectoActivo(mensaje) {
  efectoActivoDiv.textContent = mensaje;
  efectoActivoDiv.classList.add('mostrar');
  
  setTimeout(() => {
    efectoActivoDiv.classList.remove('mostrar');
  }, 2000);
}

function verificarNivelCompletado() {
  if (paresEncontrados === totalPares) {
    clearInterval(intervalo);
    SoundSystem.playLevelComplete();
    
    setTimeout(() => {
      const mensaje = `🔮 ¡LA CRIPTA MALDITA HA SIDO PURIFICADA! 🔮\n\nHas completado el Nivel ${nivel}\n⏱️ Tiempo restante: ${tiempo} segundos\n🏆 Parejas encontradas: ${paresEncontrados}/${totalPares}\n\nLos espíritus ancestrales te observan con respeto...`;
      alert(mensaje);
    }, 1000);
  }
}

// Iniciar temporizador
function iniciarTemporizador() {
  clearInterval(intervalo);
  tiempo = 75;
  tiempoSpan.textContent = `TIEMPO: ${tiempo}`;
  tiempoSpan.style.color = '#e0d3b8';
  tiempoSpan.style.animation = '';
  
  intervalo = setInterval(() => {
    if (tiempo > 0) {
      tiempo--;
      tiempoSpan.textContent = `TIEMPO: ${tiempo}`;
      
      if (tiempo === 15) {
        SoundSystem.playTimeWarning();
      }
      
      if (tiempo <= 15) {
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
        alert("⏳ ¡EL TIEMPO SE AGOTÓ!\n\nLa cripta te ha absorbido...\nEl ritual debe comenzar de nuevo.");
        reiniciarNivel();
      }, 500);
    }
  }, 1000);
}

// Reiniciar nivel
function reiniciarNivel() {
  SoundSystem.playClick();
  tiempo = 75;
  paresEncontrados = 0;
  cartasVolteadas = [];
  puedeVoltear = true;
  efectoActivo = false;
  
  tiempoSpan.textContent = `TIEMPO: ${tiempo}`;
  tiempoSpan.style.color = '#e0d3b8';
  tiempoSpan.style.animation = '';
  paresSpan.textContent = `PAREJAS: ${paresEncontrados}/${totalPares}`;
  efectoActivoDiv.classList.remove('mostrar');
  
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
  nivelSpan.textContent = "NIVEL: 2 - CRIPTA MALDITA";
  paresSpan.textContent = `PAREJAS: ${paresEncontrados}/${totalPares}`;
  crearTablero();
  iniciarTemporizador();
}

// Iniciar el juego cuando la página cargue
document.addEventListener('DOMContentLoaded', iniciarJuego);