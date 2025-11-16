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

// Sistema de sonidos MEJORADO - Con fallback como Nivel 1
const SoundSystem = {
  sounds: {},
  audioContext: null,
  
  init() {
    // Intentar crear AudioContext
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.log('AudioContext no soportado:', e);
    }
    
    // Cargar elementos de audio
    this.loadHtmlAudioElements();
    
    // Crear sonidos base si no hay archivos
    this.createFallbackSounds();
    
    console.log('🔊 SoundSystem Nivel 2 inicializado correctamente');
  },
  
  loadHtmlAudioElements() {
    const audioIds = [
      'hoverSound', 'clickSound', 'cardFlipSound', 'cardMatchSound',
      'spiderSound', 'skullSound', 'moonSound', 'fireSound', 
      'levelCompleteSound', 'timeWarningSound', 'timeUpSound',
      'restartSound', 'menuBackSound'
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
      'spiderSound': this.createBeepSound(350, 0.5),
      'skullSound': this.createBeepSound(250, 0.6),
      'fireSound': this.createBeepSound(150, 0.4),
      'levelCompleteSound': this.createSuccessSound(),
      'restartSound': this.createBeepSound(500, 0.3),
      'menuBackSound': this.createBeepSound(300, 0.2)
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
      'spiderSound': () => this.createBeepSound(350, 0.5).play(),
      'skullSound': () => this.createBeepSound(250, 0.6).play(),
      'fireSound': () => this.createBeepSound(150, 0.4).play(),
      'levelCompleteSound': () => this.createSuccessSound().play(),
      'restartSound': () => this.createBeepSound(500, 0.3).play(),
      'menuBackSound': () => this.createBeepSound(300, 0.2).play()
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
  playSpider() { this.playSound(this.sounds.spiderSound); },
  playSkull() { this.playSound(this.sounds.skullSound); },
  playMoon() { this.playSound(this.sounds.moonSound); },
  playFire() { this.playSound(this.sounds.fireSound); },
  playLevelComplete() { this.playSound(this.sounds.levelCompleteSound); },
  playTimeWarning() { this.playSound(this.sounds.timeWarningSound); },
  playTimeUp() { this.playSound(this.sounds.timeUpSound); },
  playRestart() { this.playSound(this.sounds.restartSound); },
  playMenuBack() { this.playSound(this.sounds.menuBackSound); }
};

// Símbolos Nivel 2 con cartas especiales
const simbolosNivel2 = [
  '👁️', '⚔️', '🛡️', '🏰', '🐉', '👑', '🕷️', '💀',
  '👁️', '⚔️', '🛡️', '🏰', '🐉', '👑', '🕷️', '💀'
];

// Mapeo de símbolos a sonidos específicos
const sonidosCartas = {
  '👁️': () => SoundSystem.playMoon(),
  '⚔️': () => SoundSystem.playFire(),
  '🛡️': () => SoundSystem.playFire(),
  '🏰': () => SoundSystem.playMoon(),
  '🐉': () => SoundSystem.playFire(),
  '👑': () => SoundSystem.playMoon(),
  '🕷️': () => SoundSystem.playSpider(),
  '💀': () => SoundSystem.playSkull()
};

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
  '🕷️': function(carta1, carta2) {
    aplicarEfectoArana(carta1, carta2);
  },
  '💀': function(carta1, carta2) {
    aplicarEfectoCalavera(carta1, carta2);
  }
};

// Cartas especiales y sus efectos CORREGIDOS
const cartasEspeciales = {
  '🕷️': {
    nombre: 'Araña del Caos',
    efecto: function() {
      mostrarEfectoActivo('🕷️ Araña del Caos: ¡Las cartas se mezclan!');
      SoundSystem.playSpider();
      mezclarTableroRealmente();
    }
  },
  '💀': {
    nombre: 'Calavera Maldita',
    efecto: function() {
      mostrarEfectoActivo('💀 Calavera Maldita: ¡Cartas volteadas!');
      SoundSystem.playSkull();
      voltearCartasAleatorias(3); // Voltear 3 cartas aleatorias
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
    card.addEventListener('mouseenter', () => {
      if (!card.classList.contains('flipped') && !card.classList.contains('encontrada')) {
        SoundSystem.playHover();
      }
    });
    
    memoryGame.appendChild(card);
  });
}

// Voltear carta
function voltearCarta(card, simbolo) {
  if (!puedeVoltear || card.classList.contains('flipped') || card.classList.contains('encontrada') || efectoActivo) {
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

// Verificar si las cartas forman un par - CORREGIDO PARA MOSTRAR IMAGEN PERMANENTE
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
      
      // LUEGO marcar como encontradas después del efecto (PERMANECEN VISIBLES)
      setTimeout(() => {
        carta1.card.classList.add('encontrada');
        carta2.card.classList.add('encontrada');
        carta1.card.style.pointerEvents = 'none';
        carta2.card.style.pointerEvents = 'none';
        
        // MANTENER LAS CARTAS VOLTEADAS (VISIBLES)
        carta1.card.classList.add('flipped');
        carta2.card.classList.add('flipped');
        
        paresEncontrados++;
        paresSpan.textContent = `PAREJAS: ${paresEncontrados}/${totalPares}`;
        
        cartasVolteadas = [];
        puedeVoltear = true;
        efectoActivo = false;
        verificarNivelCompletado();
      }, 2000); // Tiempo suficiente para el efecto especial
      
    } else {
      // Carta normal - marcar como encontradas inmediatamente (PERMANECEN VISIBLES)
      carta1.card.classList.add('encontrada');
      carta2.card.classList.add('encontrada');
      carta1.card.style.pointerEvents = 'none';
      carta2.card.style.pointerEvents = 'none';
      
      // MANTENER LAS CARTAS VOLTEADAS (VISIBLES)
      carta1.card.classList.add('flipped');
      carta2.card.classList.add('flipped');
      
      paresEncontrados++;
      paresSpan.textContent = `PAREJAS: ${paresEncontrados}/${totalPares}`;
      cartasVolteadas = [];
      puedeVoltear = true;
      verificarNivelCompletado();
    }
  } else {
    // No es par
    SoundSystem.playSkull(); // Sonido de error
    
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

// EFECTOS ESPECIALES PARA CADA SÍMBOLO - MEJORADOS
function aplicarEfectoDragon(carta1, carta2) {
  SoundSystem.playFire();
  
  carta1.style.animation = 'dragonSuccess 0.8s ease-in-out';
  carta2.style.animation = 'dragonSuccess 0.8s ease-in-out';
  
  const fireEffect = document.createElement('div');
  fireEffect.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(255,100,0,0.6) 0%, rgba(255,50,0,0.4) 30%, transparent 70%);
    border-radius: 50%;
    animation: dragonFire 0.8s ease-out;
    pointer-events: none;
    z-index: 1000;
  `;
  document.body.appendChild(fireEffect);
  setTimeout(() => fireEffect.remove(), 800);
}

function aplicarEfectoOjo(carta1, carta2) {
  carta1.style.animation = 'pulse 0.6s ease-in-out 2';
  carta2.style.animation = 'pulse 0.6s ease-in-out 2';
  
  const ojoEffect = document.createElement('div');
  ojoEffect.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 250px;
    height: 250px;
    background: radial-gradient(circle, rgba(139, 0, 139, 0.4) 0%, rgba(75, 0, 130, 0.3) 50%, transparent 70%);
    border-radius: 50%;
    animation: dragonFire 0.6s ease-out;
    pointer-events: none;
    z-index: 1000;
  `;
  document.body.appendChild(ojoEffect);
  setTimeout(() => ojoEffect.remove(), 600);
}

function aplicarEfectoEspada(carta1, carta2) {
  carta1.style.animation = 'shake 0.4s ease-in-out';
  carta2.style.animation = 'shake 0.4s ease-in-out';
  
  const espadaEffect = document.createElement('div');
  espadaEffect.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 200px;
    height: 10px;
    background: linear-gradient(45deg, transparent 40%, rgba(255, 255, 255, 0.6) 50%, transparent 60%);
    animation: dragonFire 0.4s ease-out;
    pointer-events: none;
    z-index: 1000;
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
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(139, 69, 19, 0.5) 0%, rgba(101, 67, 33, 0.3) 50%, transparent 70%);
    border-radius: 50%;
    animation: dragonFire 0.7s ease-out;
    pointer-events: none;
    z-index: 1000;
  `;
  document.body.appendChild(castilloEffect);
  setTimeout(() => castilloEffect.remove(), 700);
}

function aplicarEfectoCorona(carta1, carta2) {
  carta1.style.animation = 'dragonSuccess 0.8s ease-in-out';
  carta2.style.animation = 'dragonSuccess 0.8s ease-in-out';
  
  const coronaEffect = document.createElement('div');
  coronaEffect.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 250px;
    height: 250px;
    background: radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, rgba(255, 165, 0, 0.3) 50%, transparent 70%);
    border-radius: 50%;
    animation: dragonFire 0.8s ease-out;
    pointer-events: none;
    z-index: 1000;
  `;
  document.body.appendChild(coronaEffect);
  setTimeout(() => coronaEffect.remove(), 800);
}

function aplicarEfectoArana(carta1, carta2) {
  SoundSystem.playSpider();
  
  carta1.style.animation = 'mezclar 0.8s ease-in-out';
  carta2.style.animation = 'mezclar 0.8s ease-in-out';
  
  const aranaEffect = document.createElement('div');
  aranaEffect.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(0, 0, 0, 0.6) 0%, transparent 70%);
    border-radius: 50%;
    animation: dragonFire 0.8s ease-out;
    pointer-events: none;
    z-index: 1000;
  `;
  document.body.appendChild(aranaEffect);
  setTimeout(() => aranaEffect.remove(), 800);
}

function aplicarEfectoCalavera(carta1, carta2) {
  SoundSystem.playSkull();
  
  carta1.style.animation = 'shake 0.6s ease-in-out';
  carta2.style.animation = 'shake 0.6s ease-in-out';
  
  const calaveraEffect = document.createElement('div');
  calaveraEffect.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(128, 0, 0, 0.5) 0%, rgba(64, 0, 0, 0.3) 50%, transparent 70%);
    border-radius: 50%;
    animation: dragonFire 0.6s ease-out;
    pointer-events: none;
    z-index: 1000;
  `;
  document.body.appendChild(calaveraEffect);
  setTimeout(() => calaveraEffect.remove(), 600);
}

// EFECTOS ESPECIALES CORREGIDOS - AHORA FUNCIONALES
function mezclarTableroRealmente() {
  const cards = Array.from(document.querySelectorAll('.card:not(.encontrada)'));
  
  // Animación visual
  cards.forEach(card => {
    card.style.animation = 'mezclar 0.8s ease-in-out';
  });
  
  // Mezclar realmente las posiciones
  setTimeout(() => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    
    shuffled.forEach((card, index) => {
      memoryGame.appendChild(card);
    });
    
    // Quitar animación
    setTimeout(() => {
      cards.forEach(card => {
        card.style.animation = '';
      });
    }, 100);
  }, 400);
}

function voltearCartasAleatorias(cantidad) {
  // Buscar cartas volteadas que NO estén encontradas
  const cards = Array.from(document.querySelectorAll('.card.flipped:not(.encontrada)'));
  
  if (cards.length === 0) return;
  
  const cartasParaVoltear = cards.sort(() => 0.5 - Math.random()).slice(0, Math.min(cantidad, cards.length));
  
  cartasParaVoltear.forEach((card, index) => {
    setTimeout(() => {
      card.classList.remove('flipped');
    }, index * 200); // Efecto escalonado
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
    
    // Guardar datos para pantalla de Victoria
    localStorage.setItem('victoryNivel', `Nivel ${nivel} - CRIPTA MALDITA`);
    localStorage.setItem('victoryNivelNumero', nivel);
    localStorage.setItem('victoryPares', paresEncontrados);
    localStorage.setItem('victoryTotalPares', totalPares);
    localStorage.setItem('victoryTiempo', tiempo);
    localStorage.setItem('victoryPuntuacion', '0');
    localStorage.setItem('victoryCombo', '0');
    
    setTimeout(() => {
      window.location.href = "levelComplete.html";
    }, 2000);
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
      
      // Guardar datos para pantalla de Game Over
      localStorage.setItem('gameOverNivel', `Nivel ${nivel} - CRIPTA MALDITA`);
      localStorage.setItem('gameOverPares', paresEncontrados);
      localStorage.setItem('gameOverTotalPares', totalPares);
      localStorage.setItem('gameOverTiempo', tiempo);
      
      setTimeout(() => {
        window.location.href = "gameOver.html";
      }, 1500);
    }
  }, 1000);
}

// Reiniciar nivel
function reiniciarNivel() {
  SoundSystem.playRestart();
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
  SoundSystem.playMenuBack();
  SoundSystem.playClick();
  
  clearInterval(intervalo);
  setTimeout(() => {
    window.location.href = "niveles.html";
  }, 300);
}

// Añadir estilos de animación
function injectAnimations() {
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
    
    @keyframes mezclar {
      0% { transform: translate(0, 0) rotate(0deg); }
      25% { transform: translate(20px, -10px) rotate(10deg); }
      50% { transform: translate(-10px, 15px) rotate(-8deg); }
      75% { transform: translate(15px, -12px) rotate(5deg); }
      100% { transform: translate(0, 0) rotate(0deg); }
    }
  `;
  document.head.appendChild(style);
}

// Inicializar juego completo
function iniciarJuego() {
  injectAnimations();
  SoundSystem.init();
  
  // Esperar y reproducir sonido de inicio
  setTimeout(() => {
    SoundSystem.playLevelComplete(); // Usamos este como sonido de inicio
  }, 500);
  
  nivelSpan.textContent = "NIVEL: 2 - CRIPTA MALDITA";
  paresSpan.textContent = `PAREJAS: ${paresEncontrados}/${totalPares}`;
  crearTablero();
  iniciarTemporizador();
  
  // Agregar event listeners para los botones
  const botones = document.querySelectorAll('.btn');
  
  botones.forEach(boton => {
    boton.addEventListener('mouseenter', function() {
      SoundSystem.playHover();
    });
    
    boton.addEventListener('click', function() {
      SoundSystem.playClick();
    });
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