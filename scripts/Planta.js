// ================================================================
// Planta.js  –  Clase Base (Clase Padre)
// Demuestra: propiedades de instancia, métodos de instancia,
//            cadena de herencia con 'extends' y 'super()'
// ================================================================

/**
 * Clase base Planta.
 * Todas las plantas heredan de esta clase.
 * @class Planta
 */
export class Planta {
  /**
   * @param {object} configuracion - Parámetros de la planta
   * @param {string} configuracion.nombre          - Nombre legible del cultivo
   * @param {number} configuracion.tiempoCrecimiento - Segundos hasta madurar (antes de mejoras)
   * @param {number} configuracion.valor           - Oro base al cosechar
   * @param {string} configuracion.rutaImagen      - Ruta de la imagen de semilla
   * @param {object} configuracion.rutasEstados    - Mapa de estado → ruta de imagen
   */
  constructor({
    nombre,
    tiempoCrecimiento,
    valor,
    rutaImagen,
    rutasEstados,
  }) {
    // ── Propiedades de identificación ──────────────────────────
    /** @type {string} Nombre del cultivo (ej: "Maíz") */
    this.nombre = nombre;

    // ── Propiedades de economía ────────────────────────────────
    /** @type {number} Oro base al cosechar */
    this.valor = valor;

    // ── Propiedades de ciclo de vida ───────────────────────────
    /** @type {number} Segundos totales que tarda en crecer */
    this.tiempoCrecimiento = tiempoCrecimiento;

    /** @type {number} Progreso de crecimiento 0-100 (%) */
    this.progresoCrecimiento = 0;

    // ── Propiedades de hidratación ─────────────────────────────
    /** @type {number} Nivel de hidratación 0-100 (%) */
    this.nivelHidratacion = 100;

    /** @type {boolean} Si llegó a 0 de hidratación */
    this.estaMuerta = false;

    // ── Estado actual ──────────────────────────────────────────
    /**
     * Estados posibles:
     *  'creciendo' | 'lista' | 'muerta'
     * @type {string}
     */
    this.estado = 'creciendo';

    // ── Assets visuales ────────────────────────────────────────
    /** @type {string} Imagen de semilla (vista en tienda) */
    this.rutaImagen = rutaImagen;

    /**
     * Mapa de rutas de imagen por fase de crecimiento.
     * Ejemplo:
     *   { semilla, brote, frutos, madura, seca }
     * @type {object}
     */
    this.rutasEstados = rutasEstados;

    // ── Timestamp interno ──────────────────────────────────────
    /** @type {number} Momento en que fue sembrada (ms) */
    this._tiempoSiembra = Date.now();
  }

  // ══════════════════════════════════════════════════════════════
  // MÉTODOS DE INSTANCIA  (pueden ser sobreescritos en subclases)
  // ══════════════════════════════════════════════════════════════

  /**
   * crecer()
   * Avanza el progreso de crecimiento según el tiempo real transcurrido.
   * Se llama desde el bucle principal del juego (Juego.js).
   *
   * @param {number} deltaTiempoSegundos  - Tiempo en segundos desde el último tick
   * @param {number} factorFertilizante   - Multiplicador de velocidad (>1 = más rápido)
   */
  crecer(deltaTiempoSegundos, factorFertilizante = 1) {
    if (this.estaMuerta || this.estado === 'lista') return;

    // Incremento de progreso proporcional al tiempo y fertilizante
    const incremento = (deltaTiempoSegundos / this.tiempoCrecimiento) * 100 * factorFertilizante;
    this.progresoCrecimiento = Math.min(100, this.progresoCrecimiento + incremento);
  }

  /**
   * deshidratar()
   * Reduce el nivel de hidratación según el tiempo y los aspersores.
   * Si llega a 0, la planta muere.
   *
   * @param {number} deltaTiempoSegundos  - Tiempo en segundos desde el último tick
   * @param {number} factorAspersores     - Factor de ralentización (>1 = pierde más lento)
   */
  deshidratar(deltaTiempoSegundos, factorAspersores = 1) {
    if (this.estaMuerta) return;

    // La hidratación cae rápido para forzar la intervención del jugador (caótico/retador)
    const tasaBase = 12; // % por segundo sin mejoras
    const reduccion = (deltaTiempoSegundos * tasaBase) / factorAspersores;
    
    // Solo deshidratar si está viva y creciendo o lista
    this.nivelHidratacion = Math.max(0, this.nivelHidratacion - reduccion);
  }

  /**
   * regar()
   * Recarga la hidratación al 100%.
   * Se activa al hacer hover sobre la parcela en la UI.
   */
  regar() {
    if (this.estaMuerta) return;
    this.nivelHidratacion = 100;
  }

  /**
   * revisarEstado()
   * Evalúa condiciones y actualiza this.estado.
   * Debe llamarse DESPUÉS de crecer() y deshidratar() en cada tick.
   */
  revisarEstado() {
    // Prioridad 1: ¿Murió por sed?
    if (this.nivelHidratacion <= 0) {
      this.estaMuerta = true;
      this.estado = 'muerta';
      this.progresoCrecimiento = 0; // Reset visual safety
      return;
    }

    // Prioridad 2: ¿Terminó de crecer?
    if (this.progresoCrecimiento >= 100) {
      this.estado = 'lista';
      return;
    }

    // En cualquier otro caso sigue creciendo
    this.estado = 'creciendo';
  }

  /**
   * cosechar()
   * Devuelve el oro ganado al cosechar.
   * Solo válido si el estado es 'lista'.
   *
   * @param {number} bonusSuperSuelo - Multiplicador de oro (>1 = más oro)
   * @returns {number} Oro cosechado
   */
  cosechar(bonusSuperSuelo = 1) {
    if (this.estado !== 'lista') return 0;
    return Math.round(this.valor * bonusSuperSuelo);
  }

  /**
   * renderizar()
   * Devuelve la ruta de la imagen que debe mostrarse según el estado actual.
   * Las subclases pueden sobreescribir este método para lógica personalizada.
   *
   * @returns {string} URL relativa de la imagen
   */
  renderizar() {
    if (this.estaMuerta) {
      return this.rutasEstados.seca;
    }

    if (this.estado === 'lista') {
      return this.rutasEstados.madura;
    }

    // Fases intermedias según progreso
    if (this.progresoCrecimiento < 30) {
      return this.rutasEstados.semilla;
    } else if (this.progresoCrecimiento < 65) {
      return this.rutasEstados.brote;
    } else {
      return this.rutasEstados.frutos;
    }
  }
}
