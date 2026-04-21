/* ============================================================
   JFIT — lista-clientes.js
   Lógica de la pantalla de gestión de clientes
   ============================================================ */

// ── Estado global ──
let listaClientes   = JSON.parse(localStorage.getItem('jfit_clientes') || '[]');
let menuAbiertoId   = null;
let idClienteEliminar = null;

// ── Guardar en localStorage ──
function guardarClientes() {
  localStorage.setItem('jfit_clientes', JSON.stringify(listaClientes));
}

// ── Renderizar la lista de clientes ──
function renderizarClientes(listaMostrar) {
  const datos = listaMostrar || listaClientes;

  // Estadísticas
  document.getElementById('total-clientes').textContent    = listaClientes.length;
  document.getElementById('clientes-activos').textContent  = listaClientes.filter(c => c.estado === 'activo').length;
  document.getElementById('clientes-inactivos').textContent = listaClientes.filter(c => c.estado !== 'activo').length;

  const contenedor = document.getElementById('lista-clientes');

  if (!datos.length) {
    contenedor.innerHTML = `
      <div class="estado-vacio">
        <div class="estado-vacio-icono">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#ECA72C" stroke-width="1.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <line x1="19" y1="8" x2="19" y2="14"/>
            <line x1="22" y1="11" x2="16" y2="11"/>
          </svg>
        </div>
        <h3>Sin clientes aún</h3>
        <p>Pulsa "Añadir" para registrar tu primer cliente</p>
      </div>`;
    return;
  }

  contenedor.innerHTML = datos.map((cliente, indice) => `
    <div class="tarjeta-cliente" style="animation-delay:${indice * 0.05}s"
         onclick="irAEntrenamiento(${cliente.id})">

      <div class="avatar-usuario avatar-cliente">
        ${cliente.nombre.charAt(0).toUpperCase()}
      </div>

      <div class="info-cliente">
        <div class="nombre-cliente">${cliente.nombre}</div>
        <div class="email-cliente">${cliente.email}</div>
      </div>

      <span class="badge-estado ${cliente.estado === 'activo' ? 'badge-activo' : 'badge-inactivo'}">
        ${cliente.estado || 'inactivo'}
      </span>

      <button class="boton-opciones"
              onclick="event.stopPropagation(); toggleMenu(${cliente.id})">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5"  r="1.5"/>
          <circle cx="12" cy="12" r="1.5"/>
          <circle cx="12" cy="19" r="1.5"/>
        </svg>

        <div class="menu-opciones ${menuAbiertoId === cliente.id ? 'abierto' : ''}"
             id="menu-${cliente.id}">

          <div class="opcion-menu" onclick="event.stopPropagation(); irAEntrenamiento(${cliente.id})">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="3" width="20" height="18" rx="3"/>
              <path d="M6.5 7h11M6.5 12h8"/>
            </svg>
            Ver entrenamiento
          </div>

          <div class="opcion-menu" onclick="event.stopPropagation(); irAChat(${cliente.id})">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Enviar mensaje
          </div>

          <div class="opcion-menu peligro"
               onclick="event.stopPropagation(); abrirModalEliminar(${cliente.id})">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14H6L5 6"/>
              <path d="M9 6V4h6v2"/>
            </svg>
            Eliminar
          </div>
        </div>
      </button>
    </div>`).join('');
}

// ── Filtrar por búsqueda ──
function filtrarClientes() {
  const busqueda = document.getElementById('buscador-clientes').value.toLowerCase();
  renderizarClientes(
    listaClientes.filter(c =>
      c.nombre.toLowerCase().includes(busqueda) ||
      c.email.toLowerCase().includes(busqueda)
    )
  );
}

// ── Abrir/cerrar menú de tres puntos ──
function toggleMenu(id) {
  menuAbiertoId = (menuAbiertoId === id) ? null : id;
  renderizarClientes();
}

// Cerrar menú al hacer click fuera
document.addEventListener('click', () => {
  if (menuAbiertoId !== null) {
    menuAbiertoId = null;
    renderizarClientes();
  }
});

// ── Modal de añadir cliente ──
function abrirModalAnadir() {
  document.getElementById('modal-anadir').classList.add('abierto');
}

function cerrarModalAnadir() {
  document.getElementById('modal-anadir').classList.remove('abierto');
  document.getElementById('input-nombre').value  = '';
  document.getElementById('input-email').value   = '';
  document.getElementById('input-estado').value  = '';
}

function anadirCliente() {
  const nombre = document.getElementById('input-nombre').value.trim();
  const email  = document.getElementById('input-email').value.trim();
  const estado = document.getElementById('input-estado').value.trim() || 'activo';

  if (!nombre || !email) {
    mostrarToast('Rellena nombre y correo');
    return;
  }
  if (listaClientes.find(c => c.email === email)) {
    mostrarToast('Ese correo ya existe');
    return;
  }

  listaClientes.push({ id: Date.now(), nombre, email, estado });
  guardarClientes();
  cerrarModalAnadir();
  renderizarClientes();
  mostrarToast(`✓ ${nombre} añadido`);
}

// ── Modal de eliminar cliente ──
function abrirModalEliminar(id) {
  menuAbiertoId    = null;
  idClienteEliminar = id;
  const cliente    = listaClientes.find(c => c.id === id);

  document.getElementById('texto-confirmar-eliminar').textContent =
    `¿Seguro que quieres eliminar a "${cliente.nombre}"? Esta acción no se puede deshacer.`;

  document.getElementById('modal-eliminar').classList.add('abierto');
}

function cerrarModalEliminar() {
  document.getElementById('modal-eliminar').classList.remove('abierto');
  idClienteEliminar = null;
}

function confirmarEliminar() {
  listaClientes = listaClientes.filter(c => c.id !== idClienteEliminar);
  guardarClientes();
  cerrarModalEliminar();
  renderizarClientes();
  mostrarToast('Cliente eliminado');
}

// ── Navegación ──
function irAEntrenamiento(id) {
  localStorage.setItem('jfit_cliente_seleccionado', id);
  location.href = 'entrenamiento-cliente.html?directo=1';
}

function irAChat(id) {
  localStorage.setItem('jfit_chat_cliente', id);
  location.href = 'chat-con-clientes.html';
}

// ── Toast de notificación ──
function mostrarToast(mensaje) {
  const toast = document.getElementById('notificacion');
  toast.textContent = mensaje;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 2500);
}

// ── Inicializar ──
renderizarClientes();
