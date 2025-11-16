// Reproducir sonido de Victoria al cargar
document.addEventListener('DOMContentLoaded', function() {
  const victorySound = document.getElementById('victorySound');
  if (victorySound) {
    victorySound.volume = 0.7;
    victorySound.play().catch(e => console.log('Error reproduciendo sonido victoria'));
  }
  
  // Mostrar estadísticas desde localStorage
  mostrarEstadisticas();
});

function mostrarEstadisticas() {
  const statsDiv = document.getElementById('stats');
  const victoryMessage = document.getElementById('victoryMessage');
  const siguienteBtn = document.getElementById('siguienteBtn');
  
  // Obtener datos del nivel desde localStorage
  const nivel = localStorage.getItem('victoryNivel') || 'Desconocido';
  const nivelNumero = localStorage.getItem('victoryNivelNumero') || '1';
  const paresEncontrados = localStorage.getItem('victoryPares') || '0';
  const totalPares = localStorage.getItem('victoryTotalPares') || '?';
  const tiempoRestante = localStorage.getItem('victoryTiempo') || '0';
  const puntuacion = localStorage.getItem('victoryPuntuacion') || '0';
  const combo = localStorage.getItem('victoryCombo') || '0';
  
  victoryMessage.textContent = `¡Has conquistado el ${nivel}!`;
  
  let statsHTML = `
    <div class="stat-item">Nivel completado: <span class="stat-value">${nivel}</span></div>
    <div class="stat-item">Parejas encontradas: <span class="stat-value">${paresEncontrados}/${totalPares}</span></div>
    <div class="stat-item">Tiempo restante: <span class="stat-value">${tiempoRestante} segundos</span></div>
  `;
  
  if (puntuacion !== '0') {
    statsHTML += `<div class="stat-item">Puntuación final: <span class="stat-value">${puntuacion}</span></div>`;
  }
  
  if (combo !== '0') {
    statsHTML += `<div class="stat-item">Combo máximo: <span class="stat-value">${combo}x</span></div>`;
  }
  
  statsDiv.innerHTML = statsHTML;
  
  // Ocultar botón "Siguiente Nivel" si es el último nivel
  if (parseInt(nivelNumero) >= 4) {
    siguienteBtn.style.display = 'none';
  }
}

function siguienteNivel() {
  const nivelNumero = parseInt(localStorage.getItem('victoryNivelNumero') || '1');
  const siguienteNivel = nivelNumero + 1;
  
  if (siguienteNivel <= 4) {
    window.location.href = `nivel${siguienteNivel}.html`;
  } else {
    volverAlMenu();
  }
}

function reintentar() {
  const nivelNumero = localStorage.getItem('victoryNivelNumero') || '1';
  window.location.href = `nivel${nivelNumero}.html`;
}

function volverAlMenu() {
  window.location.href = "niveles.html";
}