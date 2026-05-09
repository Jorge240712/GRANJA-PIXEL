// ================================================================
// Cultivos.js  –  Subclases de Planta
// Demuestra: herencia con 'extends', llamada a padre con 'super()',
//            sobreescritura de métodos (renderizar, cosechar)
// ================================================================

import { Planta } from './Planta.js';

// ================================================================
//  INSTRUCCIONES DE LA MISIÓN
//  → Este es el único archivo que debes editar hoy.
//  → Planta.js, Juego.js e Interfaz.js ya están listos.
//  → No borres nada de lo que ya existe.
//  → La clase Maiz ya está completa — úsala como guía.
// ================================================================


// ──────────────────────────────────────────────────────────────
// ✅ MAIZ — Ya implementado. Léelo completo antes de empezar.
//    Es tu mapa para los tickets que siguen.
// ──────────────────────────────────────────────────────────────

export class Maiz extends Planta {
  constructor() {
    // super() llama al constructor de Planta y le entrega la configuración.
    // Sin esta llamada, 'this' no existe y el programa colapsa.
    super({
      nombre:            'Maíz',
      tiempoCrecimiento: 12, // segundos hasta madurar
      valor:             15, // oro base al cosechar
      rutaImagen:        'images/maiz/maiz_semillas.webp',
      rutasEstados: {
        semilla: 'images/maiz/maiz.webp',
        brote:   'images/maiz/maiz_brote.webp',
        frutos:  'images/maiz/maiz_frutos.webp',
        madura:  'images/maiz/maiz_maduro.webp',
        seca:    'images/maiz/maiz_seco.webp',
      },
    });

    // Propiedades propias de Maíz — van DESPUÉS de super()
    this.colorUI = '#c8a400'; // Color que se muestra en la UI
    this.icono   = '🌽';     // Emoji identificador
  }

  // Sobreescritura de renderizar() — el Maíz tiene su propio orden visual.
  // Nota: el padre (Planta.js) también tiene un renderizar(). Este lo reemplaza
  // solo para las instancias de Maiz; las otras plantas no se ven afectadas.
  renderizar() {
    if (this.estaMuerta) return this.rutasEstados.seca;
    if (this.estado === 'lista') return this.rutasEstados.frutos;

    if (this.progresoCrecimiento < 25) return this.rutasEstados.semilla;
    if (this.progresoCrecimiento < 60) return this.rutasEstados.brote;
    return this.rutasEstados.madura;
  }
}


// ──────────────────────────────────────────────────────────────
//  🎫 TICKET 1 — Clase Fresa
//
//  La fresa es el cultivo "rápido y frágil":
//    · Crece más rápido que el Maíz (8 segundos).
//    · Vale menos al cosechar (10 oro).
//    · Es mucho más sensible al calor — pierde agua un 50% más
//      rápido que una planta normal.
//
//  Tu misión:
//    1. Completar el constructor con super() y sus propiedades propias.
//    2. Implementar deshidratar() con la tasa de pérdida aumentada.
// ──────────────────────────────────────────────────────────────

export class Fresa extends Planta {
  constructor() {
    // TODO [1a] — Llama a super() con la configuración de la Fresa.
    //   Mira cómo lo hace Maiz justo arriba: le pasa un objeto con
    //   nombre, tiempoCrecimiento, valor, rutaImagen y rutasEstados.
    //   ¿Cuánto tarda en crecer la fresa? ¿Cuánto oro da?
    // Solución Ticket 1a
    super({
      nombre:            'Fresa',
      tiempoCrecimiento: 8,
      valor:             10,
      rutaImagen:        'images/fresa/fresa_semillas.webp',
      rutasEstados: {
        semilla: 'images/fresa/fresa.webp',
        brote:   'images/fresa/fresa_brote.webp',
        frutos:  'images/fresa/fresa_frutos.webp',
        madura:  'images/fresa/fresa_madura.webp',
        seca:    'images/fresa/fresa_seca.webp',
      },
    });

    // Solución Ticket 1b
    this.colorUI = '#c0392b';
    this.icono   = '🍓';
  }

  // La fresa sobreescribe deshidratar() porque pierde agua más rápido que
  // cualquier otra planta — si no la riegas seguido, muere en segundos.
  deshidratar(deltaTiempoSegundos, factorAspersores = 1) {
    // Solución Ticket 1c
    const tasaBase = 18; // 12 + 50%
    const reduccion = (deltaTiempoSegundos * tasaBase) / factorAspersores;

    if (!this.estaMuerta) {
      this.nivelHidratacion = Math.max(0, this.nivelHidratacion - reduccion);
    }
  }

  // Solución EXTRA BONUS
  renderizar() {
    if (this.estaMuerta) return this.rutasEstados.seca;
    if (this.estado === 'lista') return this.rutasEstados.madura;

    if (this.progresoCrecimiento < 15) return this.rutasEstados.semilla;
    if (this.progresoCrecimiento < 40) return this.rutasEstados.brote;
    return this.rutasEstados.frutos;
  }
}


// ──────────────────────────────────────────────────────────────
//  🎫 TICKET 2 — Clase Berenjena
//
//  La berenjena es el cultivo "lento y valioso":
//    · Es la más lenta de las tres (20 segundos).
//    · Es la más valiosa (30 oro base).
//    · Al cosecharla tiene un bono de rareza aleatorio:
//      puede dar entre un 0% y un 50% más de oro del valor base.
//
//  Tu misión:
//    1. Completar el constructor con super() y sus propiedades propias.
//    2. Implementar cosechar() con el bono aleatorio.
// ──────────────────────────────────────────────────────────────

export class Berenjena extends Planta {
  constructor() {
    // TODO [2a] — Llama a super() con la configuración de la Berenjena.
    //   Mismo patrón que Maiz y Fresa.
    //   ¿Cuánto tarda? ¿Cuánto oro da?
    // Solución Ticket 2a
    super({
      nombre:            'Berenjena',
      tiempoCrecimiento: 20,
      valor:             30,
      rutaImagen:        'images/berenjena/berenjena_semillas.webp',
      rutasEstados: {
        semilla: 'images/berenjena/berenjena.webp',
        brote:   'images/berenjena/berenjena_brote.webp',
        frutos:  'images/berenjena/berenjena_frutos.webp',
        madura:  'images/berenjena/berenjena_madura.webp',
        seca:    'images/berenjena/berenjena_seca.webp',
      },
    });

    // Solución Ticket 2b
    this.colorUI = '#6c3483';
    this.icono   = '🍆';
  }

  // La berenjena sobreescribe cosechar() para agregar su bono de rareza.
  // El padre (Planta.js) devuelve: this.valor * bonusSuperSuelo
  // La berenjena hace lo mismo PERO multiplica además por un factor aleatorio.
  cosechar(bonusSuperSuelo = 1) {
    // Solución Ticket 2c
    // Paso 1
    if (this.estado !== 'lista') return 0;

    // Paso 2
    const bonoRareza = 1.0 + (Math.random() * 0.5);

    // Paso 3
    return Math.round(this.valor * bonusSuperSuelo * bonoRareza);
  }
}


// ──────────────────────────────────────────────────────────────
//  🎫 TICKET 3 — Activar los cultivos en el catálogo
//
//  Cuando tus dos clases estén funcionando, descomenta las líneas
//  de abajo para que el juego pueda sembrarlas.
//  Es el interruptor final: sin esto, el juego no sabe que existen.
// ──────────────────────────────────────────────────────────────

export const CATALOGO_CULTIVOS = {
  maiz:      Maiz,
  fresa:     Fresa,      // Solución Ticket 3
  berenjena: Berenjena,  // Solución Ticket 3
};


// ──────────────────────────────────────────────────────────────
//  Las siguientes secciones ya están implementadas — no las toques.
// ──────────────────────────────────────────────────────────────

export const CATALOGO_VISUAL = {
  maiz: {
    nombre: 'Maíz', icono: '🌽', colorUI: '#c8a400',
    tiempoCrecimiento: 12, valor: 15,
    rutaImagen: 'images/maiz/maiz_semillas.webp',
    implementado: true,
  },
  fresa: {
    nombre: 'Fresa', icono: '🍓', colorUI: '#c0392b',
    tiempoCrecimiento: 8, valor: 10,
    rutaImagen: 'images/fresa/fresa_semillas.webp',
    implementado: true, // Solución Ticket 3: Habilitar Fresa en la UI
  },
  berenjena: {
    nombre: 'Berenjena', icono: '🍆', colorUI: '#8e44ad',
    tiempoCrecimiento: 20, valor: 30,
    rutaImagen: 'images/berenjena/berenjena_semillas.webp',
    implementado: true, // Solución Ticket 3: Habilitar Berenjena en la UI
  },
};

export function crearCultivo(tipoCultivo) {
  const Constructor = CATALOGO_CULTIVOS[tipoCultivo];
  if (!Constructor) throw new Error(`Cultivo no implementado: ${tipoCultivo}`);
  return new Constructor();
}


// ════════════════════════════════════════════════════════════════
//  🔥 EXTRA BONUS — Sobreescribir renderizar() en la Fresa
// ════════════════════════════════════════════════════════════════
//
//  La Fresa crece más rápido que el Maíz, pero usa el renderizar()
//  heredado de Planta, que fue diseñado para tiempos más lentos.
//  Resultado: visualmente parece que no cambia hasta el final.
//
//  Tu misión: agrega un método renderizar() a la clase Fresa
//  (justo debajo de su deshidratar()) con una progresión visual
//  que haga sentido para su velocidad de crecimiento.
//
//  El renderizar() de Maiz puede servirte de inspiración.
//  Los umbrales (25, 60) son solo números — en la Fresa,
//  ¿qué porcentajes de progreso tienen más sentido?
//
//  Pista: una planta rápida debería verse en brote mucho antes
//  del 30% de progreso que usa el padre por defecto.