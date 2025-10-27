// Sistema de sonidos con archivos de audio reales
const SoundSystem = {
  sounds: {
    hover: null,
    click: null,
    background: null,
    musicActive: true
  },
  
  init() {
    // Cargar elementos de audio
    this.sounds.hover = document.getElementById('hoverSound');
    this.sounds.click = document.getElementById('clickSound');
    this.sounds.background = document.getElementById('backgroundMusic');
    
    // Configurar volumen
    if (this.sounds.background) {
      this.sounds.background.volume = 0.3;
      this.startBackgroundMusic();
    }
  },
  
  startBackgroundMusic() {
    if (!this.sounds.musicActive || !this.sounds.background) return;
    
    try {
      // Reproducir música de fondo
      this.sounds.background.play().catch(error => {
        console.log('Error reproduciendo música:', error);
        // En algunos navegadores necesitas interacción del usuario primero
      });
    } catch (error) {
      console.log('Error con música de fondo:', error);
    }
  },
  
  playHover() {
    if (this.sounds.hover) {
      this.sounds.hover.currentTime = 0;
      this.sounds.hover.play().catch(e => console.log('Error sonido hover'));
    }
  },
  
  playClick() {
    if (this.sounds.click) {
      this.sounds.click.currentTime = 0;
      this.sounds.click.play().catch(e => console.log('Error sonido click'));
    }
  },
  
  toggleMusic() {
    if (this.sounds.background) {
      if (this.sounds.musicActive) {
        this.sounds.background.pause();
        this.sounds.musicActive = false;
        return false;
      } else {
        this.sounds.background.play().catch(e => console.log('Error reactivando música'));
        this.sounds.musicActive = true;
        return true;
      }
    }
    return this.sounds.musicActive;
  },
  
  stopBackgroundMusic() {
    if (this.sounds.background) {
      this.sounds.background.pause();
      this.sounds.background.currentTime = 0;
    }
  }
};

// Inicializar sistema de sonido al cargar la página
document.addEventListener('DOMContentLoaded', function() {
  SoundSystem.init();
  
  // Agregar control de música con tecla M
  document.addEventListener('keydown', function(e) {
    if (e.key === 'm' || e.key === 'M') {
      const musicActive = SoundSystem.toggleMusic();
      const indicator = document.querySelector('.music-indicator p');
      if (indicator) {
        indicator.textContent = musicActive ? 
          '🎵 Música épica activa | Presiona "M" para silenciar' : 
          '🔇 Música silenciada | Presiona "M" para activar';
      }
    }
  });
  
  // Permitir que la música empiece con interacción del usuario
  document.addEventListener('click', function firstClick() {
    if (SoundSystem.sounds.background && SoundSystem.sounds.musicActive) {
      SoundSystem.sounds.background.play().catch(e => {
        console.log('Esperando interacción del usuario para música...');
      });
    }
    document.removeEventListener('click', firstClick);
  });
});

function playHoverSound() {
  SoundSystem.playHover();
}

function playClickSound() {
  SoundSystem.playClick();
}

function jugar() {
  playClickSound();
  // Detener música al cambiar de página
  SoundSystem.stopBackgroundMusic();
  setTimeout(() => {
    window.location.href = "niveles.html";
  }, 300);
}

function opciones() {
  playClickSound();
  setTimeout(() => {
    alert("📜 Las Crónicas de los Guardianes...\n\nPróximamente podrás consultar los secretos y lore del mundo.\n\nAquí yacen las historias de:\n• Los Dragones Ancestrales\n• Los Guardianes Olvidados\n• Los Rituales Prohibidos\n• Las Sombras Eternas");
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