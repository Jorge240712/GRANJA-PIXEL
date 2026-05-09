# 🌾 PixelHarvest — Granja de Herencia

> **Proyecto:** PixelHarvest Clicker  
> **Cliente:** PixelSprout Games  
> **Agencia:** The Bit Masters  
> **Sprint:** M4 · Semana 3  
> **Estado:** 🟡 En desarrollo — pendiente de cultivos

---

## 📋 El Briefing del Cliente

**PixelSprout Games** es un estudio indie de dos personas que lleva seis meses construyendo
un juego de granja estilo clicker. Su juego ya tiene motor, tienda, mejoras y un campo
funcional con Maíz. El problema: su desarrolladora principal, **Valentina**, renunció la
semana pasada para irse a trabajar a un estudio en Japón.

Valentina dejó el código en buen estado. Las clases de `Fresa` y `Berenjena` están
declaradas pero vacías — ella alcanzó a diseñar la arquitectura y a escribir los assets
visuales, pero no alcanzó a implementar la lógica de herencia. El co-fundador del estudio,
**Marcos**, nos contrató con una sola condición:

> *"No me toquen la arquitectura. Valentina sabía lo que hacía. Solo necesito que alguien
> termine lo que ella dejó."*

El juego tiene fecha de demo en tres semanas. Nuestro trabajo empieza hoy.

---

## 📨 Mensaje del Tech Lead

```
DE:     Sebastián R. — Tech Lead, The Bit Masters
PARA:   Equipo de desarrollo — Sprint M4W3
ASUNTO: Tickets asignados — PixelHarvest
────────────────────────────────────────────────────────

Bienvenidos al proyecto PixelHarvest.

Acabo de hacer el onboarding del repositorio de Valentina.
El código está limpio, bien estructurado y es fácil de seguir
si leen con atención. Antes de tocar cualquier archivo, les
recomiendo leer completo Planta.js — es la clase padre de todo
y necesitan entenderla bien para no romper nada.

El único archivo que editan hoy es Cultivos.js.
Los demás ya están listos y funcionando.

Les asigné tres tickets para esta sesión. El primero es el
más guiado — es intencional, es para que agarren el ritmo.
El segundo les exige pensar un poco más. El tercero es trivial
pero es el momento más satisfactorio de la sesión: cuando por
primera vez siembren su propio cultivo en el juego.

Si terminan los tres antes de tiempo, hay un bonus al final
del archivo. No es obligatorio, pero los que lo resuelvan van
a tener una Fresa visualmente mucho más pulida que los demás.

Cualquier duda técnica, usen el canal. Cualquier duda de
diseño del juego, la documentación del cliente está abajo.

Suerte. — Seb
```

---
## 🎫 Tickets de la Sesión

---

### 🎫 TICKET 1 — Clase `Fresa`
**Prioridad:** Alta | **Estimado:** ~12 min

**Contexto del cliente:**
Marcos describe la fresa como *"el cultivo para jugadores ansiosos"*. Crece rápido, da poco
dinero, y muere fácil si no la riegas. Su intención es que los jugadores que la siembran
tengan que estar pendientes del juego constantemente — no pueden irse a hacer otra cosa.
Valentina ya definió el comportamiento en los comentarios del código.

**Lo que debes implementar:**

**[1a]** El `constructor()` con `super()` correctamente configurado.  
La fresa tiene valores específicos de tiempo y recompensa que la hacen diferente al Maíz.
Encuéntralos en los comentarios de `Cultivos.js`.

**[1b]** Las propiedades propias: `colorUI` e `icono`.  
Son dos líneas. El color y el emoji están en los comentarios como pista.

**[1c]** El método `deshidratar()` sobreescrito.  
Este es el que le da personalidad al cultivo. La fórmula base está en `Planta.js` —
tu trabajo es ajustar el único parámetro que cambia el comportamiento.

**Criterio de éxito:** La Fresa se puede sembrar, crece, se ve afectada por los Aspersores
de la tienda, y muere más rápido que el Maíz si no la riegas.

<details>
<summary>💡 Pista de Seb — solo si llevas más de 5 min bloqueado en [1c]</summary>

En `Planta.js` la `tasaBase` es `12`. Eso representa el porcentaje de hidratación que
pierde una planta genérica por segundo. Si la fresa pierde agua "un 50% más rápido",
la pregunta es: ¿cuánto es el 50% más de 12?

La fórmula de `reduccion` es exactamente igual a la del padre. Solo cambia ese número.

</details>

---

### 🎫 TICKET 2 — Clase `Berenjena`
**Prioridad:** Alta | **Estimado:** ~12 min

**Contexto del cliente:**
La berenjena es *"el cultivo para los pacientes"*, según Marcos. Tarda mucho más que los
demás, pero tiene un sistema de rareza: cuando la cosechas, el juego lanza un dado invisible
que puede darte hasta un 50% extra de oro. Marcos quería que hubiera algo de emoción en la
cosecha lenta — la espera tiene que valer la pena.

**Lo que debes implementar:**

**[2a]** El `constructor()` con `super()`.  
Ya hiciste este patrón en el Ticket 1. Esta vez los comentarios te dan menos andamiaje
a propósito — confía en lo que ya aprendiste.

**[2b]** Las propiedades propias: `colorUI` e `icono`.  
Mismo patrón que la Fresa.

**[2c]** El método `cosechar()` sobreescrito con bono de rareza.  
Este es el más interesante del día. El método está dividido en tres pasos en los comentarios
del código. Léelos en orden — cada uno depende del anterior.

**Criterio de éxito:** La Berenjena se puede sembrar y cosechar. Cada cosecha puede dar un
resultado distinto — si llamas a `console.log()` con el oro ganado varias veces, los números
varían entre sí.

<details>
<summary>💡 Pista de Seb — solo si llevas más de 5 min bloqueado en el bono aleatorio</summary>

`Math.random()` devuelve un número entre `0` (incluido) y `1` (no incluido).

Necesitas un número entre `1.0` y `1.5`. Piénsalo así:
- El mínimo que quieres es `1.0`.
- El máximo extra que puede sumar es `0.5`.
- `Math.random()` te da el "cuánto extra" entre 0 y ese máximo.

Escríbelo como: `1 + Math.random() * [el máximo extra]`.

</details>

---

### 🎫 TICKET 3 — Activar los cultivos en el catálogo
**Prioridad:** Media | **Estimado:** ~2 min

**Contexto del cliente:**
`CATALOGO_CULTIVOS` es el registro oficial de cultivos plantables en el juego. Si un cultivo
no está ahí, el motor lo rechaza y muestra un mensaje de error en lugar de sembrarlo.
Valentina dejó las líneas comentadas a propósito — es el interruptor final que solo se activa
cuando la clase está lista para no romper el juego a medias.

**Lo que debes implementar:**

Descomenta las dos líneas en `CATALOGO_CULTIVOS` que corresponden a `Fresa` y `Berenjena`.
Una vez descomentadas, ve al juego, compra semillas en la tienda, y siémbralas.

**Criterio de éxito:** Puedes sembrar los tres cultivos. La tienda los muestra disponibles.
El juego no lanza ningún error en la consola.

> ⚠️ **Importante:** Solo descomentes un cultivo cuando su clase esté completa.
> Si descomentás la línea antes de que la clase funcione, el juego va a crashear
> al intentar crear una instancia rota.

---

## 🔥 EXTRA BONUS — Sobreescribir `renderizar()` en la Fresa

**Sin estimado — para los que terminan antes.**

La Fresa hereda `renderizar()` de `Planta`, que fue diseñado pensando en un cultivo de
ritmo medio. El problema: la Fresa crece en 8 segundos, así que visualmente parece que
no cambia de aspecto hasta que ya casi está lista.

Tu misión es agregar un `renderizar()` propio a la clase `Fresa` — justo después de
`deshidratar()` — que le dé una progresión visual más coherente con su velocidad.

El método de `Maiz` es tu mejor referencia. Los números que cambian son los umbrales de
progreso (los `< 25` y `< 60` del Maíz). Para una planta que crece mucho más rápido,
¿esos umbrales tienen sentido? ¿A qué porcentaje debería verse el brote en una planta
que madura en 8 segundos?

No hay una respuesta única. Juega con los números, siembra fresas, y observa cómo
se ven en el campo. La prueba real es visual.

---

## 📐 Referencia Rápida — Valores de los Cultivos

| Cultivo    | Tiempo (s) | Oro base | Comportamiento especial        |
|------------|:----------:|:--------:|-------------------------------|
| 🌽 Maíz    | 12         | 15       | Visual personalizado (brote temprano) |
| 🍓 Fresa   | 8          | 10       | Pierde agua 50% más rápido    |
| 🍆 Berenjena | 20       | 30       | Bono de rareza +0% a +50% al cosechar |

---

## ✅ Checklist de entrega

Antes de avisar que terminaste, verifica:

- [ ] La Fresa se puede sembrar y cosechar sin errores en consola
- [ ] La Berenjena se puede sembrar y cosechar sin errores en consola
- [ ] Cada cosecha de Berenjena puede dar un resultado distinto (el bono es aleatorio)
- [ ] La Fresa muere más rápido que el Maíz si no la riegas
- [ ] Los Aspersores de la tienda afectan a los tres cultivos
- [ ] El Super-Suelo de la tienda afecta a los tres cultivos al cosechar
- [ ] No modificaste ningún archivo que no sea `Cultivos.js`

---

*The Bit Masters © 2026 — Sprint M4W3 · PixelHarvest para PixelSprout Games*