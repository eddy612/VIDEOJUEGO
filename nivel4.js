let tiempo = 120;
let nivel = 4;
let paresEncontrados = 0;
let totalPares = 12;
let cartasVolteadas = [];
let puedeVoltear = true;
let intervalo;
let efectoActivo = false;
let combo = 0;
let puntuacion = 0;
let cartasEspecialesEncontradas = 0;
let modoActual = 'normal';

const tiempoSpan = document.getElementById("tiempo");
const nivelSpan = document.getElementById("nivel");
const paresSpan = document.getElementById("pares");
const memoryGame = document.getElementById("memory-game");
const efectoActivoDiv = document.getElementById("efecto-activo");
const modoActivoDiv = document.getElementById("modo-activo");
const especialesContador = document.getElementById("especiales-contador");
const comboContador = document.getElementById("combo-contador");
const puntuacionSpan = document.getElementById("puntuacion");

// Sistema de sonidos MEJORADO con Web Audio API
const SoundSystem = {
  audioContext: null,
  
  init() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      console.log('Audio Context inicializado correctamente');
    } catch (error) {
      console.log('Web Audio API no soportada:', error);
    }
  },
  
  // Sonido al pasar mouse (hover)
  playHover() {
    this.playTone(600, 0.1, 0.1, 'sine');
  },
  
  // Sonido al hacer click
  playClick() {
    this.playTone(800, 0.2, 0.1, 'square');
  },
  
  // Sonido al voltear carta
  playCardFlip() {
    this.playTone(400, 0.3, 0.2, 'sawtooth');
  },
  
  // Sonido al encontrar par
  playCardMatch() {
    this.playSuccessTone();
  },
  
  // Sonido de éxito (para match)
  playSuccessTone() {
    if (!this.audioContext) return;
    
    const now = this.audioContext.currentTime;
    const oscillator1 = this.audioContext.createOscillator();
    const oscillator2 = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator1.frequency.setValueAtTime(523.25, now); // Do
    oscillator2.frequency.setValueAtTime(659.25, now); // Mi
    oscillator1.type = 'sine';
    oscillator2.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    
    oscillator1.start(now);
    oscillator2.start(now);
    oscillator1.stop(now + 0.5);
    oscillator2.stop(now + 0.5);
  },
  
  // Sonido de error (cuando no es par)
  playErrorTone() {
    if (!this.audioContext) return;
    
    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.setValueAtTime(200, now);
    oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.3);
    oscillator.type = 'sawtooth';
    
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    oscillator.start(now);
    oscillator.stop(now + 0.3);
  },
  
  // Sonido de combo
  playCombo() {
    if (!this.audioContext) return;
    
    const now = this.audioContext.currentTime;
    const oscillators = [];
    
    // Crear acorde de éxito para combo
    for (let i = 0; i < 3; i++) {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      const frequencies = [523.25, 659.25, 783.99]; // Do, Mi, Sol
      oscillator.frequency.setValueAtTime(frequencies[i], now);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.2, now + i * 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
      
      oscillator.start(now + i * 0.1);
      oscillator.stop(now + 0.8);
      
      oscillators.push(oscillator);
    }
  },
  
  // Sonido genérico para tonos
  playTone(frequency, duration, volume, type) {
    if (!this.audioContext) return;
    
    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type || 'sine';
    
    gainNode.gain.setValueAtTime(volume || 0.1, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    oscillator.start(now);
    oscillator.stop(now + duration);
  },
  
  // Sonido de victoria
  playVictory() {
    if (!this.audioContext) return;
    
    const now = this.audioContext.currentTime;
    const sequence = [
      { freq: 523.25, time: 0 },   // Do
      { freq: 587.33, time: 0.1 }, // Re
      { freq: 659.25, time: 0.2 }, // Mi
      { freq: 698.46, time: 0.3 }, // Fa
      { freq: 783.99, time: 0.4 }, // Sol
      { freq: 880.00, time: 0.5 }, // La
      { freq: 987.77, time: 0.6 }, // Si
      { freq: 1046.50, time: 0.7 } // Do alto
    ];
    
    sequence.forEach(note => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.setValueAtTime(note.freq, now + note.time);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, now + note.time);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + note.time + 0.2);
      
      oscillator.start(now + note.time);
      oscillator.stop(now + note.time + 0.2);
    });
  }
};

// Símbolos Nivel 4 con cartas legendarias
const simbolosNivel4 = [
  '👁️', '⚔️', '🛡️', '🏰', '🐉', '👑', '🌑', '⏳', '🪞', '♠️', '🌟', '💎',
  '👁️', '⚔️', '🛡️', '🏰', '🐉', '👑', '🌑', '⏳', '🪞', '♠️', '🌟', '💎'
];

// Efectos especiales para cada símbolo
const efectosSimbolos = {
  '👁️': function(carta1, carta2) {
    aplicarEfectoOjo(carta1, carta2);
  },
  '⚔️': function(carta1, carta2) {
    aplicarEfectoEspada(carta1, carta2);
  },
  '🛡️': function(carta1, carta2) {
    aplicarEfectoEscudo(carta1, carta2);
  },
  '🏰': function(carta1, carta2) {
    aplicarEfectoCastillo(carta1, carta2);
  },
  '🐉': function(carta1, carta2) {
    aplicarEfectoDragon(carta1, carta2);
  },
  '👑': function(carta1, carta2) {
    aplicarEfectoCorona(carta1, carta2);
  },
  '🌑': function(carta1, carta2) {
    aplicarEfectoSombra(carta1, carta2);
  },
  '⏳': function(carta1, carta2) {
    aplicarEfectoTiempo(carta1, carta2);
  },
  '🪞': function(carta1, carta2) {
    aplicarEfectoEspejo(carta1, carta2);
  },
  '♠️': function(carta1, carta2) {
    aplicarEfectoAs(carta1, carta2);
  },
  '🌟': function(carta1, carta2) {
    aplicarEfectoEstrella(carta1, carta2);
  },
  '💎': function(carta1, carta2) {
    aplicarEfectoDiamante(carta1, carta2);
  }
};

// Cartas legendarias y sus efectos
const cartasEspeciales = {
  '🌑': {
    nombre: 'Sombra Eterna',
    tipo: 'especial',
    efecto: function() {
      mostrarEfectoActivo('🌑 Sombra Eterna: ¡Modo invertido activado!');
      SoundSystem.playTone(300, 0.5, 0.3, 'sawtooth');
      activarModoInvertido();
    }
  },
  '⏳': {
    nombre: 'Reloj Ancestral',
    tipo: 'especial', 
    efecto: function() {
      const tiempoExtra = 10;
      tiempo += tiempoExtra;
      tiempoSpan.textContent = `TIEMPO: ${tiempo}`;
      mostrarEfectoActivo(`⏳ Reloj Ancestral: +${tiempoExtra} segundos!`);
      SoundSystem.playTone(800, 0.3, 0.2, 'square');
      
      const cards = document.querySelectorAll('.card');
      cards.forEach(card => {
        card.classList.add('efecto-tiempo');
        setTimeout(() => card.classList.remove('efecto-tiempo'), 1500);
      });
    }
  },
  '🪞': {
    nombre: 'Espejo del Destino',
    tipo: 'especial',
    efecto: function() {
      mostrarEfectoActivo('🪞 Espejo del Destino: ¡Reflejando realidades!');
      SoundSystem.playTone(600, 0.4, 0.2, 'triangle');
      reflejarCartas();
    }
  },
  '♠️': {
    nombre: 'As de las Sombras',
    tipo: 'legendaria',
    efecto: function() {
      mostrarEfectoActivo('♠️ As de las Sombras: ¡Puntuación doble!');
      SoundSystem.playSuccessTone();
      activarPuntuacionDoble();
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
  const simbolosMezclados = mezclarArray([...simbolosNivel4]);
  
  simbolosMezclados.forEach(simbolo => {
    const card = document.createElement('div');
    card.classList.add('card');
    
    // Marcar cartas especiales y legendarias
    if (['🌑', '⏳', '🪞'].includes(simbolo)) {
      card.classList.add('especial');
    } else if (['♠️', '🌟', '💎'].includes(simbolo)) {
      card.classList.add('legendaria');
    }
    
    card.innerHTML = `
      <div class="front">${simbolo}</div>
      <div class="back"></div>
    `;
    
    card.addEventListener('click', () => voltearCarta(card, simbolo));
    card.addEventListener('mouseenter', () => SoundSystem.playHover());
    memoryGame.appendChild(card);
  });
}

// Voltear carta CON SONIDO
function voltearCarta(card, simbolo) {
  if (!puedeVoltear || card.classList.contains('flipped') || card.classList.contains('encontrada') || efectoActivo) {
    return;
  }
  
  SoundSystem.playCardFlip(); // SONIDO AL VOLTEAR
  card.classList.add('flipped');
  cartasVolteadas.push({card, simbolo});
  
  if (cartasVolteadas.length === 2) {
    puedeVoltear = false;
    setTimeout(verificarPar, 600);
  }
}

// Verificar si las cartas forman un par - CORREGIDO
function verificarPar() {
  const [carta1, carta2] = cartasVolteadas;
  
  if (carta1.simbolo === carta2.simbolo) {
    // PAR ENCONTRADO - REPRODUCIR SONIDO DE MATCH
    SoundSystem.playCardMatch();
    
    // Aplicar efecto especial según el símbolo
    if (efectosSimbolos[carta1.simbolo]) {
      efectosSimbolos[carta1.simbolo](carta1.card, carta2.card);
    }
    
    // Calcular puntuación del combo
    combo++;
    let puntosCombo = 10 * combo;
    if (modoActual === 'doble') puntosCombo *= 2;
    
    puntuacion += puntosCombo;
    actualizarEstadisticas();
    
    // Verificar si es una carta especial
    if (cartasEspeciales[carta1.simbolo]) {
      efectoActivo = true;
      cartasEspecialesEncontradas++;
      
      // MARCADO CORREGIDO: Las cartas se quedan volteadas permanentemente
      setTimeout(() => {
        carta1.card.classList.add('encontrada');
        carta2.card.classList.add('encontrada');
        
        // IMPORTANTE: Remover evento click para que no se puedan voltear de nuevo
        carta1.card.style.pointerEvents = 'none';
        carta2.card.style.pointerEvents = 'none';
        
        paresEncontrados++;
        paresSpan.textContent = `PAREJAS: ${paresEncontrados}/${totalPares}`;
        
        // Efecto de combo si hay 3 o más
        if (combo >= 3) {
          SoundSystem.playCombo();
          mostrarEfectoActivo(`🎯 COMBO x${combo}! +${puntosCombo} puntos`);
          carta1.card.classList.add('efecto-combo');
          carta2.card.classList.add('efecto-combo');
          setTimeout(() => {
            carta1.card.classList.remove('efecto-combo');
            carta2.card.classList.remove('efecto-combo');
          }, 500);
        }
        
        // APLICAR EL EFECTO ESPECIAL
        cartasEspeciales[carta1.simbolo].efecto();
        
        setTimeout(() => {
          cartasVolteadas = [];
          puedeVoltear = true;
          efectoActivo = false;
          verificarNivelCompletado();
        }, 2000);
      }, 800);
    } else {
      // Carta normal - MARCAR COMO ENCONTRADAS PERMANENTEMENTE
      setTimeout(() => {
        carta1.card.classList.add('encontrada');
        carta2.card.classList.add('encontrada');
        
        // IMPORTANTE: Remover evento click para que no se puedan voltear de nuevo
        carta1.card.style.pointerEvents = 'none';
        carta2.card.style.pointerEvents = 'none';
        
        paresEncontrados++;
        paresSpan.textContent = `PAREJAS: ${paresEncontrados}/${totalPares}`;
        
        // Efecto de combo si hay 3 o más
        if (combo >= 3) {
          SoundSystem.playCombo();
          mostrarEfectoActivo(`🎯 COMBO x${combo}! +${puntosCombo} puntos`);
          carta1.card.classList.add('efecto-combo');
          carta2.card.classList.add('efecto-combo');
          setTimeout(() => {
            carta1.card.classList.remove('efecto-combo');
            carta2.card.classList.remove('efecto-combo');
          }, 500);
        }
        
        cartasVolteadas = [];
        puedeVoltear = true;
        verificarNivelCompletado();
      }, 800);
    }
  } else {
    // No es par - resetear combo y reproducir sonido de error
    combo = 0;
    SoundSystem.playErrorTone();
    actualizarEstadisticas();
    
    setTimeout(() => {
      carta1.card.style.animation = 'shake 0.5s ease-in-out';
      carta2.card.style.animation = 'shake 0.5s ease-in-out';
      
      setTimeout(() => {
        // Voltear las cartas de nuevo SOLO si no son par
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

// EFECTOS ESPECIALES COMPLETOS (mantener igual que antes)
function aplicarEfectoDragon(carta1, carta2) {
  carta1.style.animation = 'dragonSuccess 0.8s ease-in-out';
  carta2.style.animation = 'dragonSuccess 0.8s ease-in-out';
  
  const fireEffect = document.createElement('div');
  fireEffect.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,100,0,0.4) 0%, rgba(255,50,0,0.3) 30%, transparent 70%);
    border-radius: 50%;
    animation: dragonFire 0.8s ease-out;
    pointer-events: none;
    z-index: 10;
  `;
  document.body.appendChild(fireEffect);
  setTimeout(() => fireEffect.remove(), 800);
}

function aplicarEfectoOjo(carta1, carta2) {
  carta1.style.animation = 'pulse 0.6s ease-in-out 2';
  carta2.style.animation = 'pulse 0.6s ease-in-out 2';
  
  const ojoEffect = document.createElement('div');
  ojoEffect.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 150%;
    height: 150%;
    background: radial-gradient(circle, rgba(139, 0, 139, 0.3) 0%, rgba(75, 0, 130, 0.2) 50%, transparent 70%);
    border-radius: 50%;
    animation: dragonFire 0.6s ease-out;
    pointer-events: none;
    z-index: 10;
  `;
  document.body.appendChild(ojoEffect);
  setTimeout(() => ojoEffect.remove(), 600);
}

function aplicarEfectoEspada(carta1, carta2) {
  carta1.style.animation = 'shake 0.4s ease-in-out';
  carta2.style.animation = 'shake 0.4s ease-in-out';
  
  const espadaEffect = document.createElement('div');
  espadaEffect.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, transparent 40%, rgba(255, 255, 255, 0.3) 50%, transparent 60%);
    animation: dragonFire 0.4s ease-out;
    pointer-events: none;
    z-index: 10;
  `;
  document.body.appendChild(espadaEffect);
  setTimeout(() => espadaEffect.remove(), 400);
}

function aplicarEfectoEscudo(carta1, carta2) {
  carta1.style.transform = 'rotateY(180deg) scale(1.1)';
  carta2.style.transform = 'rotateY(180deg) scale(1.1)';
  carta1.style.boxShadow = '0 0 30px rgba(0, 100, 255, 0.6)';
  carta2.style.boxShadow = '0 0 30px rgba(0, 100, 255, 0.6)';
  
  setTimeout(() => {
    carta1.style.transform = 'rotateY(180deg) scale(1)';
    carta2.style.transform = 'rotateY(180deg) scale(1)';
    carta1.style.boxShadow = '';
    carta2.style.boxShadow = '';
  }, 600);
}

function aplicarEfectoCastillo(carta1, carta2) {
  const castilloEffect = document.createElement('div');
  castilloEffect.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(0deg, rgba(139, 69, 19, 0.3) 0%, transparent 50%);
    border-radius: 10px;
    animation: dragonFire 0.7s ease-out;
    pointer-events: none;
    z-index: 10;
  `;
  carta1.appendChild(castilloEffect.cloneNode());
  carta2.appendChild(castilloEffect);
  
  setTimeout(() => {
    carta1.querySelector('div:last-child')?.remove();
    carta2.querySelector('div:last-child')?.remove();
  }, 700);
}

function aplicarEfectoCorona(carta1, carta2) {
  carta1.style.animation = 'dragonSuccess 0.8s ease-in-out';
  carta2.style.animation = 'dragonSuccess 0.8s ease-in-out';
  
  const coronaEffect = document.createElement('div');
  coronaEffect.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 180%;
    height: 180%;
    background: radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, rgba(255, 165, 0, 0.2) 50%, transparent 70%);
    border-radius: 50%;
    animation: dragonFire 0.8s ease-out;
    pointer-events: none;
    z-index: 10;
  `;
  document.body.appendChild(coronaEffect);
  setTimeout(() => coronaEffect.remove(), 800);
}

function aplicarEfectoSombra(carta1, carta2) {
  carta1.classList.add('efecto-sombra');
  carta2.classList.add('efecto-sombra');
  
  setTimeout(() => {
    carta1.classList.remove('efecto-sombra');
    carta2.classList.remove('efecto-sombra');
  }, 2000);
}

function aplicarEfectoTiempo(carta1, carta2) {
  carta1.classList.add('efecto-tiempo');
  carta2.classList.add('efecto-tiempo');
  
  setTimeout(() => {
    carta1.classList.remove('efecto-tiempo');
    carta2.classList.remove('efecto-tiempo');
  }, 1500);
}

function aplicarEfectoEspejo(carta1, carta2) {
  carta1.classList.add('efecto-espejo');
  carta2.classList.add('efecto-espejo');
  
  setTimeout(() => {
    carta1.classList.remove('efecto-espejo');
    carta2.classList.remove('efecto-espejo');
  }, 2000);
}

function aplicarEfectoAs(carta1, carta2) {
  carta1.style.animation = 'dragonSuccess 0.8s ease-in-out';
  carta2.style.animation = 'dragonSuccess 0.8s ease-in-out';
  
  const asEffect = document.createElement('div');
  asEffect.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(0, 255, 255, 0.3) 0%, rgba(0, 128, 128, 0.2) 50%, transparent 70%);
    border-radius: 50%;
    animation: dragonFire 0.8s ease-out;
    pointer-events: none;
    z-index: 10;
  `;
  document.body.appendChild(asEffect);
  setTimeout(() => asEffect.remove(), 800);
}

function aplicarEfectoEstrella(carta1, carta2) {
  carta1.style.animation = 'pulse 0.6s ease-in-out 3';
  carta2.style.animation = 'pulse 0.6s ease-in-out 3';
  
  const estrellaEffect = document.createElement('div');
  estrellaEffect.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 160%;
    height: 160%;
    background: radial-gradient(circle, rgba(255, 255, 0, 0.3) 0%, rgba(255, 215, 0, 0.2) 50%, transparent 70%);
    border-radius: 50%;
    animation: dragonFire 0.6s ease-out;
    pointer-events: none;
    z-index: 10;
  `;
  document.body.appendChild(estrellaEffect);
  setTimeout(() => estrellaEffect.remove(), 600);
}

function aplicarEfectoDiamante(carta1, carta2) {
  carta1.style.animation = 'dragonSuccess 0.8s ease-in-out';
  carta2.style.animation = 'dragonSuccess 0.8s ease-in-out';
  
  const diamanteEffect = document.createElement('div');
  diamanteEffect.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 190%;
    height: 190%;
    background: radial-gradient(circle, rgba(0, 255, 255, 0.3) 0%, rgba(0, 0, 255, 0.2) 50%, transparent 70%);
    border-radius: 50%;
    animation: dragonFire 0.8s ease-out;
    pointer-events: none;
    z-index: 10;
  `;
  document.body.appendChild(diamanteEffect);
  setTimeout(() => diamanteEffect.remove(), 800);
}

// Efectos especiales del nivel 4
function activarModoInvertido() {
  modoActual = 'invertido';
  modoActivoDiv.textContent = 'MODO: INVERTIDO';
  modoActivoDiv.style.background = 'linear-gradient(135deg, #9900cc, #cc00ff)';
  
  memoryGame.classList.add('modo-invertido');
  
  setTimeout(() => {
    modoActual = 'normal';
    modoActivoDiv.textContent = 'MODO: NORMAL';
    modoActivoDiv.style.background = 'linear-gradient(135deg, #ff6600, #ff3300)';
    memoryGame.classList.remove('modo-invertido');
  }, 8000);
}

function reflejarCartas() {
  const cards = document.querySelectorAll('.card:not(.encontrada)');
  
  cards.forEach(card => {
    card.classList.add('efecto-espejo');
    setTimeout(() => card.classList.remove('efecto-espejo'), 2000);
  });
  
  // Mezclar posiciones después del efecto
  setTimeout(() => {
    const cardArray = Array.from(cards);
    const shuffled = cardArray.sort(() => Math.random() - 0.5);
    
    memoryGame.innerHTML = '';
    shuffled.forEach(card => memoryGame.appendChild(card));
  }, 2000);
}

function activarPuntuacionDoble() {
  modoActual = 'doble';
  modoActivoDiv.textContent = 'MODO: PUNTUACIÓN DOBLE';
  modoActivoDiv.style.background = 'linear-gradient(135deg, #00cc00, #00ff00)';
  
  setTimeout(() => {
    modoActual = 'normal';
    modoActivoDiv.textContent = 'MODO: NORMAL';
    modoActivoDiv.style.background = 'linear-gradient(135deg, #ff6600, #ff3300)';
  }, 10000);
}

function actualizarEstadisticas() {
  especialesContador.textContent = cartasEspecialesEncontradas;
  comboContador.textContent = combo;
  puntuacionSpan.textContent = puntuacion;
}

function mostrarEfectoActivo(mensaje) {
  efectoActivoDiv.textContent = mensaje;
  efectoActivoDiv.classList.add('mostrar');
  
  setTimeout(() => {
    efectoActivoDiv.classList.remove('mostrar');
  }, 3000);
}

function verificarNivelCompletado() {
  if (paresEncontrados === totalPares) {
    clearInterval(intervalo);
    SoundSystem.playVictory(); // SONIDO DE VICTORIA
    
    // Bonus por tiempo restante
    const bonusTiempo = tiempo * 5;
    puntuacion += bonusTiempo;
    actualizarEstadisticas();
    
    // Guardar datos para pantalla de Victoria
    localStorage.setItem('victoryNivel', `Nivel ${nivel} - TRONO DE SOMBRAS`);
    localStorage.setItem('victoryNivelNumero', nivel);
    localStorage.setItem('victoryPares', paresEncontrados);
    localStorage.setItem('victoryTotalPares', totalPares);
    localStorage.setItem('victoryTiempo', tiempo);
    localStorage.setItem('victoryPuntuacion', puntuacion);
    localStorage.setItem('victoryCombo', combo);
    
    setTimeout(() => {
      window.location.href = "levelComplete.html";
    }, 2000);
  }
}

// Iniciar temporizador
function iniciarTemporizador() {
  clearInterval(intervalo);
  tiempo = 120;
  tiempoSpan.textContent = `TIEMPO: ${tiempo}`;
  tiempoSpan.style.color = '#e0d3b8';
  tiempoSpan.style.animation = '';
  
  intervalo = setInterval(() => {
    if (tiempo > 0) {
      tiempo--;
      tiempoSpan.textContent = `TIEMPO: ${tiempo}`;
      
      if (tiempo === 30) {
        // Sonido de advertencia
        SoundSystem.playTone(300, 0.5, 0.2, 'sawtooth');
      }
      
      if (tiempo <= 30) {
        tiempoSpan.style.color = '#ff4444';
        tiempoSpan.style.animation = tiempoSpan.style.animation ? '' : 'pulse 1s infinite';
      } else if (tiempo <= 60) {
        tiempoSpan.style.color = '#ffaa00';
      }
    } else {
      clearInterval(intervalo);
      tiempoSpan.style.color = '#ff4444';
      SoundSystem.playErrorTone(); // Sonido de tiempo agotado
      
      // Guardar datos para pantalla de Game Over
      localStorage.setItem('gameOverNivel', `Nivel ${nivel} - TRONO DE SOMBRAS`);
      localStorage.setItem('gameOverPares', paresEncontrados);
      localStorage.setItem('gameOverTotalPares', totalPares);
      localStorage.setItem('gameOverTiempo', tiempo);
      
      setTimeout(() => {
        window.location.href = "gameOver.html";
      }, 1000);
    }
  }, 1000);
}

// Reiniciar nivel CON SONIDO
function reiniciarNivel() {
  SoundSystem.playClick(); // SONIDO AL HACER CLICK
  tiempo = 120;
  paresEncontrados = 0;
  cartasVolteadas = [];
  puedeVoltear = true;
  efectoActivo = false;
  combo = 0;
  puntuacion = 0;
  cartasEspecialesEncontradas = 0;
  modoActual = 'normal';
  
  tiempoSpan.textContent = `TIEMPO: ${tiempo}`;
  tiempoSpan.style.color = '#e0d3b8';
  tiempoSpan.style.animation = '';
  paresSpan.textContent = `PAREJAS: ${paresEncontrados}/${totalPares}`;
  efectoActivoDiv.classList.remove('mostrar');
  modoActivoDiv.textContent = 'MODO: NORMAL';
  modoActivoDiv.style.background = 'linear-gradient(135deg, #ff6600, #ff3300)';
  
  actualizarEstadisticas();
  crearTablero();
  iniciarTemporizador();
}

// Volver al menú CON SONIDO
function volver() {
  SoundSystem.playClick(); // SONIDO AL HACER CLICK
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
  
  @keyframes dragonFire {
    0% { 
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.1);
    }
    50% { 
      opacity: 0.8;
      transform: translate(-50%, -50%) scale(1.5);
    }
    100% { 
      opacity: 0;
      transform: translate(-50%, -50%) scale(2);
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
  // Iniciar el contexto de audio cuando el usuario interactúe por primera vez
  document.addEventListener('click', function initAudio() {
    SoundSystem.init();
    document.removeEventListener('click', initAudio);
  }, { once: true });
  
  nivelSpan.textContent = "NIVEL: 4 - TRONO DE SOMBRAS";
  paresSpan.textContent = `PAREJAS: ${paresEncontrados}/${totalPares}`;
  actualizarEstadisticas();
  crearTablero();
  iniciarTemporizador();
}

// Iniciar el juego cuando la página cargue
document.addEventListener('DOMContentLoaded', iniciarJuego);