let tiempo = 60; // segundos iniciales
let nivel = 1;

const tiempoSpan = document.getElementById("tiempo");
const nivelSpan = document.getElementById("nivel");

// Contador regresivo
const intervalo = setInterval(() => {
  if (tiempo > 0) {
    tiempo--;
    tiempoSpan.textContent = "TIEMPO: " + tiempo;
  } else {
    clearInterval(intervalo);
    alert("¡Tiempo agotado! Pasas al siguiente nivel.");
    // Aquí puedes redirigir al nivel 2
    // window.location.href = "nivel2.html";
  }
}, 1000);

// Mostrar nivel actual
nivelSpan.textContent = "NIVEL: " + nivel;
