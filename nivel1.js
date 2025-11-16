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

// Sistema de sonidos MEJORADO - Con sonidos base integrados
const SoundSystem = {
  sounds: {},
  audioContext: null,
  
  init() {
    // Intentar crear AudioContext (necesario para sonidos dinámicos)
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.log('AudioContext no soportado:', e);
    }
    
    // Cargar elementos de audio del HTML
    this.loadHtmlAudioElements();
    
    // Crear sonidos base si no hay archivos
    this.createFallbackSounds();
    
    console.log('🔊 SoundSystem inicializado correctamente');
  },
  
  loadHtmlAudioElements() {
    // Cargar TODOS los elementos de audio del HTML
    const audioIds = [
      'hoverSound', 'clickSound', 'cardFlipSound', 'cardMatchSound',
      'dragonRoarSound', 'levelCompleteSound', 'timeWarningSound', 'timeUpSound',
      'eyeSound', 'swordSound', 'shieldSound', 'castleSound', 
      'dragonSound', 'crownSound', 'errorMismatchSound', 'levelStartSound',
      'restartSound', 'menuBackSound'
    ];
    
    audioIds.forEach(id => {
      this.sounds[id] = document.getElementById(id);
    });
  },
  
  createFallbackSounds() {
    // Crear sonidos base para los más importantes si no existen
    const essentialSounds = {
      'hoverSound': this.createBeepSound(300, 0.1),
      'clickSound': this.createBeepSound(400, 0.2),
      'cardFlipSound': this.createBeepSound(200, 0.3),
      'cardMatchSound': this.createBeepSound(600, 0.4),
      'errorMismatchSound': this.createBeepSound(150, 0.3),
      'levelCompleteSound': this.createSuccessSound()
    };
    
    // Asignar sonidos base si los elementos de audio no están disponibles
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
        const frequencies = [523.25, 659.25, 783.99, 1046.50]; // Do, Mi, Sol, Do
        
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
      // Si es un elemento de audio HTML
      if (soundElement.play) {
        soundElement.currentTime = 0;
        soundElement.play().catch(error => {
          console.log('Error reproduciendo audio HTML:', error);
          // Intentar reproducir con AudioContext como fallback
          this.playFallbackSound(soundElement.id);
        });
      } 
      // Si es un sonido generado dinámicamente
      else if (soundElement.play && typeof soundElement.play === 'function') {
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
      'errorMismatchSound': () => this.createBeepSound(150, 0.3).play(),
      'levelCompleteSound': () => this.createSuccessSound().play()
    };
    
    if (fallbackMap[soundId]) {
      fallbackMap[soundId]();
    }
  },
  
  // Sonidos básicos
  playHover() { 
    this.playSound(this.sounds.hoverSound); 
  },
  playClick() { 
    this.playSound(this.sounds.clickSound); 
  },
  playCardFlip() { 
    this.playSound(this.sounds.cardFlipSound); 
  },
  playCardMatch() { 
    this.playSound(this.sounds.cardMatchSound); 
  },
  playDragonRoar() { 
    this.playSound(this.sounds.dragonRoarSound); 
  },
  playLevelComplete() { 
    this.playSound(this.sounds.levelCompleteSound); 
  },
  playTimeWarning() { 
    this.playSound(this.sounds.timeWarningSound); 
  },
  playTimeUp() { 
    this.playSound(this.sounds.timeUpSound); 
  },
  
  // Sonidos específicos de cartas
  playEye() { 
    this.playSound(this.sounds.eyeSound); 
  },
  playSword() { 
    this.playSound(this.sounds.swordSound); 
  },
  playShield() { 
    this.playSound(this.sounds.shieldSound); 
  },
  playCastle() { 
    this.playSound(this.sounds.castleSound); 
  },
  playDragon() { 
    this.playSound(this.sounds.dragonSound); 
  },
  playCrown() { 
    this.playSound(this.sounds.crownSound); 
  },
  
  // Nuevos sonidos
  playErrorMismatch() { 
    this.playSound(this.sounds.errorMismatchSound); 
  },
  playLevelStart() { 
    this.playSound(this.sounds.levelStartSound); 
  },
  playRestart() { 
    this.playSound(this.sounds.restartSound); 
  },
  playMenuBack() { 
    this.playSound(this.sounds.menuBackSound); 
  }
};

// Símbolos Dark Fantasy (6 pares = 12 cartas)
const simbolos = [
  '👁️', '⚔️', '🛡️', '🏰', '🐉', '👑',
  '👁️', '⚔️', '🛡️', '🏰', '🐉', '👑'
];

// Mapeo de símbolos a sonidos específicos
const sonidosCartas = {
  '👁️': () => SoundSystem.playEye(),
  '⚔️': () => SoundSystem.playSword(),
  '🛡️': () => SoundSystem.playShield(),
  '🏰': () => SoundSystem.playCastle(),
  '🐉': () => SoundSystem.playDragon(),
  '👑': () => SoundSystem.playCrown()
};

// Efectos especiales para cada símbolo
const efectosSimbolos = {
  '👁️': function(carta1, carta2) {
    SoundSystem.playEye();
    aplicarEfectoOjo(carta1, carta2);
  },
  '⚔️': function(carta1, carta2) {
    SoundSystem.playSword();
    aplicarEfectoEspada(carta1, carta2);
  },
  '🛡️': function(carta1, carta2) {
    SoundSystem.playShield();
    aplicarEfectoEscudo(carta1, carta2);
  },
  '🏰': function(carta1, carta2) {
    SoundSystem.playCastle();
    aplicarEfectoCastillo(carta1, carta2);
  },
  '🐉': function(carta1, carta2) {
    SoundSystem.playDragon();
    aplicarEfectoDragon(carta1, carta2);
  },
  '👑': function(carta1, carta2) {
    SoundSystem.playCrown();
    aplicarEfectoCorona(carta1, carta2);
  }
};

// Funciones globales para HTML
function playHoverSound() {
  SoundSystem.playHover();
}

function playClickSound() {
  SoundSystem.playClick();
}

// Mezclar array (Fisher-Yates shuffle)
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
    card.dataset.simbolo = simbolo;
    
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
  if (!puedeVoltear || card.classList.contains('flipped') || card.classList.contains('encontrada')) {
    return;
  }
  
  // Reproducir sonido de voltear carta
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

// Verificar si las cartas forman un par
function verificarPar() {
  const [carta1, carta2] = cartasVolteadas;
  
  if (carta1.simbolo === carta2.simbolo) {
    // 🎉 PAR ENCONTRADO - ÉXITO
    SoundSystem.playCardMatch();
    
    // Aplicar efecto especial con sonido único
    if (efectosSimbolos[carta1.simbolo]) {
      efectosSimbolos[carta1.simbolo](carta1.card, carta2.card);
    }
    
    // Marcar como encontradas (se quedarán estáticas mostrando la imagen)
    carta1.card.classList.add('encontrada');
    carta2.card.classList.add('encontrada');
    
    // Asegurar que las cartas encontradas se mantengan visibles
    carta1.card.style.pointerEvents = 'none';
    carta2.card.style.pointerEvents = 'none';
    
    paresEncontrados++;
    paresSpan.textContent = `PAREJAS: ${paresEncontrados}/${totalPares}`;
    
    cartasVolteadas = [];
    puedeVoltear = true;
    
    // Verificar victoria
    if (paresEncontrados === totalPares) {
      clearInterval(intervalo);
      SoundSystem.playLevelComplete();
      SoundSystem.playDragonRoar();
      
      // Guardar progreso en localStorage
      localStorage.setItem('victoryNivel', `Nivel ${nivel} - SOMBRAS ANCESTRALES`);
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
  } else {
    // ❌ NO COINCIDEN - FALLO
    SoundSystem.playErrorMismatch();
    
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

// EFECTOS ESPECIALES VISUALES
function aplicarEfectoDragon(carta1, carta2) {
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
  const polvoEffect = document.createElement('div');
  polvoEffect.style.cssText = `
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
  document.body.appendChild(polvoEffect);
  setTimeout(() => polvoEffect.remove(), 700);
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

// Temporizador principal
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
      
      // Advertencias de tiempo
      if (tiempo === 10) {
        SoundSystem.playTimeWarning();
        tiempoSpan.style.color = '#ff4444';
        tiempoSpan.style.animation = 'pulse 1s infinite';
      } else if (tiempo <= 30 && tiempo > 10) {
        tiempoSpan.style.color = '#ffaa00';
      }
    } else {
      // GAME OVER
      clearInterval(intervalo);
      SoundSystem.playTimeUp();
      
      localStorage.setItem('gameOverNivel', `Nivel ${nivel} - SOMBRAS ANCESTRALES`);
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
  
  tiempo = 60;
  paresEncontrados = 0;
  cartasVolteadas = [];
  puedeVoltear = true;
  
  tiempoSpan.textContent = `TIEMPO: ${tiempo}`;
  tiempoSpan.style.color = '#e0d3b8';
  tiempoSpan.style.animation = '';
  paresSpan.textContent = `PAREJAS: ${paresEncontrados}/${totalPares}`;
  
  crearTablero();
  iniciarTemporizador();
}

// Volver al menú principal
function volver() {
  SoundSystem.playMenuBack();
  SoundSystem.playClick();
  
  clearInterval(intervalo);
  setTimeout(() => {
    window.location.href = "niveles.html";
  }, 300);
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
  `;
  document.head.appendChild(style);
}

// Inicializar juego completo
function iniciarJuego() {
  injectAnimations();
  SoundSystem.init();
  
  // Esperar un momento y reproducir sonido de inicio
  setTimeout(() => {
    SoundSystem.playLevelStart();
  }, 500);
  
  nivelSpan.textContent = "NIVEL: 1 - SOMBRAS ANCESTRALES";
  paresSpan.textContent = `PAREJAS: ${paresEncontrados}/${totalPares}`;
  crearTablero();
  iniciarTemporizador();
  
  // Agregar event listeners para los botones
  const botones = document.querySelectorAll('.btn');
  
  botones.forEach(boton => {
    // Sonido al hacer hover
    boton.addEventListener('mouseenter', function() {
      SoundSystem.playHover();
    });
    
    // Sonido al hacer click (ya tiene onclick, pero por si acaso)
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