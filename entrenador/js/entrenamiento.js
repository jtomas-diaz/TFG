/* ============================================================
   JFIT — entrenamiento.js
   Vista 1: selección de cliente
   Vista 2: plan de entrenamiento del cliente seleccionado
   ============================================================ */

// ── Base de datos de ejercicios ──
const BASE_EJERCICIOS = [
  { id:  1, nombre: 'Press de banca plano',      musculo: 'Pecho',    claveMusculo: 'pecho'   },
  { id:  2, nombre: 'Press de banca inclinado',  musculo: 'Pecho',    claveMusculo: 'pecho'   },
  { id:  3, nombre: 'Aperturas con mancuernas',  musculo: 'Pecho',    claveMusculo: 'pecho'   },
  { id:  4, nombre: 'Fondos en paralelas',        musculo: 'Pecho',    claveMusculo: 'pecho'   },
  { id:  5, nombre: 'Dominadas',                  musculo: 'Espalda',  claveMusculo: 'espalda' },
  { id:  6, nombre: 'Remo con barra',             musculo: 'Espalda',  claveMusculo: 'espalda' },
  { id:  7, nombre: 'Jalón al pecho',             musculo: 'Espalda',  claveMusculo: 'espalda' },
  { id:  8, nombre: 'Peso muerto',                musculo: 'Espalda',  claveMusculo: 'espalda' },
  { id:  9, nombre: 'Sentadilla',                 musculo: 'Piernas',  claveMusculo: 'piernas' },
  { id: 10, nombre: 'Prensa de piernas',          musculo: 'Piernas',  claveMusculo: 'piernas' },
  { id: 11, nombre: 'Extensión de cuádriceps',    musculo: 'Piernas',  claveMusculo: 'piernas' },
  { id: 12, nombre: 'Curl femoral',               musculo: 'Piernas',  claveMusculo: 'piernas' },
  { id: 13, nombre: 'Hip thrust',                 musculo: 'Glúteos',  claveMusculo: 'gluteos' },
  { id: 14, nombre: 'Patada de glúteo',           musculo: 'Glúteos',  claveMusculo: 'gluteos' },
  { id: 15, nombre: 'Press militar',              musculo: 'Hombros',  claveMusculo: 'hombros' },
  { id: 16, nombre: 'Elevaciones laterales',      musculo: 'Hombros',  claveMusculo: 'hombros' },
  { id: 17, nombre: 'Press Arnold',               musculo: 'Hombros',  claveMusculo: 'hombros' },
  { id: 18, nombre: 'Curl con barra',             musculo: 'Brazos',   claveMusculo: 'brazos'  },
  { id: 19, nombre: 'Curl martillo',              musculo: 'Brazos',   claveMusculo: 'brazos'  },
  { id: 20, nombre: 'Extensión tríceps polea',    musculo: 'Brazos',   claveMusculo: 'brazos'  },
  { id: 21, nombre: 'Crunch abdominal',           musculo: 'Abdomen',  claveMusculo: 'abdomen' },
  { id: 22, nombre: 'Plancha',                    musculo: 'Abdomen',  claveMusculo: 'abdomen' },
  { id: 23, nombre: 'Rueda abdominal',            musculo: 'Abdomen',  claveMusculo: 'abdomen' },
  { id: 24, nombre: 'Cinta de correr',            musculo: 'Cardio',   claveMusculo: 'cardio'  },
  { id: 25, nombre: 'Bicicleta estática',         musculo: 'Cardio',   claveMusculo: 'cardio'  },
  { id: 26, nombre: 'Salto a la comba',           musculo: 'Cardio',   claveMusculo: 'cardio'  },
];

// ── Estado global ──
let todosLosClientes   = JSON.parse(localStorage.getItem('jfit_clientes') || '[]');
let clienteActual      = null;
let planEntrenamiento  = [];
let diasExpandidos     = new Set();
let idDiaActual        = null;
let ejercicioSeleccionado = null;

// ── Guardar plan en localStorage ──
function guardarPlan() {
  if (!clienteActual) return;
  const clave = `jfit_entrenamiento_${clienteActual.id}`;
  localStorage.setItem(clave, JSON.stringify(planEntrenamiento));
}

// ── Cargar plan del cliente ──
function cargarPlan(idCliente) {
  const clave = `jfit_entrenamiento_${idCliente}`;
  return JSON.parse(localStorage.getItem(clave) || '[]');
}

// ── Contar ejercicios totales de un plan ──
function contarEjercicios(plan) {
  return plan.reduce((total, dia) => total + dia.ejercicios.length, 0);
}


/* ════════════════════════════════════════════════════════════
   VISTA 1 — SELECCIÓN DE CLIENTE
════════════════════════════════════════════════════════════ */

function mostrarVistaSeleccion() {
  document.getElementById('vista-seleccion').style.display = 'block';
  document.getElementById('vista-rutina').style.display   = 'none';
  document.getElementById('topbar-titulo').textContent    = 'Rutinas';
  document.getElementById('topbar-subtitulo').textContent = 'Selecciona un cliente para gestionar su plan';
  document.getElementById('topbar-derecha').innerHTML     = '';

  // Limpiar estado de rutina
  clienteActual     = null;
  planEntrenamiento = [];
  diasExpandidos    = new Set();

  renderizarGridClientes();
}

function renderizarGridClientes(listaMostrar) {
  // Recargar siempre desde localStorage para tener datos frescos
  todosLosClientes = JSON.parse(localStorage.getItem('jfit_clientes') || '[]');

  const datos      = listaMostrar || todosLosClientes;
  const contenedor = document.getElementById('grid-clientes-rutinas');

  if (!datos.length) {
    contenedor.innerHTML = `
      <div class="sin-clientes-rutinas">
        <div class="sin-clientes-rutinas-icono">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#ECA72C" stroke-width="1.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <line x1="19" y1="8" x2="19" y2="14"/>
            <line x1="22" y1="11" x2="16" y2="11"/>
          </svg>
        </div>
        <h3>Sin clientes aún</h3>
        <p>Ve a <a href="lista-clientes.html" style="color:var(--dorado)">Mis Clientes</a> para añadir tu primer cliente y luego gestiona sus rutinas aquí.</p>
      </div>`;
    return;
  }

  contenedor.innerHTML = datos.map((cliente, indice) => {
    const plan  = cargarPlan(cliente.id);
    const dias  = plan.length;
    const esActivo = cliente.estado === 'activo';

    return `
      <div class="tarjeta-cliente-rutina"
           style="animation-delay: ${indice * 0.05}s"
           onclick="abrirRutinaCliente(${cliente.id})">

        <!-- Avatar -->
        <div class="avatar-usuario avatar-rutina">
          ${cliente.nombre.charAt(0).toUpperCase()}
        </div>

        <!-- Información del cliente -->
        <div class="info-rutina">
          <div class="nombre-rutina">${cliente.nombre}</div>
          <div class="email-rutina">${cliente.email}</div>
          <span class="badge-estado-rutina ${esActivo ? 'badge-activo' : 'badge-inactivo'}">
            ${cliente.estado || 'inactivo'}
          </span>
        </div>

        <!-- Badge de días -->
        <div class="dias-rutina-badge">
          <div class="dias-rutina-numero">${dias}</div>
          <div class="dias-rutina-label">${dias === 1 ? 'día' : 'días'}</div>
        </div>

        <!-- Flecha -->
        <svg class="flecha-rutina" width="18" height="18" viewBox="0 0 24 24"
             fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"/>
        </svg>

      </div>`;
  }).join('');
}

function filtrarClientesRutinas() {
  const busqueda = document.getElementById('buscador-rutinas').value.toLowerCase();
  const filtrados = todosLosClientes.filter(c =>
    c.nombre.toLowerCase().includes(busqueda) ||
    c.email.toLowerCase().includes(busqueda)
  );
  renderizarGridClientes(filtrados);
}


/* ════════════════════════════════════════════════════════════
   VISTA 2 — RUTINA DEL CLIENTE
════════════════════════════════════════════════════════════ */

function abrirRutinaCliente(idCliente) {
  // Buscar cliente
  clienteActual = todosLosClientes.find(c => c.id === idCliente);
  if (!clienteActual) return;

  // Cargar su plan
  planEntrenamiento = cargarPlan(idCliente);
  diasExpandidos    = new Set();

  // Guardar referencia en localStorage (para links externos)
  localStorage.setItem('jfit_cliente_seleccionado', idCliente);

  // Cambiar topbar
  document.getElementById('topbar-titulo').textContent    = `Rutina de ${clienteActual.nombre}`;
  document.getElementById('topbar-subtitulo').textContent = clienteActual.email;

  // Mostrar la vista de rutina
  document.getElementById('vista-seleccion').style.display = 'none';
  document.getElementById('vista-rutina').style.display    = 'block';

  // Rellenar datos del panel del cliente
  document.getElementById('avatar-cliente-rutina').textContent  = clienteActual.nombre.charAt(0).toUpperCase();
  document.getElementById('nombre-cliente-rutina').textContent   = clienteActual.nombre;
  document.getElementById('email-cliente-rutina').textContent    = clienteActual.email;

  renderizarPlan();
}

function volverASeleccion() {
  mostrarVistaSeleccion();
  // Scroll al inicio
  window.scrollTo({ top: 0, behavior: 'smooth' });
}


/* ════════════════════════════════════════════════════════════
   RENDERIZADO DEL PLAN
════════════════════════════════════════════════════════════ */

function renderizarPlan() {
  const totalEjercicios = contarEjercicios(planEntrenamiento);

  document.getElementById('contador-dias-rutina').textContent      = planEntrenamiento.length;
  document.getElementById('contador-ejercicios-rutina').textContent = totalEjercicios;

  const contenedor = document.getElementById('lista-dias');

  if (!planEntrenamiento.length) {
    contenedor.innerHTML = `
      <div class="dias-vacios">
        <h3>Sin días añadidos</h3>
        <p>Pulsa "Añadir día" para crear el primer bloque de entrenamiento de ${clienteActual.nombre}</p>
      </div>`;
    return;
  }

  contenedor.innerHTML = planEntrenamiento.map((dia, indice) => `
    <div class="tarjeta-dia" style="animation-delay:${indice * 0.06}s">

      <!-- Cabecera del día -->
      <div class="cabecera-dia" onclick="toggleDia(${dia.id})">
        <div class="cabecera-dia-izquierda">
          <div class="numero-dia">${indice + 1}</div>
          <div>
            <div class="titulo-dia">${dia.nombre}</div>
            <div class="meta-dia">
              ${dia.diaSemana ? dia.diaSemana + ' · ' : ''}
              ${dia.ejercicios.length} ejercicio${dia.ejercicios.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
        <div class="cabecera-dia-derecha">
          <button class="boton-eliminar-dia"
                  onclick="event.stopPropagation(); eliminarDia(${dia.id})">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14H6L5 6"/>
              <path d="M9 6V4h6v2"/>
            </svg>
          </button>
          <svg class="icono-chevron ${diasExpandidos.has(dia.id) ? 'abierto' : ''}"
               width="18" height="18" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>

      <!-- Lista de ejercicios del día -->
      <div class="lista-ejercicios ${diasExpandidos.has(dia.id) ? 'abierta' : ''}">

        ${dia.ejercicios.map(ej => `
          <div class="item-ejercicio">
            <div class="punto-musculo musculo-${ej.claveMusculo}"></div>
            <div class="info-ejercicio">
              <div class="nombre-ejercicio">${ej.nombre}</div>
              <div class="detalles-ejercicio">
                ${ej.series} series · ${ej.reps} reps
                ${ej.descanso ? ' · ' + ej.descanso + 's descanso' : ''}
                ${ej.notas    ? ' · ' + ej.notas : ''}
              </div>
            </div>
            <button class="boton-quitar-ejercicio"
                    onclick="quitarEjercicio(${dia.id}, ${ej.uid})">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6"  x2="6"  y2="18"/>
                <line x1="6"  y1="6"  x2="18" y2="18"/>
              </svg>
            </button>
          </div>`).join('')}

        <button class="boton-anadir-ejercicio"
                onclick="abrirModalEjercicio(${dia.id})">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5"  x2="12" y2="19"/>
            <line x1="5"  y1="12" x2="19" y2="12"/>
          </svg>
          Añadir ejercicio
        </button>
      </div>

    </div>`).join('');
}

// ── Expandir / colapsar día ──
function toggleDia(id) {
  diasExpandidos.has(id) ? diasExpandidos.delete(id) : diasExpandidos.add(id);
  renderizarPlan();
}


/* ════════════════════════════════════════════════════════════
   MODAL: NUEVO DÍA
════════════════════════════════════════════════════════════ */

function abrirModalDia() {
  document.getElementById('modal-dia').classList.add('abierto');
}

function cerrarModalDia() {
  document.getElementById('modal-dia').classList.remove('abierto');
  document.getElementById('input-nombre-dia').value  = '';
  document.getElementById('select-dia-semana').value = '';
}

function anadirDia() {
  const nombre = document.getElementById('input-nombre-dia').value.trim();
  if (!nombre) { mostrarToast('Escribe un nombre para el día'); return; }

  const diaSemana = document.getElementById('select-dia-semana').value;
  const nuevoDia  = { id: Date.now(), nombre, diaSemana, ejercicios: [] };

  planEntrenamiento.push(nuevoDia);
  diasExpandidos.add(nuevoDia.id);
  guardarPlan();
  cerrarModalDia();
  renderizarPlan();
  mostrarToast(`✓ Día "${nombre}" añadido`);
}

function eliminarDia(id) {
  planEntrenamiento = planEntrenamiento.filter(d => d.id !== id);
  diasExpandidos.delete(id);
  guardarPlan();
  renderizarPlan();
  mostrarToast('Día eliminado');
}


/* ════════════════════════════════════════════════════════════
   MODAL: AÑADIR EJERCICIO
════════════════════════════════════════════════════════════ */

function abrirModalEjercicio(idDia) {
  idDiaActual           = idDia;
  ejercicioSeleccionado = null;

  ['buscador-ejercicios-modal', 'input-series', 'input-reps',
   'input-descanso', 'input-notas-ejercicio'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  document.getElementById('seccion-parametros').style.display = 'none';
  filtrarEjercicios();
  document.getElementById('modal-ejercicio').classList.add('abierto');
}

function cerrarModalEjercicio() {
  document.getElementById('modal-ejercicio').classList.remove('abierto');
  idDiaActual           = null;
  ejercicioSeleccionado = null;
}

function filtrarEjercicios() {
  const busqueda = document.getElementById('buscador-ejercicios-modal').value.toLowerCase();
  const filtrados = BASE_EJERCICIOS.filter(e =>
    e.nombre.toLowerCase().includes(busqueda) ||
    e.musculo.toLowerCase().includes(busqueda)
  );
  renderizarListaEjercicios(filtrados);
}

function renderizarListaEjercicios(lista) {
  const contenedor = document.getElementById('listado-bd-ejercicios');
  contenedor.innerHTML = lista.map(ej => `
    <div class="item-bd-ejercicio ${ejercicioSeleccionado && ejercicioSeleccionado.id === ej.id ? 'seleccionado' : ''}"
         onclick="seleccionarEjercicio(${ej.id})">
      <div class="punto-musculo musculo-${ej.claveMusculo}"
           style="width:10px;height:10px;border-radius:50%;flex-shrink:0"></div>
      <div style="flex:1;min-width:0">
        <div class="nombre-bd-ejercicio">${ej.nombre}</div>
        <div class="musculo-bd-ejercicio">${ej.musculo}</div>
      </div>
      ${ejercicioSeleccionado && ejercicioSeleccionado.id === ej.id
        ? '<span class="badge-seleccionado">✓ Seleccionado</span>'
        : ''}
    </div>`).join('');
}

function seleccionarEjercicio(id) {
  ejercicioSeleccionado = BASE_EJERCICIOS.find(e => e.id === id);
  document.getElementById('seccion-parametros').style.display = 'block';
  filtrarEjercicios();
}

function anadirEjercicio() {
  if (!ejercicioSeleccionado) { mostrarToast('Selecciona un ejercicio primero'); return; }

  const series   = parseInt(document.getElementById('input-series').value)   || 3;
  const reps     = parseInt(document.getElementById('input-reps').value)     || 12;
  const descanso = parseInt(document.getElementById('input-descanso').value) || 60;
  const notas    = document.getElementById('input-notas-ejercicio').value.trim();

  const dia = planEntrenamiento.find(d => d.id === idDiaActual);
  if (!dia) return;

  dia.ejercicios.push({
    uid:          Date.now(),
    id:           ejercicioSeleccionado.id,
    nombre:       ejercicioSeleccionado.nombre,
    musculo:      ejercicioSeleccionado.musculo,
    claveMusculo: ejercicioSeleccionado.claveMusculo,
    series, reps, descanso, notas
  });

  guardarPlan();
  cerrarModalEjercicio();
  renderizarPlan();
  mostrarToast(`✓ ${ejercicioSeleccionado.nombre} añadido`);
}

function quitarEjercicio(idDia, uid) {
  const dia = planEntrenamiento.find(d => d.id === idDia);
  if (!dia) return;
  dia.ejercicios = dia.ejercicios.filter(e => e.uid !== uid);
  guardarPlan();
  renderizarPlan();
  mostrarToast('Ejercicio eliminado');
}


/* ════════════════════════════════════════════════════════════
   TOAST
════════════════════════════════════════════════════════════ */

function mostrarToast(mensaje) {
  const toast = document.getElementById('notificacion');
  toast.textContent = mensaje;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 2500);
}


/* ════════════════════════════════════════════════════════════
   INICIALIZAR
   Si venimos desde lista-clientes.html con un cliente
   seleccionado, abrir directamente su rutina.
   Si no, mostrar la vista de selección.
════════════════════════════════════════════════════════════ */

(function inicializar() {
  const idGuardado = parseInt(localStorage.getItem('jfit_cliente_seleccionado'));

  // Si hay un cliente guardado Y venimos con el parámetro ?directo=1
  const params   = new URLSearchParams(window.location.search);
  const directo  = params.get('directo') === '1';

  if (directo && idGuardado && todosLosClientes.find(c => c.id === idGuardado)) {
    abrirRutinaCliente(idGuardado);
    // Limpiar el parámetro de la URL sin recargar
    history.replaceState({}, '', window.location.pathname);
  } else {
    // Limpiar referencia y mostrar selección
    localStorage.removeItem('jfit_cliente_seleccionado');
    mostrarVistaSeleccion();
  }
})();
