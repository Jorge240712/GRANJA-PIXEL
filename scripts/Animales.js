// ================================================================
// Animales.js  –  Subclases de Animal
// Tu tarea: implementar Pollo y Vaca usando herencia con 'extends'
// ================================================================

import { Animal } from './Animal.js';

// ================================================================
//  INSTRUCCIONES
//  → Este es el único archivo JS que debes completar hoy.
//  → Animal.js ya está listo — léelo antes de empezar.
//  → Corral.js ya está listo — no lo toques.
//  → El patrón es el mismo que aprendiste con Maíz, Fresa y Berenjena.
// ================================================================


// ──────────────────────────────────────────────────────────────
//  🎫 TICKET 1 — Clase Pollo
//
//  El pollo es el animal "rápido y barato":
//    · Crece relativamente rápido (20 segundos por fase).
//    · No da muchas monedas (20 por ciclo).
//    · Es el más barato de comprar (75 oro).
//    · Sus fases son: Huevo → Pollito → Adulto.
//    · Solo produce monedas cuando llega a Adulto.
//
//  Lo que debes implementar:
//    [1a] El constructor() con super() correctamente configurado.
//    [1b] Las propiedades propias: this.icono y this.colorUI.
// ──────────────────────────────────────────────────────────────

export class Pollo extends Animal {
  constructor() {
    // TODO [1a] — Llama a super() con la configuración del Pollo.
    //   Mira Animal.js para saber qué espera el constructor del padre.
    //   Necesitas pasar: nombre, tiempoFase, produccion, costoCompra,
    //                    nombresFases y rutasEstados.
    //
    //   Los valores del Pollo son:
    //     nombre:       'Pollo'
    //     tiempoFase:   20   (segundos por fase)
    //     produccion:   20   (monedas por ciclo de producción)
    //     costoCompra:  75   (oro para comprarlo)
    //     nombresFases: ['Huevo', 'Pollito', 'Adulto']
    //
    //   Las rutas de imagen ya están dadas — no las modifiques:
    super({
      nombre:       "Pollo",
      tiempoFase:   20,
      produccion:   20,
      costoCompra:  75,
      nombresFases: ["Huevo","Pollito","Adulto"],
      rutasEstados: {
        fases: [
          'images/pollo/pollo_huevo.webp',
          'images/pollo/pollito.webp',
          'images/pollo/pollo_adulto.webp',
        ],
        triste: 'images/pollo/pollo_triste.webp',
      },
    });

    // TODO [1b] — Agrega las propiedades propias del Pollo.
    //   Igual que Maíz tenía this.colorUI y this.icono, el Pollo también.
    //   Usa estos valores:
    //     this.icono   = '🐔'
    //     this.colorUI = '#e67e22'  (naranja)
    this.icono = "🐔";
    this.colorUI = "#e67e22";
  }
}


// ──────────────────────────────────────────────────────────────
//  🎫 TICKET 2 — Clase Vaca
//
//  La vaca es el animal "lento y valioso":
//    · Tarda más en crecer (30 segundos por fase).
//    · Da muchas más monedas (45 por ciclo).
//    · Es el más costoso de comprar (140 oro).
//    · Sus fases son: Bebé → Joven → Adulta.
//    · Tiene un bono: si su hambre es mayor o igual a 75,
//      produce 15 monedas EXTRA por encima de su producción base.
//
//  Lo que debes implementar:
//    [2a] El constructor() con super() — mismo patrón que el Pollo.
//    [2b] Las propiedades propias: this.icono y this.colorUI.
//    [2c] El método producirMonedas() sobreescrito con el bono.
// ──────────────────────────────────────────────────────────────

export class Vaca extends Animal {
  constructor() {
    // TODO [2a] — Llama a super() con la configuración de la Vaca.
    //   Mismo patrón que el Ticket 1 — ya conoces la estructura.
    //
    //   Valores de la Vaca:
    //     nombre:       'Vaca'
    //     tiempoFase:   30
    //     produccion:   45
    //     costoCompra:  140
    //     nombresFases: ['Bebé', 'Joven', 'Adulta']
    super({
      nombre:       "Vaca",
      tiempoFase:   30,
      produccion:   45,
      costoCompra:  140,
      nombresFases: ["Bebé","Joven","Adulta"],
      rutasEstados: {
        fases: [
          'images/vaca/vaca_bebe.webp',
          'images/vaca/vaca_joven.webp',
          'images/vaca/vaca_adulta.webp',
        ],
        triste: 'images/vaca/vaca_triste.webp',
      },
    });

    // TODO [2b] — Propiedades propias de la Vaca:
    //   this.icono   = '🐄'
    //   this.colorUI = '#27ae60'  (verde)
    this.icono = "🐄";
    this.colorUI = "#27ae60";
  }

  // La Vaca sobreescribe producirMonedas() para añadir un bono de bienestar.
  // Una vaca bien alimentada (hambre >= 75) produce 15 monedas extra.
  producirMonedas() {
    // TODO [2c] — Implementa el método con el bono de bienestar.
    //
    //   Paso 1: Si la vaca no es adulta O está triste, retorna 0.
    //           (misma condición de guarda que en Animal.js)
        if (!this.esAdulto() || this.estaTriste) return 0;
    //
    //   Paso 2: Si this.hambre >= 75, retorna this.produccion + 15.
    //           Si no, retorna this.produccion normal.
        if (this.hambre >= 75){
            return this.produccion + 15;
        } 
        return this.produccion;
    //
    //   Pista: this.produccion ya tiene el valor base que pasaste en super().
  }
}

export class Caballo extends Animal{
  constructor(){
    super({
      nombre : "Caballo",
      tiempoFase : 40,
      produccion : 60,
      costoCompra : 200,
      nombresFases : ["Caballito","Joven","Adulto"],
      rutasEstados : {
        fases :  [
          "images/caballo/caballito.png",
          "images/caballo/caballo_juvenil.png",
          "images/caballo/caballo_adulto.png",
        ],

        triste : "caballo_triste.png",
      }
    });
    this.icono = "🐴";
    this.colorUI = "#00FFFF";
  }
}

// ──────────────────────────────────────────────────────────────
//  🎫 TICKET 3 — Registrar los animales (2 líneas)
//
//  Esta función la usa Corral.js para crear nuevas instancias.
//  Cuando tus dos clases estén implementadas, descomenta las líneas
//  que corresponden a cada animal para que el corral pueda usarlos.
// ──────────────────────────────────────────────────────────────

export function crearAnimal(tipo) {
  // TODO: descomenta la línea cuando la clase esté lista
   if (tipo === 'pollo') return new Pollo();
   if (tipo === 'vaca')  return new Vaca();
   if(tipo === "caballo") return new Caballo();
  throw new Error('Animal no implementado aún: ' + tipo);
}


// ──────────────────────────────────────────────────────────────
//  Catálogo visual — no lo modifiques
//  Corral.js lo usa para mostrar la tienda de animales.
// ──────────────────────────────────────────────────────────────

export const CATALOGO_ANIMALES_VISUAL = {
  pollo: {
    nombre: 'Pollo', icono: '🐔', colorUI: '#e67e22',
    costoCompra: 75, produccion: 20,
    descripcion: 'Rápido de criar. Da pocas monedas pero crece enseguida.',
    rutaImagen: 'images/pollo/pollo_huevo.webp',
  },
  vaca: {
    nombre: 'Vaca', icono: '🐄', colorUI: '#27ae60',
    costoCompra: 140, produccion: 45,
    descripcion: 'Lenta pero muy rentable. Si la cuidas bien da monedas extra.',
    rutaImagen: 'images/vaca/vaca_bebe.webp',
  },
  caballo: {
    nombre: 'Caballo', icono: '🐴', colorUI: '#00FFFF',
    costoCompra: 200, produccion: 60,
    descripcion: 'Lento de criar. Da muchas monedas pero crece más lento.',
    rutaImagen: 'images/caballo/caballito.png',
  },
};