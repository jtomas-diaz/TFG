/* ============================================================
   JFIT — sidebar.js
   Control del menú lateral responsivo
   ============================================================ */

const barraLateral  = document.getElementById('barra-lateral');
const overlayMovil  = document.getElementById('sidebar-overlay');

function abrirSidebar() {
  barraLateral.classList.add('abierta');
  overlayMovil.classList.add('visible');
  document.body.style.overflow = 'hidden';
}

function cerrarSidebar() {
  barraLateral.classList.remove('abierta');
  overlayMovil.classList.remove('visible');
  document.body.style.overflow = '';
}

// Cerrar al hacer click en el overlay
if (overlayMovil) {
  overlayMovil.addEventListener('click', cerrarSidebar);
}

// Cerrar sidebar al redimensionar a pantalla grande
window.addEventListener('resize', () => {
  if (window.innerWidth > 600) {
    cerrarSidebar();
    document.body.style.overflow = '';
  }
});
