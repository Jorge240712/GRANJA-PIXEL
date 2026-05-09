// ================================================================
// Interfaz.js  –  DOM, Eventos, Renderizado, Sonidos
// v3: tarjetas de tienda, semilla seleccionable por clic, sin hover-menus
// ================================================================

import { CATALOGO_VISUAL } from './Cultivos.js';
import { CATALOGO_MEJORAS } from './Juego.js';

// ──────────────────────────────────────────────────────────────
// REFERENCIAS DOM
// ──────────────────────────────────────────────────────────────
const contenedorCampos  = document.getElementById('contenedor-campos');
const listaSemillas     = document.getElementById('lista-semillas');
const listaMejoras      = document.getElementById('lista-mejoras');
const listaCampos       = document.getElementById('lista-campos');
const elementoOro       = document.getElementById('hud-oro');
const elementoCosechado = document.getElementById('hud-total-cosechado');
const toastEl           = document.getElementById('toast-feedback');
const toastTextoEl      = document.getElementById('toast-texto');

// ──────────────────────────────────────────────────────────────
// ESTADO INTERNO
// ──────────────────────────────────────────────────────────────
let _acciones  = {};
let _estado    = null;
let _timerToast = null;
let _audioCtx  = null;

function ctx() {
  if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return _audioCtx;
}

// ──────────────────────────────────────────────────────────────
// SONIDOS Y EFECTOS
// ──────────────────────────────────────────────────────────────
let sonidoActivado = true;
let musicaFondo = null;
let indiceMusica = 0;
const pistasMusica = [
  'sounds/sound tracks/Stardew Valley OST - Cloud Country.mp3',
  'sounds/sound tracks/Stardew Valley OST - Summer (Nature\'s Crescendo).mp3'
];

const sfxFiles = {
  arar: new Audio('sounds/SFX/Hit Generic 5-1.wav'),
  limpiar: new Audio('sounds/SFX/Hit Generic 2-1.wav'),
  desbloquear: new Audio('sounds/SFX/Special Collectible 9-1.wav'),
  cosechar: new Audio('sounds/SFX/Coins 2-1.wav'),
  regar: new Audio('sounds/SFX/waterSlosh.mp3'),
  comprar: new Audio('sounds/SFX/Interface 3-3.wav')
};

function iniciarMusica() {
  if (musicaFondo) return;
  musicaFondo = new Audio(pistasMusica[indiceMusica]);
  musicaFondo.volume = 0.45;
  musicaFondo.addEventListener('ended', () => {
    indiceMusica = (indiceMusica + 1) % pistasMusica.length;
    musicaFondo.src = pistasMusica[indiceMusica];
    musicaFondo.play().catch(()=>{});
  });
  if (sonidoActivado) {
    musicaFondo.play().catch(()=>{});
  }
}

export function toggleSonido() {
  sonidoActivado = !sonidoActivado;
  const icono = document.getElementById('icono-sonido');
  if (icono) icono.textContent = sonidoActivado ? '🔊' : '🔇';

  if (sonidoActivado) {
    if (!musicaFondo) iniciarMusica();
    else musicaFondo.play().catch(()=>{});
  } else {
    if (musicaFondo) musicaFondo.pause();
  }
}

export function reproducirSonido(tipo) {
  if (!sonidoActivado) return;

  if (sfxFiles[tipo]) {
    const snd = sfxFiles[tipo].cloneNode();
    snd.volume = tipo === 'regar' ? 0.7 : 1.0;
    snd.play().catch(() => {});
    return;
  }

  try {
    const ac   = ctx();
    const osc  = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    const t = ac.currentTime;

    const secuencia = (notas) => {
      notas.forEach(([frec, inicio, dur, tipo2 = 'square']) => {
        const o2 = ac.createOscillator();
        const g2 = ac.createGain();
        o2.connect(g2); g2.connect(ac.destination);
        o2.type = tipo2;
        o2.frequency.setValueAtTime(frec, t + inicio);
        g2.gain.setValueAtTime(0.22, t + inicio);
        g2.gain.exponentialRampToValueAtTime(0.001, t + inicio + dur);
        o2.start(t + inicio); o2.stop(t + inicio + dur + 0.01);
      });
    };

    switch (tipo) {
      case 'sembrar':
        secuencia([[440, 0, 0.1], [660, 0.1, 0.12]]);
        return;
      case 'seleccionar':
        secuencia([[660, 0, 0.08, 'square']]);
        return;
      case 'error':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, t);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        osc.start(t); osc.stop(t + 0.2);
        break;
      default:
        osc.start(t); osc.stop(t + 0.01);
    }
  } catch (_) { /* silenciar en contexto sin interacción */ }
}

// ──────────────────────────────────────────────────────────────
// INICIALIZACIÓN
// ──────────────────────────────────────────────────────────────
export function inicializarInterfaz(estadoJuego, acciones) {
  _estado   = estadoJuego;
  _acciones = acciones;

  construirTarjetasSemillas();
  construirTarjetasMejoras();

  const btnSonido = document.getElementById('btn-toggle-sonido');
  if (btnSonido) btnSonido.addEventListener('click', toggleSonido);

  // Activar AudioContext y música al primer gesto del usuario
  document.addEventListener('pointerdown', () => {
    ctx();
    if (sonidoActivado && !musicaFondo) iniciarMusica();
  }, { once: true });
}

// ──────────────────────────────────────────────────────────────
// RENDERIZADO DE CAMPOS
// ──────────────────────────────────────────────────────────────
export function renderizarCampos(estadoJuego) {
  contenedorCampos.innerHTML = estadoJuego.campos
    .map(construirHTMLCampo)
    .join('');

  // Adjuntar delegación de eventos a cada campo
  estadoJuego.campos.forEach((campo) => {
    const el = document.getElementById(`campo-fila-${campo.id}`);
    if (!el) return;

    // ── Clic (parcelas + botón desbloquear) ───────────────────
    el.addEventListener('click', (e) => {
      // Clic en desbloquear campo
      const btnDesbloquear = e.target.closest('[data-desbloquear-campo]');
      if (btnDesbloquear) {
        const idx = parseInt(btnDesbloquear.dataset.desbloquearCampo, 10);
        _acciones.desbloquearCampo(idx);
        reproducirSonido('desbloquear');
        return;
      }

      const parcelaEl = e.target.closest('[data-parcela]');
      if (!parcelaEl) return;

      const ic = parseInt(parcelaEl.dataset.campo,   10);
      const ip = parseInt(parcelaEl.dataset.parcela, 10);
      const ep = parcelaEl.dataset.estadoParcela;

      // Sonido según acción esperada
      if (ep === 'bruta') {
        reproducirSonido('arar');
      } else if (ep === 'sembrada') {
        const planta = estadoJuego.campos[ic].parcelas[ip].planta;
        if (planta?.estado === 'lista')   { reproducirSonido('cosechar'); lanzarOro(parcelaEl); }
        else if (planta?.estado === 'muerta') reproducirSonido('limpiar');
        else {
          _acciones.regarParcela(ic, ip);
          reproducirSonido('regar');
        }
      }

      _acciones.accionParcela(ic, ip);
    });
  });
}

// ──────────────────────────────────────────────────────────────
// CONSTRUCCIÓN HTML DE CAMPO
// ──────────────────────────────────────────────────────────────
function construirHTMLCampo(campo) {
  const tira = campo.parcelas.map(construirHTMLParcela.bind(null, campo)).join('');
  let lock = '';
  if (campo.bloqueado) {
    const costo = _acciones.obtenerCostoDesbloqueo(campo.id);
    lock = `
      <div class="campo-lock-overlay">
        <button class="btn-comprar-campo" data-desbloquear-campo="${campo.id}" aria-label="Desbloquear ${campo.nombre} por ${costo} oro">
          <span class="bcc-icono">🏡</span>
          <div class="bcc-info">
            <span class="bcc-titulo">Desbloquear ${campo.nombre}</span>
            <span class="bcc-precio">${costo} 🪙</span>
          </div>
        </button>
      </div>`;
  }
  return `
    <div class="campo-fila ${campo.bloqueado ? 'campo-bloqueado' : ''}" id="campo-fila-${campo.id}">
      <div class="campo-etiqueta">${campo.nombre}</div>
      <div style="position:relative">
        ${lock}
        <div class="campo-tira">${tira}</div>
      </div>
    </div>`;
}

function construirHTMLParcela(campo, parcela, idx) {
  // Suelo
  let suelo = 'images/suelos/tierra.webp';
  if (parcela.estadoParcela === 'arada' && !parcela.planta) suelo = 'images/suelos/tierra_arada_seca.webp';
  else if (parcela.planta) suelo = 'images/suelos/tierra_arada_mojada.webp';

  // Planta
  let htmlPlanta = '';
  if (parcela.planta) {
    let cls = 'parcela-planta';
    if (parcela.planta.estado === 'lista')   cls += ' planta-lista';
    else if (parcela.planta.estaMuerta)      cls += ' planta-muerta-img';
    else cls += parcela.planta.nivelHidratacion < 40 ? ' planta-idle-rapido' : ' planta-idle';
    htmlPlanta = `<img class="${cls}" src="${parcela.planta.renderizar()}" alt="${parcela.planta.nombre}" draggable="false"/>`;
  }

  // Barras
  let htmlBarras = '';
  if (parcela.planta && !parcela.planta.estaMuerta) {
    const pC = Math.round(parcela.planta.progresoCrecimiento);
    const pH = Math.round(parcela.planta.nivelHidratacion);
    const clH = pH < 30 ? 'peligro' : '';
    htmlBarras = `
      <div class="barras-wrapper">
        <div class="barra-track crecer"><div class="barra-fill" style="width:${pC}%"></div></div>
        <div class="barra-track agua ${clH}"><div class="barra-fill" style="width:${pH}%"></div></div>
      </div>`;
  }

  // Hint
  let hint = '';
  if (parcela.estadoParcela === 'bruta')   hint = `<span class="parcela-accion-hint">⛏️</span>`;
  if (parcela.estadoParcela === 'arada')   hint = `<span class="parcela-accion-hint">🌱</span>`;
  if (parcela.planta?.estado === 'lista')  hint = `<span class="parcela-accion-hint">✂️</span>`;
  if (parcela.planta?.estado === 'muerta') hint = `<span class="parcela-accion-hint">🪣</span>`;

  // Tooltip riego
  const riego = (parcela.planta && !parcela.planta.estaMuerta)
    ? `<span class="tooltip-riego">💧 Regando</span>` : '';

  // Clases
  let cls = 'parcela';
  if (parcela.estadoParcela === 'arada')   cls += ' estado-arada';
  if (parcela.planta?.estado === 'lista')  cls += ' estado-lista';
  if (parcela.planta?.estado === 'muerta') cls += ' estado-muerta';

  return `
    <div class="${cls}"
         data-campo="${campo.id}"
         data-parcela="${idx}"
         data-estado-parcela="${parcela.estadoParcela}"
         role="button" tabindex="0"
         aria-label="Parcela ${idx + 1}">
      <img class="parcela-suelo" src="${suelo}" alt="suelo" draggable="false"/>
      ${htmlPlanta}${riego}${hint}${htmlBarras}
    </div>`;
}

// ──────────────────────────────────────────────────────────────
// TIENDA – SEMILLAS (tarjetas seleccionables)
// ──────────────────────────────────────────────────────────────
function construirTarjetasSemillas() {
  listaSemillas.innerHTML = Object.entries(CATALOGO_VISUAL).map(([clave, info]) => {
    const esPendiente  = !info.implementado;
    const claseExtra   = esPendiente ? 'pendiente' : '';
    const lock         = esPendiente ? `<span class="ts-lock">🔒</span>` : '';
    const cantidad     = _estado.semillas[clave] || 0;
    const costoCompra  = Math.floor(info.valor / 2) || 1;
    
    let btnCompra = '';
    let badge = '';

    if (esPendiente) {
      badge = `<span class="ts-badge">¡Tu tarea!</span>`;
    } else {
      badge = `<span class="ts-cantidad" id="cant-${clave}">x${cantidad}</span>`;
      btnCompra = `<button class="ts-btn-comprar" data-comprar-semilla="${clave}">Comprar ${costoCompra}🪙</button>`;
    }

    return `
      <div class="tarjeta-semilla-wrapper">
        <div class="tarjeta-semilla ${claseExtra}" id="ts-${clave}" data-semilla="${clave}"
             role="button" tabindex="0"
             aria-label="${info.nombre}${esPendiente ? ' (pendiente de implementar)' : ''}">
          ${lock}
          <img class="ts-img" src="${info.rutaImagen}" alt="${info.nombre}"/>
          <span class="ts-nombre">${info.icono} ${info.nombre}</span>
          <span class="ts-stats">Tiempo: ${info.tiempoCrecimiento}s<br>Venta: ${info.valor}🪙</span>
          ${badge}
        </div>
        ${btnCompra}
      </div>`;
  }).join('');

  // Marcar seleccionada por defecto
  actualizarSeleccionSemilla(_estado.semillaSeleccionada);

  // Eventos de clic en tarjetas para SELECCIONAR
  listaSemillas.querySelectorAll('[data-semilla]').forEach((tarjeta) => {
    tarjeta.addEventListener('click', (e) => {
      // Ignorar clicks si es en el botón de comprar
      if (e.target.closest('[data-comprar-semilla]')) return;

      const clave = tarjeta.dataset.semilla;
      const info  = CATALOGO_VISUAL[clave];

      if (!info.implementado) {
        reproducirSonido('error');
        mostrarFeedback(`🔒 ${info.nombre}: ¡Implementa esta clase en Cultivos.js! Es tu tarea.`);
        return;
      }

      _estado.semillaSeleccionada = clave;
      actualizarSeleccionSemilla(clave);
      reproducirSonido('seleccionar');
    });
  });

  // Eventos de clic para COMPRAR
  listaSemillas.querySelectorAll('[data-comprar-semilla]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const clave = btn.dataset.comprarSemilla;
      const exito = _acciones.comprarSemilla(clave);
      reproducirSonido(exito ? 'comprar' : 'error');
    });
  });
}

function actualizarSeleccionSemilla(clave) {
  listaSemillas.querySelectorAll('[data-semilla]').forEach((t) => {
    t.classList.toggle('seleccionada', t.dataset.semilla === clave && !t.classList.contains('pendiente'));
  });
}

// ──────────────────────────────────────────────────────────────
// TIENDA – MEJORAS (tarjetas clickeables)
// ──────────────────────────────────────────────────────────────
function construirTarjetasMejoras() {
  listaMejoras.innerHTML = Object.entries(CATALOGO_MEJORAS).map(([clave, mejora]) => {
    const costo = _acciones.calcularCostoMejora(clave);
    const nivel = _estado.mejoras[clave];
    return `
      <button class="tarjeta-mejora" id="tm-${clave}" data-mejora="${clave}"
              aria-label="${mejora.nombre} nivel ${nivel}, costo ${costo}">
        <div class="tm-icono">${mejora.icono}</div>
        <div class="tm-nombre">${mejora.nombre}</div>
        <div class="tm-nivel">Nivel: ${nivel}</div>
        <div class="tm-desc">${mejora.descripcion}</div>
        <div class="tm-precio">${costo} 🪙</div>
      </button>`;
  }).join('');

  listaMejoras.querySelectorAll('[data-mejora]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const exito = _acciones.comprarMejora(btn.dataset.mejora);
      reproducirSonido(exito ? 'desbloquear' : 'error');
      if (exito) actualizarTarjetasMejoras();
    });
  });
}

function actualizarTarjetasMejoras() {
  Object.entries(CATALOGO_MEJORAS).forEach(([clave, mejora]) => {
    const btn = document.getElementById(`tm-${clave}`);
    if (!btn) return;
    const costo = _acciones.calcularCostoMejora(clave);
    const nivel = _estado.mejoras[clave];
    btn.innerHTML = `
      <div class="tm-icono">${mejora.icono}</div>
      <div class="tm-nombre">${mejora.nombre}</div>
      <div class="tm-nivel">Nivel: ${nivel}</div>
      <div class="tm-desc">${mejora.descripcion}</div>
      <div class="tm-precio">${costo} 🪙</div>`;
    btn.style.opacity = _estado.oro >= costo ? '1' : '0.45';
  });
}

// ──────────────────────────────────────────────────────────────
// (Sección de tarjetas de campo eliminada, la compra ahora es en el mismo campo)
// ──────────────────────────────────────────────────────────────

// ──────────────────────────────────────────────────────────────
// HUD
// ──────────────────────────────────────────────────────────────
export function actualizarHUD(estadoJuego) {
  elementoOro.textContent       = estadoJuego.oro.toLocaleString('es-MX');
  elementoCosechado.textContent = estadoJuego.totalCosechado.toLocaleString('es-MX');
  document.getElementById('cnt-aspersores').textContent   = estadoJuego.mejoras.aspersores;
  document.getElementById('cnt-fertilizante').textContent = estadoJuego.mejoras.fertilizante;
  document.getElementById('cnt-supersuelo').textContent   = estadoJuego.mejoras.superSuelo;
  actualizarTarjetasMejoras();

  // Actualizar contadores de semillas en la UI
  Object.keys(estadoJuego.semillas).forEach(clave => {
    const cantidad = estadoJuego.semillas[clave];

    // Badge en tarjeta
    const elCard = document.getElementById(`cant-${clave}`);
    if (elCard) elCard.textContent = `x${cantidad}`;

    // Efecto visual en tarjeta
    const tarjeta = document.getElementById(`ts-${clave}`);
    if (tarjeta) {
      tarjeta.style.filter = cantidad <= 0 ? 'grayscale(100%)' : '';
    }
  });
}

// ──────────────────────────────────────────────────────────────
// ACTUALIZACIÓN EN TIEMPO REAL (60 FPS)
// ──────────────────────────────────────────────────────────────
export function actualizarParcelaEnTiempoReal(ic, ip, planta) {
  const parcelaEl = document.querySelector(`.parcela[data-campo="${ic}"][data-parcela="${ip}"]`);
  if (!parcelaEl) return;

  // Actualizar barras
  const fillCrecer = parcelaEl.querySelector('.barra-track.crecer .barra-fill');
  const fillAgua = parcelaEl.querySelector('.barra-track.agua .barra-fill');
  const trackAgua = parcelaEl.querySelector('.barra-track.agua');
  
  if (fillCrecer) fillCrecer.style.width = `${planta.progresoCrecimiento}%`;
  if (fillAgua) fillAgua.style.width = `${planta.nivelHidratacion}%`;
  
  if (trackAgua) {
    if (planta.nivelHidratacion < 30) trackAgua.classList.add('peligro');
    else trackAgua.classList.remove('peligro');
  }

  // Actualizar imagen y animaciones idle
  const imgPlanta = parcelaEl.querySelector('.parcela-planta');
  if (imgPlanta) {
    const nuevaRuta = planta.renderizar();
    if (imgPlanta.getAttribute('src') !== nuevaRuta) {
      imgPlanta.setAttribute('src', nuevaRuta);
    }

    if (planta.nivelHidratacion < 40) {
      imgPlanta.classList.add('planta-idle-rapido');
      imgPlanta.classList.remove('planta-idle');
    } else {
      imgPlanta.classList.add('planta-idle');
      imgPlanta.classList.remove('planta-idle-rapido');
    }
  }
}

// ──────────────────────────────────────────────────────────────
// TOAST
// ──────────────────────────────────────────────────────────────
export function mostrarFeedback(msg, dur = 2600) {
  if (_timerToast) clearTimeout(_timerToast);
  toastTextoEl.textContent = msg;
  toastEl.classList.remove('oculto');
  _timerToast = setTimeout(() => toastEl.classList.add('oculto'), dur);
}

// ──────────────────────────────────────────────────────────────
// PARTÍCULA DE ORO
// ──────────────────────────────────────────────────────────────
function lanzarOro(elOrigen) {
  const rect = elOrigen.getBoundingClientRect();
  const p = document.createElement('div');
  p.className = 'particula-oro';
  p.textContent = '🪙';
  p.style.left = `${rect.left + rect.width / 2}px`;
  p.style.top  = `${rect.top}px`;
  document.body.appendChild(p);
  setTimeout(() => p.remove(), 1100);
}
