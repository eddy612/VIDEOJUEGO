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
  
  playSuccess() {
    this.createSound(300, 600, 'sine', 0.3, 0.3);
  },
  
  playError() {
    this.createSound(400, 200, 'sawtooth', 0.4, 0.2);
  },
  
  playCardFlip() {
    this.createSound(200, 300, 'sine', 0.2, 0.15);
  },
  
  playCardMatch() {
    // Sonido ascendente para acierto
    this.createSound(300, 800, 'sine', 0.4, 0.3);
  },
  
  playCardMismatch() {
    // Sonido descendente para error
    this.createSound(500, 200, 'sawtooth', 0.3, 0.2);
  }
};

function playHoverSound() {
  SoundSystem.playHover();
}

function playClickSound() {
  SoundSystem.playClick();
}

function nivel(n) {
  playClickSound();
  
  // Efecto de transición
  document.body.style.opacity = '0.7';
  
  setTimeout(() => {
    switch(n) {
      case 1:
        window.location.href = "nivel1.html";
        break;
      case 2:
        window.location.href = "nivel2.html";
        break;
      case 3:
        window.location.href = "nivel3.html";
        break;
      case 4:
        SoundSystem.playError();
        setTimeout(() => {
          alert("🔮 Este ritual aún duerme en las tinieblas...\n\nEl Trono de Sombras aguarda a que los niveles anteriores sean conquistados.");
        }, 200);
        document.body.style.opacity = '1';
        break;
      default:
        window.location.href = "nivel1.html";
    }
  }, 300);
}

function volver() {
  playClickSound();
  document.body.style.opacity = '0.7';
  setTimeout(() => {
    window.location.href = "index.html";
  }, 300);
}