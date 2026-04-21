/* ============================================================
   JFIT — chat.js
   Lógica del chat en tiempo real entre entrenador y clientes
   ============================================================ */

// ── Estado global ──
const todosLosClientes   = JSON.parse(localStorage.getItem('jfit_clientes') || '[]');
let idClienteActivo      = parseInt(localStorage.getItem('jfit_chat_cliente')) || null;
let historialConversaciones = JSON.parse(localStorage.getItem('jfit_chats') || '{}');

// Respuestas automáticas simuladas del cliente
const RESPUESTAS_SIMULADAS = [
  '¡Perfecto, muchas gracias!',
  'Entendido, lo tendré en cuenta.',
  '¿Cuándo empezamos?',
  'Genial, me parece bien.',
  '¿Puedes explicarme un poco más?',
  'Vale, lo haré así.',
  '¡Gracias por la info!',
  'Perfecto, de acuerdo.',
];

// ── Guardar historial ──
function guardarHistorial() {
  localStorage.setItem('jfit_chats', JSON.stringify(historialConversaciones));
}

// ── Obtener mensajes de un cliente ──
function obtenerMensajes(idCliente) {
  if (!historialConversaciones[idCliente]) {
    historialConversaciones[idCliente] = [];
  }
  return historialConversaciones[idCliente];
}

// ── Formatear hora ──
function formatearHora(timestamp) {
  return new Date(timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

// ── Formatear fecha ──
function formatearFecha(timestamp) {
  const fecha  = new Date(timestamp);
  const hoy    = new Date();
  const diff   = hoy - fecha;
  if (diff < 86400000 && fecha.getDate() === hoy.getDate()) return 'Hoy';
  if (diff < 172800000) return 'Ayer';
  return fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

// ── Escapar HTML para evitar inyecciones ──
function escaparHtml(texto) {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');
}

// ── Renderizar lista de conversaciones ──
function renderizarConversaciones(textoBusqueda) {
  const busqueda   = (textoBusqueda || '').toLowerCase();
  const contenedor = document.getElementById('lista-conversaciones');
  const filtrados  = todosLosClientes.filter(c =>
    c.nombre.toLowerCase().includes(busqueda) ||
    c.email.toLowerCase().includes(busqueda)
  );

  if (!filtrados.length) {
    contenedor.innerHTML = `
      <div class="panel-vacio">
        ${todosLosClientes.length === 0
          ? 'No tienes clientes aún.<br>Añade clientes desde la lista.'
          : 'Sin resultados.'}
      </div>`;
    return;
  }

  contenedor.innerHTML = filtrados.map(cliente => {
    const mensajes   = obtenerMensajes(cliente.id);
    const ultimo     = mensajes[mensajes.length - 1];
    const noLeidos   = mensajes.filter(m => m.origen === 'cliente' && !m.leido).length;

    return `
      <div class="item-conversacion ${idClienteActivo === cliente.id ? 'activo' : ''}"
           onclick="abrirChat(${cliente.id})">

        <div class="avatar-usuario avatar-conversacion">
          ${cliente.nombre.charAt(0).toUpperCase()}
          <div class="punto-en-linea"></div>
        </div>

        <div class="info-conversacion">
          <div class="nombre-conversacion">${cliente.nombre}</div>
          <div class="preview-mensaje">
            ${ultimo
              ? (ultimo.origen === 'entrenador' ? 'Tú: ' : '') + ultimo.texto
              : 'Sin mensajes aún'}
          </div>
        </div>

        <div class="meta-conversacion">
          <div class="hora-conversacion">${ultimo ? formatearHora(ultimo.timestamp) : ''}</div>
          ${noLeidos > 0
            ? `<div class="badge-no-leido">${noLeidos}</div>`
            : ''}
        </div>
      </div>`;
  }).join('');
}

function filtrarConversaciones() {
  renderizarConversaciones(document.getElementById('buscador-chat').value);
}

// ── Abrir chat con un cliente ──
function abrirChat(idCliente) {
  idClienteActivo = idCliente;
  localStorage.setItem('jfit_chat_cliente', idCliente);

  const cliente = todosLosClientes.find(c => c.id === idCliente);
  if (!cliente) return;

  // Marcar mensajes del cliente como leídos
  const mensajes = obtenerMensajes(idCliente);
  mensajes.forEach(m => { if (m.origen === 'cliente') m.leido = true; });
  guardarHistorial();

  // Actualizar cabecera del chat
  document.getElementById('inicial-avatar-chat').textContent = cliente.nombre.charAt(0).toUpperCase();
  document.getElementById('nombre-chat-activo').textContent  = cliente.nombre;

  // Mostrar el área de chat
  document.getElementById('chat-vacio').style.display   = 'none';
  const chatActivo = document.getElementById('chat-activo');
  chatActivo.style.display = 'flex';

  renderizarMensajes(idCliente);
  renderizarConversaciones();

  // En móvil: deslizar al chat
  if (window.innerWidth <= 600) {
    document.getElementById('area-chat').classList.add('abierta');
  }
}

// ── Renderizar mensajes del chat activo ──
function renderizarMensajes(idCliente) {
  const mensajes  = obtenerMensajes(idCliente);
  const contenedor = document.getElementById('area-mensajes');

  if (!mensajes.length) {
    const cliente = todosLosClientes.find(c => c.id === idCliente);
    contenedor.innerHTML = `
      <div style="text-align:center;padding:36px 20px;color:var(--texto-suave);font-size:13px;line-height:1.7">
        <div style="font-family:'Cinzel',serif;font-size:14px;color:var(--dorado);margin-bottom:8px">
          Nueva conversación
        </div>
        Escribe el primer mensaje a ${cliente ? cliente.nombre : 'este cliente'}
      </div>`;
    return;
  }

  let fechaAnterior = '';
  let html = '';

  mensajes.forEach(mensaje => {
    const etiquetaFecha = formatearFecha(mensaje.timestamp);

    if (etiquetaFecha !== fechaAnterior) {
      html += `<div class="separador-fecha"><span>${etiquetaFecha}</span></div>`;
      fechaAnterior = etiquetaFecha;
    }

    const esEnviado = mensaje.origen === 'entrenador';

    html += `
      <div class="fila-mensaje ${esEnviado ? 'enviado' : 'recibido'}">
        <div class="globo-mensaje">${escaparHtml(mensaje.texto)}</div>
        <div class="hora-mensaje">
          ${formatearHora(mensaje.timestamp)}
          ${esEnviado
            ? `<span class="ticks-leido">${mensaje.leido ? '✓✓' : '✓'}</span>`
            : ''}
        </div>
      </div>`;
  });

  contenedor.innerHTML = html;
  contenedor.scrollTop = contenedor.scrollHeight;
}

// ── Enviar mensaje ──
function enviarMensaje() {
  if (!idClienteActivo) return;

  const inputEl = document.getElementById('input-mensaje');
  const texto   = inputEl.value.trim();
  if (!texto) return;

  const mensajes = obtenerMensajes(idClienteActivo);
  mensajes.push({
    origen:    'entrenador',
    texto,
    timestamp: Date.now(),
    leido:     false
  });

  guardarHistorial();
  inputEl.value = '';
  inputEl.style.height = 'auto';
  renderizarMensajes(idClienteActivo);
  renderizarConversaciones();

  // Simular respuesta del cliente
  simularRespuesta(idClienteActivo);
}

// ── Simular respuesta automática del cliente ──
function simularRespuesta(idCliente) {
  const contenedor = document.getElementById('area-mensajes');

  // Indicador de escritura
  const divEscribiendo = document.createElement('div');
  divEscribiendo.className = 'indicador-escribiendo';
  divEscribiendo.id = 'indicador-escribiendo';
  divEscribiendo.innerHTML = `
    <div class="punto-escribiendo"></div>
    <div class="punto-escribiendo"></div>
    <div class="punto-escribiendo"></div>`;
  contenedor.appendChild(divEscribiendo);
  contenedor.scrollTop = contenedor.scrollHeight;

  const demora = 1500 + Math.random() * 1000;

  setTimeout(() => {
    const indicador = document.getElementById('indicador-escribiendo');
    if (indicador) indicador.remove();

    if (idClienteActivo !== idCliente) return;

    const mensajes = obtenerMensajes(idCliente);
    const respuesta = RESPUESTAS_SIMULADAS[Math.floor(Math.random() * RESPUESTAS_SIMULADAS.length)];

    mensajes.push({
      origen:    'cliente',
      texto:     respuesta,
      timestamp: Date.now(),
      leido:     true
    });

    guardarHistorial();
    renderizarMensajes(idCliente);
    renderizarConversaciones();
  }, demora);
}

// ── Enter para enviar (Shift+Enter = salto de línea) ──
function manejarTeclaEnter(evento) {
  if (evento.key === 'Enter' && !evento.shiftKey) {
    evento.preventDefault();
    enviarMensaje();
  }
}

// ── Auto-resize del textarea ──
function ajustarAlturaInput(elemento) {
  elemento.style.height = 'auto';
  elemento.style.height = Math.min(elemento.scrollHeight, 110) + 'px';
}

// ── Volver a la lista en móvil ──
function volverALista() {
  document.getElementById('area-chat').classList.remove('abierta');
  idClienteActivo = null;
}

// ── Ir al entrenamiento del cliente ──
function irAEntrenamientoDesdeChat() {
  if (idClienteActivo) {
    localStorage.setItem('jfit_cliente_seleccionado', idClienteActivo);
    location.href = 'entrenamiento-cliente.html';
  }
}

// ── Ir a la lista de clientes ──
function irAListaDesdeChat() {
  if (idClienteActivo) {
    localStorage.setItem('jfit_cliente_seleccionado', idClienteActivo);
    location.href = 'lista-clientes.html';
  }
}

// ── Inicializar ──
renderizarConversaciones();
if (idClienteActivo && todosLosClientes.find(c => c.id === idClienteActivo)) {
  abrirChat(idClienteActivo);
}
