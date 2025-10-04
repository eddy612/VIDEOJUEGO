// Sistema de sonidos
const SoundSystem = {
  sounds: {
    hover: null,
    click: null,
    background: null
  },
  
  init() {
    // Crear sonidos proceduralmente (sin archivos externos)
    this.sounds.hover = this.createSound(200, 400, 'sawtooth', 0.1, 0.1);
    this.sounds.click = this.createSound(300, 100, 'square', 0.2, 0.1);
    this.sounds.background = this.createBackgroundMusic();
  },
  
  createSound(freqStart, freqEnd, type, duration, volume) {
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
  },
  
  createBackgroundMusic() {
    // Música ambiental simple
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    return audioContext;
  },
  
  playHover() {
    this.createSound(200, 400, 'sine', 0.1, 0.1);
  },
  
  playClick() {
    this.createSound(400, 200, 'square', 0.2, 0.2);
  },
  
  playSuccess() {
    this.createSound(300, 600, 'sine', 0.3, 0.3);
  },
  
  playError() {
    this.createSound(400, 200, 'sawtooth', 0.4, 0.2);
  }
};

// Inicializar sistema de sonido al cargar la página
document.addEventListener('DOMContentLoaded', function() {
  SoundSystem.init();
});

function playHoverSound() {
  SoundSystem.playHover();
}

function playClickSound() {
  SoundSystem.playClick();
}

function jugar() {
  playClickSound();
  setTimeout(() => {
    window.location.href = "niveles.html";
  }, 300);
}

function opciones() {
  playClickSound();
  setTimeout(() => {
    alert("📜 Las Crónicas de los Guardianes...\n\nPróximamente podrás consultar los secretos y lore del mundo.");
  }, 200);
}

function salir() {
  playClickSound();
  setTimeout(() => {
    if (confirm("¿Estás seguro de que deseas abandonar el santuario?\n\nLos misterios esperarán tu regreso...")) {
      window.close();
    }
  }, 200);
}