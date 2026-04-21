/* ============================================================
   JFIT — perfil.js
   Lógica visual de la pantalla de perfil
   (Solo visual — sin conexión a backend todavía)
   ============================================================ */

// ── Datos del perfil (localStorage) ──
let datosPerfil = JSON.parse(localStorage.getItem('jfit_perfil') || '{}');

const PERFIL_POR_DEFECTO = {
  nombreUsuario: 'Administrador',
  email:         'admin@jfit.com',
};

function obtenerPerfil() {
  return Object.assign({}, PERFIL_POR_DEFECTO, datosPerfil);
}

function guardarPerfil(datos) {
  datosPerfil = datos;
  localStorage.setItem('jfit_perfil', JSON.stringify(datos));
}

// ── Inicializar vista ──
function inicializarPerfil() {
  const perfil = obtenerPerfil();

  // Avatar (inicial del nombre)
  const inicial = perfil.nombreUsuario.charAt(0).toUpperCase();
  document.getElementById('avatar-perfil').textContent       = inicial;

  // Encabezado
  document.getElementById('perfil-nombre-display').textContent = perfil.nombreUsuario;
  document.getElementById('perfil-email-display').textContent  = perfil.email;

  // Datos en la tarjeta
  document.getElementById('perfil-dato-usuario').textContent = perfil.nombreUsuario;
  document.getElementById('perfil-dato-email').textContent   = perfil.email;

  // También la sidebar
  const sidebarNombre = document.querySelector('.sidebar-usuario-nombre');
  if (sidebarNombre) sidebarNombre.textContent = perfil.nombreUsuario;

  // Input del modal de nombre
  const inputNombre = document.getElementById('nuevo-nombre-usuario');
  if (inputNombre) inputNombre.value = perfil.nombreUsuario;

  // Input del modal de email
  const inputEmail = document.getElementById('nuevo-email');
  if (inputEmail) inputEmail.value = perfil.email;
}

// ════════════════════════════════════════
// MODAL: Cambiar nombre de usuario
// ════════════════════════════════════════
function abrirModalCambiarDatos() {
  const perfil = obtenerPerfil();
  document.getElementById('nuevo-nombre-usuario').value = perfil.nombreUsuario;
  document.getElementById('modal-cambiar-datos').classList.add('abierto');
}

function cerrarModalCambiarDatos() {
  document.getElementById('modal-cambiar-datos').classList.remove('abierto');
}

function guardarNombreUsuario() {
  const nuevoNombre = document.getElementById('nuevo-nombre-usuario').value.trim();
  if (!nuevoNombre) { mostrarToast('El nombre no puede estar vacío'); return; }

  const perfil = obtenerPerfil();
  perfil.nombreUsuario = nuevoNombre;
  guardarPerfil(perfil);
  cerrarModalCambiarDatos();
  inicializarPerfil();
  mostrarToast('✓ Nombre actualizado correctamente');
}

// ════════════════════════════════════════
// MODAL: Cambiar correo electrónico
// ════════════════════════════════════════
function abrirModalCambiarEmail() {
  const perfil = obtenerPerfil();
  document.getElementById('nuevo-email').value   = perfil.email;
  document.getElementById('confirmar-email').value = '';
  document.getElementById('modal-cambiar-email').classList.add('abierto');
}

function cerrarModalCambiarEmail() {
  document.getElementById('modal-cambiar-email').classList.remove('abierto');
}

function guardarEmail() {
  const nuevoEmail    = document.getElementById('nuevo-email').value.trim();
  const confirmarEmail = document.getElementById('confirmar-email').value.trim();

  if (!nuevoEmail) { mostrarToast('Introduce un correo electrónico'); return; }
  if (nuevoEmail !== confirmarEmail) { mostrarToast('Los correos no coinciden'); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nuevoEmail)) { mostrarToast('El formato del correo no es válido'); return; }

  const perfil = obtenerPerfil();
  perfil.email = nuevoEmail;
  guardarPerfil(perfil);
  cerrarModalCambiarEmail();
  inicializarPerfil();
  mostrarToast('✓ Correo actualizado (pendiente de verificación)');
}

// ════════════════════════════════════════
// MODAL: Cambiar contraseña
// ════════════════════════════════════════
function abrirModalCambiarContrasena() {
  ['contrasena-actual', 'nueva-contrasena', 'confirmar-contrasena']
    .forEach(id => { document.getElementById(id).value = ''; });
  document.getElementById('modal-cambiar-contrasena').classList.add('abierto');
}

function cerrarModalCambiarContrasena() {
  document.getElementById('modal-cambiar-contrasena').classList.remove('abierto');
}

function guardarContrasena() {
  const actual    = document.getElementById('contrasena-actual').value;
  const nueva     = document.getElementById('nueva-contrasena').value;
  const confirmar = document.getElementById('confirmar-contrasena').value;

  if (!actual)    { mostrarToast('Introduce tu contraseña actual'); return; }
  if (!nueva)     { mostrarToast('Introduce la nueva contraseña'); return; }
  if (nueva.length < 8) { mostrarToast('La contraseña debe tener al menos 8 caracteres'); return; }
  if (nueva !== confirmar) { mostrarToast('Las contraseñas no coinciden'); return; }

  cerrarModalCambiarContrasena();
  mostrarToast('✓ Contraseña actualizada correctamente');
}

// ════════════════════════════════════════
// MODAL: Cerrar sesión
// ════════════════════════════════════════
function abrirModalCerrarSesion() {
  document.getElementById('modal-cerrar-sesion').classList.add('abierto');
}

function cerrarModalCerrarSesion() {
  document.getElementById('modal-cerrar-sesion').classList.remove('abierto');
}

function cerrarSesion() {
  // En producción aquí destruiría la sesión PHP
  cerrarModalCerrarSesion();
  mostrarToast('Sesión cerrada. Redirigiendo...');
  setTimeout(() => {
    // location.href = 'login.html';  // activar cuando exista login
    mostrarToast('(Login no implementado aún)');
  }, 1500);
}

// ── Toast ──
function mostrarToast(mensaje) {
  const toast = document.getElementById('notificacion');
  toast.textContent = mensaje;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 2800);
}

// ── Inicializar ──
inicializarPerfil();
