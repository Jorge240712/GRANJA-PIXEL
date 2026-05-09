// ================================================================
// Juego.js  –  Motor del juego (Game Engine)
// Responsabilidades:
//   · Bucle principal (requestAnimationFrame)
//   · Estado global (oro, mejoras, semillas)
//   · Lógica de parcelas y campos
//   · Escalado de costos (Cookie Clicker style)
// ================================================================

import { crearCultivo, CATALOGO_CULTIVOS, CATALOGO_VISUAL } from './Cultivos.js';
import {
  inicializarInterfaz,
  renderizarCampos,
  actualizarHUD,
  mostrarFeedback,
  actualizarParcelaEnTiempoReal
} from './Interfaz.js';

// ──────────────────────────────────────────────────────────────
// CONSTANTES DEL JUEGO
// ──────────────────────────────────────────────────────────────

/** Número de parcelas por campo */
const PARCELAS_POR_CAMPO = 10;

/** Número total de campos */
const TOTAL_CAMPOS = 3;

/** Costo en oro para desbloquear campo 2 y 3 */
const COSTO_DESBLOQUEO_CAMPO = [0, 200, 600];

// ──────────────────────────────────────────────────────────────
// ESTADO GLOBAL DEL JUEGO
// ──────────────────────────────────────────────────────────────

/**
 * estadoJuego – Objeto principal que contiene toda la data mutable.
 * Es el "cerebro" central del juego.
 */
export const estadoJuego = {
  /** @type {number} Cantidad de oro del jugador */
  oro: 50,

  /** @type {number} Total de plantas cosechadas (estadística) */
  totalCosechado: 0,

  /** @type {number} Semilla seleccionada para sembrar ('maiz'|'fresa'|'berenjena') */
  semillaSeleccionada: 'maiz',

  // ── Inventario de semillas ───────────────────────────────────
  semillas: {
    maiz: 5, // Semillas iniciales
    fresa: 0,
    berenjena: 0,
  },

  // ── Mejoras compradas ──────────────────────────────────────
  mejoras: {
    /** @type {number} Aspersores: ralentizan pérdida de hidratación */
    aspersores: 0,
    /** @type {number} Fertilizante: acelera el crecimiento */
    fertilizante: 0,
    /** @type {number} Super-Suelo: multiplica el oro cosechado */
    superSuelo: 0,
  },

  // ── Campos desbloqueados ───────────────────────────────────
  /**
   * Array de 3 campos. Cada campo tiene:
   *   bloqueado: boolean
   *   parcelas:  Array de objetos parcela
   */
  campos: [],

  // ── Último timestamp del bucle ─────────────────────────────
  _ultimoTick: null,
};

// ──────────────────────────────────────────────────────────────
// CONFIGURACIÓN DE MEJORAS
// ──────────────────────────────────────────────────────────────

/**
 * Catálogo de mejoras con costos base y efectos.
 * El costo escala con la fórmula Cookie Clicker:
 *   NuevoCosto = costoBase * (1.15 ^ cantidadComprada)
 */
export const CATALOGO_MEJORAS = {
  aspersores: {
    nombre:    'Aspersores',
    descripcion: 'Ralentiza la pérdida de hidratación',
    costoBase: 80,
    icono:     '💧',
    /** Factor acumulable: cada nivel ÷ pérdida por 1.35 */
    calcularFactor: (cantidad) => Math.pow(1.35, cantidad),
  },
  fertilizante: {
    nombre:    'Fertilizante',
    descripcion: 'Acelera el crecimiento de las plantas',
    costoBase: 120,
    icono:     '🌿',
    /** Factor acumulable: cada nivel × velocidad por 1.25 */
    calcularFactor: (cantidad) => Math.pow(1.25, cantidad),
  },
  superSuelo: {
    nombre:    'Super-Suelo',
    descripcion: 'Aumenta el oro obtenido al cosechar',
    costoBase: 200,
    icono:     '⭐',
    /** Factor acumulable: cada nivel × valor por 1.20 */
    calcularFactor: (cantidad) => Math.pow(1.20, cantidad),
  },
};

// ──────────────────────────────────────────────────────────────
// FUNCIONES DE INICIALIZACIÓN
// ──────────────────────────────────────────────────────────────

/**
 * inicializarCampo()
 * Crea la estructura de un campo con sus parcelas vacías.
 * @param {number} indiceCampo - Índice 0, 1, o 2
 * @returns {object} Campo inicializado
 */
function inicializarCampo(indiceCampo) {
  const parcelas = [];

  for (let i = 0; i < PARCELAS_POR_CAMPO; i++) {
    parcelas.push(crearParcelaVacia(indiceCampo, i));
  }

  return {
    id:       indiceCampo,
    nombre:   `Campo ${indiceCampo + 1}`,
    bloqueado: indiceCampo > 0, // Solo el campo 1 empieza desbloqueado
    parcelas,
  };
}

/**
 * crearParcelaVacia()
 * Devuelve el estado inicial de una parcela sin cultivo.
 * @param {number} indiceCampo
 * @param {number} indiceParcela
 * @returns {object}
 */
function crearParcelaVacia(indiceCampo, indiceParcela) {
  return {
    id:           `campo${indiceCampo}-parcela${indiceParcela}`,
    // Estados posibles: 'bruta' | 'arada' | 'sembrada'
    estadoParcela: 'bruta',
    /** @type {import('./Planta.js').Planta|null} */
    planta:        null,
  };
}

// ──────────────────────────────────────────────────────────────
// ACCIONES SOBRE PARCELAS
// ──────────────────────────────────────────────────────────────

/**
 * accionParcela()
 * Decide qué ocurre al hacer clic en una parcela según su estado.
 * Implementa la máquina de estados del ciclo de cultivo.
 *
 * @param {number} indiceCampo
 * @param {number} indiceParcela
 */
export function accionParcela(indiceCampo, indiceParcela) {
  const campo   = estadoJuego.campos[indiceCampo];
  const parcela = campo.parcelas[indiceParcela];

  switch (parcela.estadoParcela) {
    case 'bruta':
      // Arar la tierra (costo 0, solo un clic)
      parcela.estadoParcela = 'arada';
      mostrarFeedback('🪱 ¡Tierra arada! Elige una semilla.');
      break;

    case 'arada':
      // Sembrar automáticamente con la semilla seleccionada en la tienda
      if (!CATALOGO_CULTIVOS[estadoJuego.semillaSeleccionada]) {
        mostrarFeedback('⚠️ ¡Esta clase aún no está implementada! Es tu tarea.');
      } else {
        sembrarEnParcela(indiceCampo, indiceParcela, estadoJuego.semillaSeleccionada);
      }
      break;

    case 'sembrada':
      if (!parcela.planta) break;

      if (parcela.planta.estado === 'lista') {
        // ── COSECHAR ──────────────────────────────────────────
        const factorSuperSuelo = CATALOGO_MEJORAS.superSuelo.calcularFactor(
          estadoJuego.mejoras.superSuelo
        );
        const oroGanado = parcela.planta.cosechar(factorSuperSuelo);
        estadoJuego.oro += oroGanado;
        estadoJuego.totalCosechado++;
        mostrarFeedback(`🌽 ¡Cosechado! +${oroGanado} 🪙`);
        parcela.estadoParcela = 'arada';
        parcela.planta = null;

      } else if (parcela.planta.estado === 'muerta') {
        // ── LIMPIAR PLANTA MUERTA ─────────────────────────────
        parcela.estadoParcela = 'arada';
        parcela.planta = null;
        mostrarFeedback('🪦 Parcela limpiada. Lista para resembrar.');

      } else {
        mostrarFeedback('⏳ La planta aún está creciendo...');
      }
      break;
  }

  renderizarCampos(estadoJuego);
  actualizarHUD(estadoJuego);
}

/**
 * sembrarEnParcela()
 * Siembra la semilla actualmente seleccionada en una parcela arada.
 *
 * @param {number} indiceCampo
 * @param {number} indiceParcela
 * @param {string} tipoCultivo - Clave del cultivo a sembrar
 */
export function sembrarEnParcela(indiceCampo, indiceParcela, tipoCultivo) {
  const campo   = estadoJuego.campos[indiceCampo];
  const parcela = campo.parcelas[indiceParcela];

  if (parcela.estadoParcela !== 'arada') return;
  if (estadoJuego.semillas[tipoCultivo] <= 0) {
    mostrarFeedback(`❌ No tienes semillas de ${CATALOGO_VISUAL[tipoCultivo].nombre}. ¡Compra en la tienda!`);
    return;
  }

  estadoJuego.semillas[tipoCultivo]--; // Consumir una semilla
  parcela.planta = crearCultivo(tipoCultivo);
  parcela.estadoParcela = 'sembrada';
  mostrarFeedback(`🌱 ¡${parcela.planta.nombre} sembrado! (-1 semilla)`);

  renderizarCampos(estadoJuego);
  actualizarHUD(estadoJuego);
}

/**
 * comprarSemilla()
 * Intenta comprar una semilla si hay suficiente oro.
 *
 * @param {string} tipoCultivo
 */
export function comprarSemilla(tipoCultivo) {
  const info = CATALOGO_VISUAL[tipoCultivo];
  if (!info.implementado) {
    mostrarFeedback(`🔒 ${info.nombre}: ¡Aún no está implementado!`);
    return false;
  }

  // Costo arbitrario de semilla (la mitad del valor de venta para tener ganancia)
  const costoSemilla = Math.floor(info.valor / 2) || 1; 

  if (estadoJuego.oro < costoSemilla) {
    mostrarFeedback(`❌ Oro insuficiente. Cuesta ${costoSemilla} 🪙`);
    return false;
  }

  estadoJuego.oro -= costoSemilla;
  estadoJuego.semillas[tipoCultivo]++;
  
  mostrarFeedback(`📦 ¡Compraste 1 semilla de ${info.nombre}!`);
  
  renderizarCampos(estadoJuego);
  actualizarHUD(estadoJuego);
  return true;
}

/**
 * regarParcela()
 * Activa el riego al hacer hover sobre una parcela con planta.
 *
 * @param {number} indiceCampo
 * @param {number} indiceParcela
 */
export function regarParcela(indiceCampo, indiceParcela) {
  const parcela = estadoJuego.campos[indiceCampo].parcelas[indiceParcela];
  if (parcela.planta && !parcela.planta.estaMuerta) {
    parcela.planta.regar();
  }
}

// ──────────────────────────────────────────────────────────────
// TIENDA – MEJORAS Y DESBLOQUEOS
// ──────────────────────────────────────────────────────────────

/**
 * calcularCostoMejora()
 * Aplica la fórmula de escalado estilo Cookie Clicker.
 *
 * @param {string} claveMejora - Clave en CATALOGO_MEJORAS
 * @returns {number} Costo actual redondeado
 */
export function calcularCostoMejora(claveMejora) {
  const mejora   = CATALOGO_MEJORAS[claveMejora];
  const cantidad = estadoJuego.mejoras[claveMejora];
  return Math.round(mejora.costoBase * Math.pow(1.15, cantidad));
}

/**
 * comprarMejora()
 * Intenta comprar una mejora si hay suficiente oro.
 *
 * @param {string} claveMejora
 * @returns {boolean} true si la compra fue exitosa
 */
export function comprarMejora(claveMejora) {
  const costo = calcularCostoMejora(claveMejora);
  if (estadoJuego.oro < costo) {
    mostrarFeedback(`❌ Oro insuficiente. Necesitas ${costo} 🪙`);
    return false;
  }

  estadoJuego.oro -= costo;
  estadoJuego.mejoras[claveMejora]++;

  const mejora = CATALOGO_MEJORAS[claveMejora];
  mostrarFeedback(`✅ ${mejora.nombre} nivel ${estadoJuego.mejoras[claveMejora]} comprado!`);

  renderizarCampos(estadoJuego);
  actualizarHUD(estadoJuego);
  return true;
}

/**
 * desbloquearCampo()
 * Desbloquea el campo indicado si el jugador tiene oro suficiente.
 *
 * @param {number} indiceCampo - 1 o 2 (el campo 0 ya está desbloqueado)
 */
export function desbloquearCampo(indiceCampo) {
  const costo = COSTO_DESBLOQUEO_CAMPO[indiceCampo];
  if (estadoJuego.oro < costo) {
    mostrarFeedback(`❌ Necesitas ${costo} 🪙 para desbloquear este campo.`);
    return;
  }

  estadoJuego.oro -= costo;
  estadoJuego.campos[indiceCampo].bloqueado = false;
  mostrarFeedback(`🏡 ¡Campo ${indiceCampo + 1} desbloqueado!`);

  renderizarCampos(estadoJuego);
  actualizarHUD(estadoJuego);
}

/**
 * Exporta el costo de desbloqueo para la UI.
 */
export function obtenerCostoDesbloqueo(indiceCampo) {
  return COSTO_DESBLOQUEO_CAMPO[indiceCampo];
}

// ──────────────────────────────────────────────────────────────
// BUCLE PRINCIPAL DEL JUEGO
// ──────────────────────────────────────────────────────────────

/**
 * tick()
 * Se ejecuta en cada fotograma vía requestAnimationFrame.
 * Actualiza el estado de todas las plantas en todos los campos.
 *
 * @param {DOMHighResTimeStamp} tiempoActual - Timestamp en ms del navegador
 */
function tick(tiempoActual) {
  if (!estadoJuego._ultimoTick) {
    estadoJuego._ultimoTick = tiempoActual;
  }

  // Tiempo transcurrido en segundos desde el último fotograma
  const deltaTiempoSegundos = (tiempoActual - estadoJuego._ultimoTick) / 1000;
  estadoJuego._ultimoTick = tiempoActual;

  // Calcular factores de mejoras actuales
  const factorFertilizante = CATALOGO_MEJORAS.fertilizante.calcularFactor(
    estadoJuego.mejoras.fertilizante
  );
  const factorAspersores = CATALOGO_MEJORAS.aspersores.calcularFactor(
    estadoJuego.mejoras.aspersores
  );

  let necesitaRenderizado = false;

  // Iterar sobre todos los campos y parcelas
  estadoJuego.campos.forEach((campo) => {
    if (campo.bloqueado) return;

    campo.parcelas.forEach((parcela) => {
      if (!parcela.planta || parcela.planta.estaMuerta) return;

      const planta = parcela.planta;

      // 1. Hacer crecer la planta
      const progresoAntes = planta.progresoCrecimiento;
      planta.crecer(deltaTiempoSegundos, factorFertilizante);

      // 2. Deshidratar la planta
      const hidraAntes = planta.nivelHidratacion;
      planta.deshidratar(deltaTiempoSegundos, factorAspersores);

      // 3. Revisar si cambió de estado
      const estadoAntes = planta.estado;
      planta.revisarEstado();

      // Si cambió el estado general (ej. de creciendo a lista o a muerta), hacemos un renderizado completo
      if (planta.estado !== estadoAntes) {
        necesitaRenderizado = true;
      } else {
        // De lo contrario, solo actualizamos las barras y la imagen de esta parcela en tiempo real
        // parseamos el id (ej. "campo0-parcela0") para obtener el índice de la parcela
        const idxParcela = parseInt(parcela.id.split('parcela')[1], 10);
        actualizarParcelaEnTiempoReal(campo.id, idxParcela, planta);
      }
    });
  });

  if (necesitaRenderizado) {
    renderizarCampos(estadoJuego);
    actualizarHUD(estadoJuego);
  }

  // Continuar el bucle
  requestAnimationFrame(tick);
}

// ──────────────────────────────────────────────────────────────
// ARRANQUE DEL JUEGO
// ──────────────────────────────────────────────────────────────

/**
 * iniciarJuego()
 * Punto de entrada. Inicializa los campos, la UI, y arranca el bucle.
 */
function iniciarJuego() {
  // Crear los 3 campos con sus parcelas
  for (let i = 0; i < TOTAL_CAMPOS; i++) {
    estadoJuego.campos.push(inicializarCampo(i));
  }

  // Inicializar la interfaz (eventos, tienda, etc.)
  inicializarInterfaz(estadoJuego, {
    accionParcela,
    sembrarEnParcela,
    regarParcela,
    comprarMejora,
    desbloquearCampo,
    obtenerCostoDesbloqueo,
    calcularCostoMejora,
    comprarSemilla, // Nueva acción exportada a Interfaz
  });

  // Primer renderizado
  renderizarCampos(estadoJuego);
  actualizarHUD(estadoJuego);

  // Arrancar el bucle principal
  requestAnimationFrame(tick);

  console.log('[Juego] Granja de Herencia Pixel iniciada. ¡Buena suerte!');
}

// Iniciar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', iniciarJuego);
} else {
  iniciarJuego();
}
