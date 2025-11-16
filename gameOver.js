// Reproducir sonido de Game Over al cargar
document.addEventListener('DOMContentLoaded', function() {
  const gameOverSound = document.getElementById('gameOverSound');
  if (gameOverSound) {
    gameOverSound.volume = 0.7;
    gameOverSound.play().catch(e => console.log('Error reproduciendo sonido game over'));
  }
  
  // Mostrar estadísticas desde localStorage
  mostrarEstadisticas();
});

function mostrarEstadisticas() {
  const statsDiv = document.getElementById('stats');
  const gameOverMessage = document.getElementById('gameOverMessage');
  
  // Obtener datos del nivel desde localStorage
  const nivel = localStorage.getItem('gameOverNivel') || 'Desconocido';
  const paresEncontrados = localStorage.getItem('gameOverPares') || '0';
  const totalPares = localStorage.getItem('gameOverTotalPares') || '?';
  const tiempoRestante = localStorage.getItem('gameOverTiempo') || '0';
  
  gameOverMessage.textContent = `El tiempo se agotó en el ${nivel}...`;
  
  statsDiv.innerHTML = `
    <div class="stat-item">Nivel: <span class="stat-value">${nivel}</span></div>
    <div class="stat-item">Parejas encontradas: <span class="stat-value">${paresEncontrados}/${totalPares}</span></div>
    <div class="stat-item">Tiempo restante: <span class="stat-value">${tiempoRestante} segundos</span></div>
  `;
}

function reintentar() {
  const nivel = localStorage.getItem('niveles') || 'niveles';
  window.location.href = `${nivel}.html`;
}

function volverAlMenu() {
  window.location.href = "niveles.html";
}