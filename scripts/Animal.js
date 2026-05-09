// ================================================================
// Animal.js  –  Clase Base para Animales del Corral
// Demuestra: propiedades de instancia, métodos de instancia,
//            base para herencia con 'extends' y 'super()'
// ================================================================

/**
 * Clase base Animal.
 * Todos los animales del corral heredan de esta clase.
 * @class Animal
 */
export class Animal {
  /**
   * @param {object} configuracion
   * @param {string}   configuracion.nombre         - Nombre del animal ("Pollo", "Vaca")
   * @param {number}   configuracion.tiempoFase      - Segundos que tarda en pasar a la siguiente fase
   * @param {number}   configuracion.produccion      - Monedas que genera por ciclo cuando es adulto
   * @param {number}   configuracion.costoCompra     - Oro necesario para comprarlo en la tienda
   * @param {string[]} configuracion.nombresFases    - Nombres de cada fase para mostrar en la UI
   * @param {object}   configuracion.rutasEstados    - Mapa de imágenes { fases: [], triste: '' }
   */
  constructor({
    nombre,
    tiempoFase,
    produccion,
    costoCompra,
    nombresFases,
    rutasEstados,
  }) {
    // ── Identificación ─────────────────────────────────────────
    /** @type {string} */
    this.nombre = nombre;

    /** @type {string[]} Nombre de cada fase (ej: ['Huevo', 'Pollito', 'Adulto']) */
    this.nombresFases = nombresFases;

    // ── Estado de vida ─────────────────────────────────────────
    /**
     * Fase actual del animal.
     * 0 = cría / huevo, 1 = joven / pollito, 2 = adulto
     * @type {number}
     */
    this.fase = 0;

    /** @type {number} Progreso hacia la siguiente fase (0-100%) */
    this.progresoFase = 0;

    // ── Hambre ─────────────────────────────────────────────────
    /**
     * Nivel de hambre (0-100). Baja con el tiempo.
     * Si llega a 25 o menos, el animal se pone triste.
     * @type {number}
     */
    this.hambre = 100;

    /** @type {boolean} true si el hambre bajó del umbral mínimo */
    this.estaTriste = false;

    // ── Economía ───────────────────────────────────────────────
    /** @type {number} Segundos que tarda en avanzar una fase */
    this.tiempoFase = tiempoFase;

    /** @type {number} Monedas generadas por ciclo cuando es adulto y feliz */
    this.produccion = produccion;

    /** @type {number} Costo en oro para comprarlo */
    this.costoCompra = costoCompra;

    // ── Assets visuales ────────────────────────────────────────
    /**
     * Mapa de rutas de imagen.
     * { fases: [ruta0, ruta1, ruta2], triste: ruta }
     * @type {object}
     */
    this.rutasEstados = rutasEstados;
  }

  // ══════════════════════════════════════════════════════════════
  // MÉTODOS DE INSTANCIA
  // ══════════════════════════════════════════════════════════════

  /**
   * alimentar()
   * Recarga el hambre al máximo. Se activa al hacer clic en el animal.
   */
  alimentar() {
    this.hambre = 100;
  }

  /**
   * crecer()
   * Avanza el progreso hacia la siguiente fase según el tiempo real.
   * No hace nada si el animal ya es adulto.
   *
   * @param {number} deltaTiempoSegundos
   */
  crecer(deltaTiempoSegundos) {
    if (this.fase >= 2) return;
    const incremento = (deltaTiempoSegundos / this.tiempoFase) * 100;
    this.progresoFase = Math.min(100, this.progresoFase + incremento);
  }

  /**
   * tenerHambre()
   * Reduce el nivel de hambre según el tiempo transcurrido.
   * Los animales pierden hambre mucho más lento que las plantas —
   * son más fáciles de mantener pero más costosos de comprar.
   *
   * @param {number} deltaTiempoSegundos
   */
  tenerHambre(deltaTiempoSegundos) {
    // 0.6% por segundo → de 100% a 25% (triste) en ~2 minutos
    const tasa = 0.6;
    this.hambre = Math.max(0, this.hambre - deltaTiempoSegundos * tasa);
  }

  /**
   * revisarEstado()
   * Evalúa condiciones y actualiza propiedades de estado.
   * Debe llamarse DESPUÉS de crecer() y tenerHambre() en cada tick.
   */
  revisarEstado() {
    // ¿Está triste por hambre?
    this.estaTriste = this.hambre <= 25;

    // ¿Avanzó de fase?
    if (this.progresoFase >= 100 && this.fase < 2) {
      this.fase++;
      this.progresoFase = 0;
    }
  }

  /**
   * producirMonedas()
   * Devuelve las monedas generadas en este ciclo de producción.
   * Solo produce si es adulto y no está triste.
   * Las subclases pueden sobreescribir este método para añadir bonos.
   *
   * @returns {number}
   */
  producirMonedas() {
    if (this.fase < 2 || this.estaTriste) return 0;
    return this.produccion;
  }

  /**
   * penalizacionTriste()
   * Devuelve las monedas a RESTAR si el animal adulto está triste.
   * Un animal adulto descuidado drena activamente el oro del jugador.
   *
   * @returns {number}
   */
  penalizacionTriste() {
    if (this.fase < 2 || !this.estaTriste) return 0;
    return 8; // oro que resta por ciclo si es adulto y está triste
  }

  /**
   * esAdulto()
   * @returns {boolean}
   */
  esAdulto() {
    return this.fase === 2;
  }

  /**
   * renderizar()
   * Devuelve la ruta de imagen correcta según el estado actual.
   * Las subclases pueden sobreescribir este método.
   *
   * @returns {string}
   */
  renderizar() {
    if (this.estaTriste) return this.rutasEstados.triste;
    return this.rutasEstados.fases[this.fase];
  }
}