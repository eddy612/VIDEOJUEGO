let tiempo = 90;
let nivel = 3;
let paresEncontrados = 0;
let totalPares = 10;
let cartasVolteadas = [];
let puedeVoltear = true;
let intervalo;
let efectoActivo = false;
let cartasBloqueadas = [];
let tiempoCongelado = false;

const tiempoSpan = document.getElementById("tiempo");
const nivelSpan = document.getElementById("nivel");
const paresSpan = document.getElementById("pares");
const memoryGame = document.getElementById("memory-game");
const efectoActivoDiv = document.getElementById("efecto-activo");
const tiempoExtraDiv = document.getElementById("tiempo-extra");

// Sistema de sonidos MEJORADO
const SoundSystem = {
  sounds: {},
  audioContext: null,
  
  init() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.log('AudioContext no soportado:', e);
    }
    
    this.loadHtmlAudioElements();
    this.createFallbackSounds();
    
    console.log('🔊 SoundSystem Nivel 3 inicializado correctamente');
  },
  
  loadHtmlAudioElements() {
    const audioIds = [
      'hoverSound', 'clickSound', 'cardFlipSound', 'cardMatchSound',
      'vortexSound', 'ghostSound', 'keySound', 'lightningSound',
      'timeSound', 'freezeSound', 'levelCompleteSound', 'timeWarningSound', 'timeUpSound'
    ];
    
    audioIds.forEach(id => {
      this.sounds[id] = document.getElementById(id);
    });
  },
  
  createFallbackSounds() {
    const essentialSounds = {
      'hoverSound': this.createBeepSound(300, 0.1),
      'clickSound': this.createBeepSound(400, 0.2),
      'cardFlipSound': this.createBeepSound(200, 0.3),
      'cardMatchSound': this.createBeepSound(600, 0.4),
      'vortexSound': this.createBeepSound(250, 0.6),
      'ghostSound': this.createBeepSound(350, 0.5),
      'keySound': this.createBeepSound(500, 0.4),
      'lightningSound': this.createBeepSound(150, 0.3),
      'timeSound': this.createBeepSound(700, 0.4),
      'freezeSound': this.createBeepSound(100, 0.5),
      'levelCompleteSound': this.createSuccessSound()
    };
    
    Object.keys(essentialSounds).forEach(soundId => {
      if (!this.sounds[soundId] || !this.sounds[soundId].src) {
        this.sounds[soundId] = essentialSounds[soundId];
      }
    });
  },
  
  createBeepSound(frequency, duration) {
    return {
      play: () => {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
      }
    };
  },
  
  createSuccessSound() {
    return {
      play: () => {
        if (!this.audioContext) return;
        
        const times = [0, 0.1, 0.2, 0.3];
        const frequencies = [523.25, 659.25, 783.99, 1046.50];
        
        times.forEach((time, index) => {
          const oscillator = this.audioContext.createOscillator();
          const gainNode = this.audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(this.audioContext.destination);
          
          oscillator.frequency.value = frequencies[index];
          oscillator.type = 'sine';
          
          gainNode.gain.setValueAtTime(0, this.audioContext.currentTime + time);
          gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + time + 0.05);
          gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + time + 0.3);
          
          oscillator.start(this.audioContext.currentTime + time);
          oscillator.stop(this.audioContext.currentTime + time + 0.3);
        });
      }
    };
  },
  
  playSound(soundElement) {
    if (!soundElement) {
      console.log('Sonido no disponible');
      return;
    }
    
    try {
      if (soundElement.play) {
        soundElement.currentTime = 0;
        soundElement.play().catch(error => {
          console.log('Error reproduciendo audio HTML:', error);
          this.playFallbackSound(soundElement.id);
        });
      } else if (soundElement.play && typeof soundElement.play === 'function') {
        soundElement.play();
      }
    } catch (error) {
      console.log('Error general reproduciendo sonido:', error);
    }
  },
  
  playFallbackSound(soundId) {
    const fallbackMap = {
      'hoverSound': () => this.createBeepSound(300, 0.1).play(),
      'clickSound': () => this.createBeepSound(400, 0.2).play(),
      'cardFlipSound': () => this.createBeepSound(200, 0.3).play(),
      'cardMatchSound': () => this.createBeepSound(600, 0.4).play(),
      'vortexSound': () => this.createBeepSound(250, 0.6).play(),
      'ghostSound': () => this.createBeepSound(350, 0.5).play(),
      'keySound': () => this.createBeepSound(500, 0.4).play(),
      'lightningSound': () => this.createBeepSound(150, 0.3).play(),
      'timeSound': () => this.createBeepSound(700, 0.4).play(),
      'freezeSound': () => this.createBeepSound(100, 0.5).play(),
      'levelCompleteSound': () => this.createSuccessSound().play()
    };
    
    if (fallbackMap[soundId]) {
      fallbackMap[soundId]();
    }
  },
  
  // Sonidos básicos
  playHover() { this.playSound(this.sounds.hoverSound); },
  playClick() { this.playSound(this.sounds.clickSound); },
  playCardFlip() { this.playSound(this.sounds.cardFlipSound); },
  playCardMatch() { this.playSound(this.sounds.cardMatchSound); },
  playVortex() { this.playSound(this.sounds.vortexSound); },
  playGhost() { this.playSound(this.sounds.ghostSound); },
  playKey() { this.playSound(this.sounds.keySound); },
  playLightning() { this.playSound(this.sounds.lightningSound); },
  playTime() { this.playSound(this.sounds.timeSound); },
  playFreeze() { this.playSound(this.sounds.freezeSound); },
  playLevelComplete() { this.playSound(this.sounds.levelCompleteSound); },
  playTimeWarning() { this.playSound(this.sounds.timeWarningSound); },
  playTimeUp() { this.playSound(this.sounds.timeUpSound); }
};

// Símbolos Nivel 3 con 4 CARTAS ESPECIALES NUEVAS
const simbolosNivel3 = [
  '👁️', '⚔️', '🛡️', '🏰', '🐉', '👑', 
  '🌀', '👻', '🗝️', '⚡',    // Cartas especiales originales
  '⏳', '❄️', '🔍', '🎭',     // NUEVAS cartas especiales
  '👁️', '⚔️', '🛡️', '🏰', '🐉', '👑',
  '🌀', '👻', '🗝️', '⚡',
  '⏳', '❄️', '🔍', '🎭'
];

// Mapeo de símbolos a sonidos específicos
const sonidosCartas = {
  '👁️': () => SoundSystem.playVortex(),
  '⚔️': () => SoundSystem.playLightning(),
  '🛡️': () => SoundSystem.playLightning(),
  '🏰': () => SoundSystem.playVortex(),
  '🐉': () => SoundSystem.playLightning(),
  '👑': () => SoundSystem.playVortex(),
  '🌀': () => SoundSystem.playVortex(),
  '👻': () => SoundSystem.playGhost(),
  '🗝️': () => SoundSystem.playKey(),
  '⚡': () => SoundSystem.playLightning(),
  '⏳': () => SoundSystem.playTime(),
  '❄️': () => SoundSystem.playFreeze(),
  '🔍': () => SoundSystem.playGhost(),
  '🎭': () => SoundSystem.playVortex()
};

// Efectos especiales para cada símbolo
const efectosSimbolos = {
  '👁️': (c1, c2) => aplicarEfectoOjo(c1, c2),
  '⚔️': (c1, c2) => aplicarEfectoEspada(c1, c2),
  '🛡️': (c1, c2) => aplicarEfectoEscudo(c1, c2),
  '🏰': (c1, c2) => aplicarEfectoCastillo(c1, c2),
  '🐉': (c1, c2) => aplicarEfectoDragon(c1, c2),
  '👑': (c1, c2) => aplicarEfectoCorona(c1, c2),
  '🌀': (c1, c2) => aplicarEfectoVortex(c1, c2),
  '👻': (c1, c2) => aplicarEfectoFantasma(c1, c2),
  '🗝️': (c1, c2) => aplicarEfectoLlave(c1, c2),
  '⚡': (c1, c2) => aplicarEfectoRelampago(c1, c2),
  '⏳': (c1, c2) => aplicarEfectoSandalia(c1, c2),
  '❄️': (c1, c2) => aplicarEfectoHielo(c1, c2),
  '🔍': (c1, c2) => aplicarEfectoLupa(c1, c2),
  '🎭': (c1, c2) => aplicarEfectoMascara(c1, c2)
};

// CARTAS ESPECIALES AVANZADAS - 8 CARTAS ESPECIALES EN TOTAL
const cartasEspeciales = {
  // Cartas especiales originales
  '🌀': {
    nombre: 'Vórtice Temporal',
    efecto: function() {
      const tiempoPerdido = 5;
      tiempo = Math.max(0, tiempo - tiempoPerdido);
      tiempoSpan.textContent = `TIEMPO: ${tiempo}`;
      mostrarEfectoActivo('🌀 Vórtice Temporal: -5 segundos!');
      mostrarTiempoExtra(`-${tiempoPerdido}s`);
      SoundSystem.playVortex();
      
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
      mostrarEfectoActivo('👻 Fantasma Engañoso: ¡Cartas cambian de lugar!');
      SoundSystem.playGhost();
      intercambiarCartasAleatorias();
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
  },
  
  // NUEVAS CARTAS ESPECIALES
  '⏳': {
    nombre: 'Arena del Tiempo',
    efecto: function() {
      const tiempoGanado = 10;
      tiempo += tiempoGanado;
      tiempoSpan.textContent = `TIEMPO: ${tiempo}`;
      mostrarEfectoActivo('⏳ Arena del Tiempo: +10 segundos!');
      mostrarTiempoExtra(`+${tiempoGanado}s`);
      SoundSystem.playTime();
      
      const cards = document.querySelectorAll('.card');
      cards.forEach(card => {
        card.classList.add('efecto-tiempo');
        setTimeout(() => card.classList.remove('efecto-tiempo'), 1500);
      });
    }
  },
  '❄️': {
    nombre: 'Escarcha Eterna',
    efecto: function() {
      mostrarEfectoActivo('❄️ Escarcha Eterna: ¡Tiempo congelado!');
      SoundSystem.playFreeze();
      congelarTiempo();
    }
  },
  '🔍': {
    nombre: 'Ojo de la Verdad',
    efecto: function() {
      mostrarEfectoActivo('🔍 Ojo de la Verdad: ¡Revela un par!');
      SoundSystem.playGhost();
      revelarParCompleto();
    }
  },
  '🎭': {
    nombre: 'Máscara del Engaño',
    efecto: function() {
      mostrarEfectoActivo('🎭 Máscara del Engaño: ¡Cartas se transforman!');
      SoundSystem.playVortex();
      transformarCartasAleatorias();
    }
  }
};

function playHoverSound() {
  SoundSystem.playHover();
}

function playClickSound() {
  SoundSystem.playClick();
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
  tiempoCongelado = false;
  const simbolosMezclados = mezclarArray([...simbolosNivel3]);
  
  simbolosMezclados.forEach(simbolo => {
    const card = document.createElement('div');
    card.classList.add('card');
    
    // Marcar cartas especiales (8 especiales en total)
    if (['🌀', '👻', '🗝️', '⚡', '⏳', '❄️', '🔍', '🎭'].includes(simbolo)) {
      card.classList.add('especial');
      
      // Clases específicas para cada tipo de especial
      if (['⏳', '❄️'].includes(simbolo)) {
        card.classList.add('especial-tiempo');
      } else if (['🔍', '🎭'].includes(simbolo)) {
        card.classList.add('especial-magia');
      }
    }
    
    card.innerHTML = `
      <div class="front">${simbolo}</div>
      <div class="back"></div>
    `;
    
    card.addEventListener('click', () => voltearCarta(card, simbolo));
    card.addEventListener('mouseenter', () => {
      if (!card.classList.contains('flipped') && !card.classList.contains('encontrada') && !cartasBloqueadas.includes(card)) {
        SoundSystem.playHover();
      }
    });
    
    memoryGame.appendChild(card);
  });
}

// Voltear carta
function voltearCarta(card, simbolo) {
  if (!puedeVoltear || card.classList.contains('flipped') || card.classList.contains('encontrada') || efectoActivo || cartasBloqueadas.includes(card) || tiempoCongelado) {
    return;
  }
  
  SoundSystem.playCardFlip();
  
  // Reproducir sonido específico de la carta
  if (sonidosCartas[simbolo]) {
    setTimeout(() => sonidosCartas[simbolo](), 100);
  }
  
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
    // Par encontrado
    SoundSystem.playCardMatch();
    
    // Aplicar efecto especial según el símbolo
    if (efectosSimbolos[carta1.simbolo]) {
      efectosSimbolos[carta1.simbolo](carta1.card, carta2.card);
    }
    
    // Verificar si es una carta especial
    if (cartasEspeciales[carta1.simbolo]) {
      efectoActivo = true;
      
      // APLICAR EL EFECTO ESPECIAL PRIMERO
      cartasEspeciales[carta1.simbolo].efecto();
      
      // LUEGO marcar como encontradas después del efecto
      setTimeout(() => {
        carta1.card.classList.add('encontrada');
        carta2.card.classList.add('encontrada');
        carta1.card.style.pointerEvents = 'none';
        carta2.card.style.pointerEvents = 'none';
        
        paresEncontrados++;
        paresSpan.textContent = `PAREJAS: ${paresEncontrados}/${totalPares}`;
        
        cartasVolteadas = [];
        puedeVoltear = true;
        efectoActivo = false;
        verificarNivelCompletado();
      }, 3000); // Más tiempo para efectos complejos
      
    } else {
      // Carta normal - marcar como encontradas inmediatamente
      carta1.card.classList.add('encontrada');
      carta2.card.classList.add('encontrada');
      carta1.card.style.pointerEvents = 'none';
      carta2.card.style.pointerEvents = 'none';
      
      paresEncontrados++;
      paresSpan.textContent = `PAREJAS: ${paresEncontrados}/${totalPares}`;
      cartasVolteadas = [];
      puedeVoltear = true;
      verificarNivelCompletado();
    }
  } else {
    // No es par
    SoundSystem.playGhost();
    
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

// EFECTOS ESPECIALES PARA CADA SÍMBOLO
function aplicarEfectoDragon(carta1, carta2) {
  SoundSystem.playLightning();
  carta1.style.animation = 'dragonSuccess 0.8s ease-in-out';
  carta2.style.animation = 'dragonSuccess 0.8s ease-in-out';
  
  const fireEffect = document.createElement('div');
  fireEffect.style.cssText = `
    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
    width: 300px; height: 300px;
    background: radial-gradient(circle, rgba(255,100,0,0.6) 0%, rgba(255,50,0,0.4) 30%, transparent 70%);
    border-radius: 50%; animation: dragonFire 0.8s ease-out;
    pointer-events: none; z-index: 1000;
  `;
  document.body.appendChild(fireEffect);
  setTimeout(() => fireEffect.remove(), 800);
}

function aplicarEfectoOjo(carta1, carta2) {
  carta1.style.animation = 'pulse 0.6s ease-in-out 2';
  carta2.style.animation = 'pulse 0.6s ease-in-out 2';
  
  const ojoEffect = document.createElement('div');
  ojoEffect.style.cssText = `
    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
    width: 250px; height: 250px;
    background: radial-gradient(circle, rgba(139, 0, 139, 0.4) 0%, rgba(75, 0, 130, 0.3) 50%, transparent 70%);
    border-radius: 50%; animation: dragonFire 0.6s ease-out;
    pointer-events: none; z-index: 1000;
  `;
  document.body.appendChild(ojoEffect);
  setTimeout(() => ojoEffect.remove(), 600);
}

function aplicarEfectoEspada(carta1, carta2) {
  carta1.style.animation = 'shake 0.4s ease-in-out';
  carta2.style.animation = 'shake 0.4s ease-in-out';
  
  const espadaEffect = document.createElement('div');
  espadaEffect.style.cssText = `
    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
    width: 200px; height: 10px;
    background: linear-gradient(45deg, transparent 40%, rgba(255, 255, 255, 0.6) 50%, transparent 60%);
    animation: dragonFire 0.4s ease-out; pointer-events: none; z-index: 1000;
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
    carta1.style.boxShadow = ''; carta2.style.boxShadow = '';
  }, 600);
}

function aplicarEfectoCastillo(carta1, carta2) {
  const castilloEffect = document.createElement('div');
  castilloEffect.style.cssText = `
    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
    width: 200px; height: 200px;
    background: radial-gradient(circle, rgba(139, 69, 19, 0.5) 0%, rgba(101, 67, 33, 0.3) 50%, transparent 70%);
    border-radius: 50%; animation: dragonFire 0.7s ease-out;
    pointer-events: none; z-index: 1000;
  `;
  document.body.appendChild(castilloEffect);
  setTimeout(() => castilloEffect.remove(), 700);
}

function aplicarEfectoCorona(carta1, carta2) {
  carta1.style.animation = 'dragonSuccess 0.8s ease-in-out';
  carta2.style.animation = 'dragonSuccess 0.8s ease-in-out';
  
  const coronaEffect = document.createElement('div');
  coronaEffect.style.cssText = `
    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
    width: 250px; height: 250px;
    background: radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, rgba(255, 165, 0, 0.3) 50%, transparent 70%);
    border-radius: 50%; animation: dragonFire 0.8s ease-out;
    pointer-events: none; z-index: 1000;
  `;
  document.body.appendChild(coronaEffect);
  setTimeout(() => coronaEffect.remove(), 800);
}

function aplicarEfectoVortex(carta1, carta2) {
  SoundSystem.playVortex();
  carta1.classList.add('efecto-vortex'); carta2.classList.add('efecto-vortex');
  setTimeout(() => { carta1.classList.remove('efecto-vortex'); carta2.classList.remove('efecto-vortex'); }, 1000);
}

function aplicarEfectoFantasma(carta1, carta2) {
  SoundSystem.playGhost();
  carta1.classList.add('efecto-fantasma'); carta2.classList.add('efecto-fantasma');
  setTimeout(() => { carta1.classList.remove('efecto-fantasma'); carta2.classList.remove('efecto-fantasma'); }, 2000);
}

function aplicarEfectoLlave(carta1, carta2) {
  SoundSystem.playKey();
  carta1.classList.add('efecto-llave'); carta2.classList.add('efecto-llave');
  setTimeout(() => { carta1.classList.remove('efecto-llave'); carta2.classList.remove('efecto-llave'); }, 1500);
}

function aplicarEfectoRelampago(carta1, carta2) {
  SoundSystem.playLightning();
  memoryGame.classList.add('efecto-relampago');
  setTimeout(() => memoryGame.classList.remove('efecto-relampago'), 800);
}

// NUEVOS EFECTOS ESPECIALES
function aplicarEfectoSandalia(carta1, carta2) {
  SoundSystem.playTime();
  carta1.classList.add('efecto-tiempo'); carta2.classList.add('efecto-tiempo');
  setTimeout(() => { carta1.classList.remove('efecto-tiempo'); carta2.classList.remove('efecto-tiempo'); }, 1500);
}

function aplicarEfectoHielo(carta1, carta2) {
  SoundSystem.playFreeze();
  carta1.classList.add('efecto-hielo'); carta2.classList.add('efecto-hielo');
  setTimeout(() => { carta1.classList.remove('efecto-hielo'); carta2.classList.remove('efecto-hielo'); }, 2000);
}

function aplicarEfectoLupa(carta1, carta2) {
  SoundSystem.playGhost();
  carta1.classList.add('efecto-lupa'); carta2.classList.add('efecto-lupa');
  setTimeout(() => { carta1.classList.remove('efecto-lupa'); carta2.classList.remove('efecto-lupa'); }, 1800);
}

function aplicarEfectoMascara(carta1, carta2) {
  SoundSystem.playVortex();
  carta1.classList.add('efecto-mascara'); carta2.classList.add('efecto-mascara');
  setTimeout(() => { carta1.classList.remove('efecto-mascara'); carta2.classList.remove('efecto-mascara'); }, 1600);
}

// EFECTOS ESPECIALES AVANZADOS - IMPLEMENTACIONES
function intercambiarCartasAleatorias() {
  const cards = document.querySelectorAll('.card:not(.encontrada)');
  if (cards.length >= 2) {
    const indices = [...Array(cards.length).keys()].sort(() => Math.random() - 0.5).slice(0, 4);
    
    indices.forEach(index => {
      cards[index].classList.add('efecto-fantasma');
    });
    
    setTimeout(() => {
      // Intercambiar posiciones en el DOM
      const shuffled = [...cards].sort(() => Math.random() - 0.5);
      cards.forEach((card, index) => {
        memoryGame.appendChild(shuffled[index]);
        card.classList.remove('efecto-fantasma');
      });
    }, 1500);
  }
}

function bloquearCartaAleatoria() {
  const cards = document.querySelectorAll('.card:not(.encontrada):not(.flipped)');
  if (cards.length > 0) {
    const randomCard = cards[Math.floor(Math.random() * cards.length)];
    cartasBloqueadas.push(randomCard);
    randomCard.classList.add('bloqueada', 'efecto-bloqueo');
    
    setTimeout(() => randomCard.classList.remove('efecto-bloqueo'), 1500);
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
  memoryGame.classList.add('efecto-relampago');
  
  cards.forEach(card => {
    if (!card.classList.contains('flipped') && !cartasBloqueadas.includes(card)) {
      card.classList.add('flipped');
    }
  });
  
  setTimeout(() => {
    memoryGame.classList.remove('efecto-relampago');
    cards.forEach(card => {
      const wasFlipped = cartasVolteadas.some(c => c.card === card);
      if (!wasFlipped && !card.classList.contains('encontrada')) {
        card.classList.remove('flipped');
      }
    });
  }, 2000);
}

function congelarTiempo() {
  tiempoCongelado = true;
  tiempoSpan.style.color = '#00ffff';
  tiempoSpan.style.animation = 'pulse 1s infinite';
  
  // Efecto visual de congelación
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    card.classList.add('efecto-hielo');
  });
  
  setTimeout(() => {
    tiempoCongelado = false;
    tiempoSpan.style.color = '#e0d3b8';
    tiempoSpan.style.animation = '';
    cards.forEach(card => card.classList.remove('efecto-hielo'));
  }, 5000);
}

function revelarParCompleto() {
  const cards = document.querySelectorAll('.card:not(.encontrada):not(.flipped)');
  const simbolosDisponibles = {};
  
  // Encontrar pares disponibles
  cards.forEach(card => {
    const front = card.querySelector('.front');
    if (front) {
      const simbolo = front.textContent;
      if (!simbolosDisponibles[simbolo]) {
        simbolosDisponibles[simbolo] = [];
      }
      simbolosDisponibles[simbolo].push(card);
    }
  });
  
  // Encontrar un par completo
  for (const simbolo in simbolosDisponibles) {
    if (simbolosDisponibles[simbolo].length >= 2) {
      const [carta1, carta2] = simbolosDisponibles[simbolo].slice(0, 2);
      
      // Revelar el par
      carta1.classList.add('flipped', 'efecto-lupa');
      carta2.classList.add('flipped', 'efecto-lupa');
      
      // Ocultar después de 3 segundos
      setTimeout(() => {
        if (!carta1.classList.contains('encontrada')) carta1.classList.remove('flipped', 'efecto-lupa');
        if (!carta2.classList.contains('encontrada')) carta2.classList.remove('flipped', 'efecto-lupa');
      }, 3000);
      
      break;
    }
  }
}

function transformarCartasAleatorias() {
  const cards = document.querySelectorAll('.card:not(.encontrada):not(.flipped)');
  const transformCount = Math.min(3, cards.length);
  
  for (let i = 0; i < transformCount; i++) {
    const card = cards[Math.floor(Math.random() * cards.length)];
    card.classList.add('efecto-mascara');
    
    setTimeout(() => {
      card.classList.remove('efecto-mascara');
    }, 2000);
  }
}

function mostrarEfectoActivo(mensaje) {
  efectoActivoDiv.textContent = mensaje;
  efectoActivoDiv.classList.add('mostrar');
  setTimeout(() => efectoActivoDiv.classList.remove('mostrar'), 3000);
}

function mostrarTiempoExtra(mensaje) {
  if (tiempoExtraDiv) {
    tiempoExtraDiv.textContent = mensaje;
    tiempoExtraDiv.classList.add('mostrar');
    setTimeout(() => tiempoExtraDiv.classList.remove('mostrar'), 2000);
  }
}

function verificarNivelCompletado() {
  if (paresEncontrados === totalPares) {
    clearInterval(intervalo);
    SoundSystem.playLevelComplete();
    
    localStorage.setItem('victoryNivel', `Nivel ${nivel} - ABISMO ETERNO`);
    localStorage.setItem('victoryNivelNumero', nivel);
    localStorage.setItem('victoryPares', paresEncontrados);
    localStorage.setItem('victoryTotalPares', totalPares);
    localStorage.setItem('victoryTiempo', tiempo);
    localStorage.setItem('victoryPuntuacion', '0');
    localStorage.setItem('victoryCombo', '0');
    
    setTimeout(() => window.location.href = "levelComplete.html", 2000);
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
    if (tiempo > 0 && !tiempoCongelado) {
      tiempo--;
      tiempoSpan.textContent = `TIEMPO: ${tiempo}`;
      
      if (tiempo === 20) SoundSystem.playTimeWarning();
      
      if (tiempo <= 20) {
        tiempoSpan.style.color = '#ff4444';
        tiempoSpan.style.animation = tiempoSpan.style.animation ? '' : 'pulse 1s infinite';
      } else if (tiempo <= 45) {
        tiempoSpan.style.color = '#ffaa00';
      }
    } else if (tiempo <= 0) {
      clearInterval(intervalo);
      tiempoSpan.style.color = '#ff4444';
      SoundSystem.playTimeUp();
      
      localStorage.setItem('gameOverNivel', `Nivel ${nivel} - ABISMO ETERNO`);
      localStorage.setItem('gameOverPares', paresEncontrados);
      localStorage.setItem('gameOverTotalPares', totalPares);
      localStorage.setItem('gameOverTiempo', tiempo);
      
      setTimeout(() => window.location.href = "gameOver.html", 1500);
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
  tiempoCongelado = false;
  
  tiempoSpan.textContent = `TIEMPO: ${tiempo}`;
  tiempoSpan.style.color = '#e0d3b8';
  tiempoSpan.style.animation = '';
  paresSpan.textContent = `PAREJAS: ${paresEncontrados}/${totalPares}`;
  efectoActivoDiv.classList.remove('mostrar');
  if (tiempoExtraDiv) tiempoExtraDiv.classList.remove('mostrar');
  
  crearTablero();
  iniciarTemporizador();
}

// Volver al menú
function volver() {
  SoundSystem.playClick();
  clearInterval(intervalo);
  setTimeout(() => window.location.href = "niveles.html", 300);
}

// Inyectar estilos CSS dinámicos para animaciones
function injectAnimations() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes dragonSuccess {
      0% { transform: rotateY(180deg) scale(1.05); box-shadow: 0 0 20px #ff4444; }
      25% { transform: rotateY(180deg) scale(1.2) rotate(5deg); box-shadow: 0 0 40px #ff6a00, 0 0 60px #ff4444; }
      50% { transform: rotateY(180deg) scale(1.15) rotate(-5deg); box-shadow: 0 0 50px #ff8c00, 0 0 70px #ff6a00; }
      75% { transform: rotateY(180deg) scale(1.1) rotate(2deg); box-shadow: 0 0 30px #ff4444; }
      100% { transform: rotateY(180deg) scale(1.05); box-shadow: 0 0 20px #2e8b57; }
    }
    
    @keyframes dragonFire {
      0% { opacity: 0; transform: translate(-50%, -50%) scale(0.1); }
      50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.5); }
      100% { opacity: 0; transform: translate(-50%, -50%) scale(2); }
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
    
    /* Nuevas animaciones para efectos especiales */
    @keyframes efectoVortex {
      0% { transform: rotate(0deg) scale(1); }
      50% { transform: rotate(180deg) scale(1.1); }
      100% { transform: rotate(360deg) scale(1); }
    }
    
    @keyframes efectoFantasma {
      0%, 100% { opacity: 1; transform: translateY(0); }
      50% { opacity: 0.5; transform: translateY(-10px); }
    }
    
    @keyframes efectoBloqueo {
      0%, 100% { box-shadow: 0 0 0px rgba(255, 0, 0, 0.5); }
      50% { box-shadow: 0 0 20px rgba(255, 0, 0, 0.8); }
    }
    
    @keyframes efectoRelampago {
      0%, 100% { filter: brightness(1); }
      50% { filter: brightness(2); }
    }
    
    @keyframes effectoTiempo {
      0%, 100% { box-shadow: 0 0 0px rgba(255, 215, 0, 0.5); }
      50% { box-shadow: 0 0 25px rgba(255, 215, 0, 0.8); }
    }
    
    @keyframes efectoHielo {
      0%, 100% { filter: hue-rotate(0deg) brightness(1); }
      50% { filter: hue-rotate(180deg) brightness(1.2); }
    }
    
    @keyframes efectoLupa {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
    
    @keyframes efectoMascara {
      0%, 100% { opacity: 1; }
      25% { opacity: 0.3; }
      50% { opacity: 0.7; }
      75% { opacity: 0.3; }
    }
  `;
  document.head.appendChild(style);
}

// Inicializar juego completo
function iniciarJuego() {
  injectAnimations();
  SoundSystem.init();
  
  setTimeout(() => SoundSystem.playLevelComplete(), 500);
  
  nivelSpan.textContent = "NIVEL: 3 - ABISMO ETERNO";
  paresSpan.textContent = `PAREJAS: ${paresEncontrados}/${totalPares}`;
  crearTablero();
  iniciarTemporizador();
  
  const botones = document.querySelectorAll('.btn');
  botones.forEach(boton => {
    boton.addEventListener('mouseenter', () => SoundSystem.playHover());
    boton.addEventListener('click', () => SoundSystem.playClick());
  });
}

// Iniciar cuando DOM esté listo
document.addEventListener('DOMContentLoaded', iniciarJuego);

// Forzar la interacción del usuario para el AudioContext
document.addEventListener('click', function() {
  if (SoundSystem.audioContext && SoundSystem.audioContext.state === 'suspended') {
    SoundSystem.audioContext.resume();
  }
});