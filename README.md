# Carta del Trigésimo Octavo Sello

Página de una sola vista con cinco escenas consecutivas. La carta aparece sobre un ambiente oscuro, revela el dragón con fuego, gira al hacer clic y se transforma en el fondo sobre el que aparece el relato. Al aceptar el ritual, el texto cambia a rojo y desaparece; un sello animado enlaza esa salida con la convocatoria sobre el mismo fondo.

Este documento describe **la implementación actual** de `index.html`, `styles.css` y `script.js`. Los tiempos indicados son aproximados porque algunas animaciones se superponen y la aparición del texto depende de la carga de la fuente.

## Archivos y responsabilidades

| Ruta | Función |
| --- | --- |
| `index.html` | Estructura de las escenas, imágenes, relato y controles invisibles de la carta y la mano. Carga CSS, GSAP y JS con `defer`. |
| `styles.css` | Composición, perspectiva 3D, colores, tipografía, fuego, pulso, diseño adaptable y animaciones de respaldo. |
| `script.js` | Crea partículas y fuego, coordina las animaciones GSAP, responde al mouse y a los dos clics. |
| `vendor/gsap.min.js` | Copia local de GSAP. Se carga antes de `script.js`. |
| `img/sin-dragon.png` | Cara inicial de la carta. |
| `img/dragon.png` | Capa que se descubre sobre la cara inicial. |
| `img/fondo.jpg` | Reverso de la carta y fondo ampliado. Su tamaño actual es 736 × 1104 px. |
| `img/mano-clic.png` | Mano del control «aceptar el ritual». |
| `img/lineas.png`, `img/externo.png`, `img/triangulo.png`, `img/interno.png` | Capas transparentes del sello de transición entre las escenas 4 y 5. |
| `img/sello38.png` | Emblema horizontal de la convocatoria en la escena 5. |
| `img/reloj-arena.png`, `img/torre.png` | Iconos de 85 × 85 px sobre la fecha y la dirección. |
| `img/pocima.png` | Icono bajo el texto de las ofrendas. |
| `img/sello-100 - copia.png` | Icono rojo de la indicación para contactar al anfitrión. |
| `img/tela.png` | Tela oscura rasgada detrás de la indicación de contacto. |
| `fonts/IslandMoments-Regular.ttf` | Fuente del relato. El archivo es regular; el grosor `700` se solicita desde CSS. |
| `fonts/KolkerBrush-Regular.ttf` | Fuente local del texto de la tela de contacto. |
| `fonts/KolkerBrush-OFL.txt` | Licencia de distribución de Kolker Brush. |

Hay otros archivos en `img/`, pero estos catorce recursos gráficos son los que utiliza la página actual.

## Recorrido de las cinco escenas

```text
Carga de página
  → Escena 1: carta inicial + fuego + dragón
  → clic en la carta
  → Escena 2: giro + expansión de fondo.jpg
  → Escena 3: relato letra por letra + mano con pulso
  → clic en «aceptar el ritual»
  → Escena 4: texto rojo + desaparición del texto y la mano
  → Transición: sello en capas, opacidad de 0.2, rojo y giro más lento
  → Escena 5: convocatoria + sello38.png sobre fondo.jpg
```

### Escena 1 — Aparición de la carta

- `index.html` coloca `.card-wrap` en el centro de `.card-area`. La cara frontal combina `.card-image` (`sin-dragon.png`) y `.card-dragon` (`dragon.png`), inicialmente recortada mediante `clip-path`. Debajo de la carta, el enlace `.skip-ritual` reutiliza `mano-clic.png` y permite ir directamente a la escena 5.
- `styles.css` define el fondo oscuro, la textura de grano, el aura, dos órbitas y la perspectiva de `1100px`. La carta conserva la proporción `984 / 1599`.
- `script.js` genera 42 partículas ambientales, 13 lenguas de fuego y 20 brasas con posiciones pseudoaleatorias reproducibles (`seed = 27`). La animación de entrada de `.card-wrap` dura `1.5s` y comienza tras `0.18s`.
- `revealTimeline` espera `1s`, enciende `#fire-sweep` y descubre el dragón durante `2.4s`. Al terminar, `finishReveal()` quita el recorte restante y actualiza el texto alternativo de la imagen base.
- El movimiento del mouse se escucha en `document`. `gsap.quickTo()` inclina `.card-wrap` en los ejes X/Y según cercanía y aumenta levemente su escala. Al salir el puntero o perder foco la ventana, vuelve a su estado inicial. No responde a punteros táctiles.
- Al activar `#skip-to-invitation`, `goDirectlyToInvitation()` detiene el revelado inicial, desactiva los controles intermedios, muestra `fondo.jpg` a toda la vista y coloca el sello rojo al `20%` con sus dos anillos girando a `16.2s` por vuelta. Después llama a `showInvitation()`. El enlace apunta a `#invitation`, así que el salto también funciona mediante CSS si JavaScript no llega a ejecutarse.

### Escena 2 — Giro y acercamiento

- La carta tiene un `<input type="checkbox" id="card-turn-toggle">` transparente que cubre su superficie. Con GSAP, un `pointerdown` dentro de los límites visibles de la carta inicia `turnCard()`; el evento `change` del checkbox cubre la activación por teclado.
- `isTransitioning` evita iniciar dos veces la secuencia y desactiva el movimiento con el mouse. Si el fuego aún está activo, se detiene y se muestra el dragón completo.
- GSAP devuelve primero la inclinación a cero (`0.4s`) y gira `#card-flip` `180°` sobre el eje Y (`1.05s`). La cara posterior `.card-face--back` usa `img/fondo.jpg`.
- Al acabar el giro, `zoomIntoBack()` coloca `#zoom-backdrop` exactamente sobre los límites actuales de la carta, oculta la carta y expande ese fondo hasta `left: 0`, `top: 0` y `width: window.innerWidth` durante `1.45s`. Su altura es el mayor valor entre la altura de la ventana y el ancho multiplicado por `1104 / 736`.
- `finishImmersion()` añade `.is-immersed` a `#scene`. Esta clase oculta los adornos y la carta inicial. `#zoom-backdrop` queda visible y conserva el fondo a todo el ancho. Un evento `resize` recalcula sus dimensiones.

### Escena 3 — Relato y mano

- `finishImmersion()` llama automáticamente a `showStory()`; no se necesita otro clic.
- El relato está en `#story-text` dentro de `index.html`. CSS lo centra con `.story-text__inner { margin: auto; }`, permite desplazamiento vertical si no cabe y usa Island Moments en negrita solicitada (`font-weight: 700`). El color inicial es `#314337`.
- `showStory()` divide el texto de cada párrafo en grafemas `.story-letter`, conservando los espacios y los elementos `<strong>`. Espera a la fuente un máximo de `1.5s` y revela las letras con GSAP (`0.7s` por letra, `stagger: 0.009s`).
- Cuando termina la aparición de las letras, GSAP muestra `.ritual-prompt` durante `0.8s`. Este control contiene el checkbox `#ritual-accept-toggle`, `mano-clic.png` y la etiqueta «aceptar el ritual».
- El anillo y el brillo de `.ritual-prompt__icon` pulsan continuamente con los `@keyframes` `ritual-pulse` y `ritual-glow`, ambos de `3.8s`.

### Escena 4 — Aceptación y desaparición

- El evento `change` de `#ritual-accept-toggle` activa la escena una sola vez mediante `isAccepted`. El checkbox se deshabilita para impedir repeticiones.
- CSS aumenta la mano a `scale(1.14)`, intercambia la imagen por una máscara roja y desvanece la etiqueta «aceptar el ritual».
- GSAP cambia cada `.story-letter` al rojo `#a52d2b`, de arriba hacia abajo en orden de lectura (`duration: 0.4s`, `stagger: 0.0015s`). Tras `0.12s` comienza el desvanecimiento de todo `#story-text`, incluida la mano, durante `0.65s`.
- Al finalizar el desvanecimiento, el `onComplete` de la línea de tiempo llama a `startSigilTransition()`. Un temporizador nativo, calculado a partir de la duración de esa línea de tiempo más `250ms`, actúa como respaldo si el callback no se ejecuta. La transición solo puede iniciarse una vez. El fondo ampliado `#zoom-backdrop` permanece visible.

### Transición entre las escenas 4 y 5 — Sello en capas

- `#ritual-sigil` está entre el relato y la convocatoria en `index.html`. Sus cuatro imágenes ocupan el mismo contenedor centrado: `lineas.png`, `externo.png`, `triangulo.png` e `interno.png`. `triangulo.png` tiene otra proporción y se ajusta con `object-fit: contain`.
- `startSigilTransition()` muestra primero las líneas. Después entran el anillo externo, el triángulo y el anillo interno. Solo giran los dos anillos: el externo en sentido horario y el interno en sentido contrario. El triángulo aparece sin rotar y permanece fijo, igual que la base de líneas.
- Al comenzar la bajada de opacidad, los anillos continúan girando a `5.4s` por vuelta. GSAP baja **todo el sello** a `0.2` durante `0.75s`. Al terminar, el conjunto se colorea de rojo durante `0.9s` y los anillos pasan a `16.2s` por vuelta, tres veces el tiempo de la fase anterior. Después aparece la convocatoria. Un temporizador nativo actúa como respaldo si se interrumpe el callback de GSAP. Líneas y triángulo permanecen quietos.
- Si GSAP no carga, CSS ejecuta una secuencia equivalente y `script.js` muestra la convocatoria tras `6.05s` desde el inicio del sello. Si tampoco hay JS, el selector `:has()` activa la transición y la convocatoria con tiempos CSS. Con movimiento reducido, sello y convocatoria aparecen sin giros.

### Escena 5 — Convocatoria

- `#invitation` está en `index.html` después del relato. Contiene el titular «EL RITUAL DEBE CUMPLIRSE», `img/sello38.png` centrada, la convocatoria, la fecha, el lugar y la sección de ofrendas. `reloj-arena.png` y `torre.png` aparecen sobre sus respectivos datos; `pocima.png` aparece bajo el texto de las ofrendas.
- `showInvitation()` desplaza esta sección al inicio y añade `.is-visible`. Con GSAP revela los bloques marcados con `data-reveal` de forma escalonada (`0.8s` por bloque, `stagger: 0.11s`). Si se prefiere movimiento reducido, aparece de inmediato.
- `styles.css` usa una serif local del sistema con alternativas (`Palatino`, `Georgia`, `Times New Roman`), tinta verde oscura, líneas divisorias y un ancho máximo de `920px`. En pantallas estrechas, la fecha y dirección pasan de dos columnas a una.
- La tarjeta `.invitation__contact-card` enlaza al grupo de WhatsApp del Cónclave. Sobre `img/tela.png` muestra la introducción en serif Palatino/Georgia, `img/sello-100 - copia.png` y la invocación en Kolker Brush blanco de menor tamaño, todo centrado y con más espacio interior. La imagen tiene fondo blanco integrado; CSS usa `mix-blend-mode: multiply` para fusionarlo con el pergamino de la página. En pantallas estrechas, el bloque aumenta su altura y ajusta el espacio lateral.
- La sección ocupa la ventana y permite desplazamiento vertical. El fondo de pergamino y el sello rojo al `20%` permanecen fijos detrás; los dos anillos siguen girando lentamente. Si GSAP no carga pero sí se ejecuta `script.js`, el sello empieza `1.65s` después de aceptar y la convocatoria aparece tras su animación. Si tampoco se ejecuta JS, `fallback-invitation` la muestra con CSS.

## Guía para cambiar valores

Los valores están distribuidos entre JS y CSS. Al modificar una propiedad que existe en ambas rutas, conviene actualizar las dos para conservar el mismo comportamiento con y sin GSAP.

| Qué cambiar | Valor actual | Dónde |
| --- | --- | --- |
| Fondo base oscuro | `#0b0d0b` | `styles.css`: `--ink`, `.scene` y `index.html`: `theme-color` |
| Color inicial del relato y la mano | `#314337` | `styles.css`: `.story-text`, `.ritual-prompt`, aura y foco de la mano |
| Rojo del relato y la mano | `#a52d2b` | `script.js`: aceptación; `styles.css`: máscara de mano y `fallback-text-red` |
| Fuente, tamaño y grosor del relato | Island Moments; `clamp(29px, 3vw, 43px)`; `700` | `styles.css`: `@font-face`, `.story-text p` y regla móvil |
| Texto narrativo y etiqueta | Tres `<p>` y `.ritual-prompt__label` | `index.html` |
| Partículas ambientales | `42` | `script.js`: primer bucle `for`; aspecto en `.particle` de `styles.css` |
| Lenguas de fuego y brasas | `13` y `20` | `script.js`: segundo y tercer bucle `for`; aspecto y velocidad por elemento en `styles.css` |
| Retraso y barrido de fuego | `1s` y `2.4s` | `script.js`: `revealTimeline`; respaldo en `fallback-dragon` y `fallback-fire` de `styles.css` |
| Intensidad del efecto 3D | Hasta `7°` por eje y escala máxima `1.05` | `script.js`: `onMove()`, `tiltX`, `tiltY`, `approach` |
| Suavidad del efecto 3D | `0.6s` para giro; `0.7s` para acercamiento | `script.js`: `gsap.quickTo()` |
| Velocidad de giro | `1.05s` | `script.js`: `turnCard()`; respaldo `fallback-flip` en `styles.css` |
| Velocidad de expansión | `1.45s` | `script.js`: `zoomIntoBack()`; respaldo `fallback-zoom` en `styles.css` |
| Proporción del fondo expandido | `1104 / 736` | `script.js`: `backdropAspect`; coincide con el archivo actual `img/fondo.jpg` |
| Aparición del relato | `0.7s` por letra, separación de `0.009s` | `script.js`: `showStory()` |
| Pulso de la mano | Ciclo de `3.8s` | `styles.css`: `.ritual-prompt__icon::before`, `::after` y sus `@keyframes` |
| Rojo y desaparición del relato | `0.4s`, separación de `0.0015s`, pausa de `0.12s`, salida de `0.65s` | `script.js`: evento de `ritualToggle`; respaldo en reglas `fallback-text-red` y `fallback-story-exit` de `styles.css` |
| Tamaño del sello de transición | `min(84vw, 72svh, 620px)` de ancho | `styles.css`: `.ritual-sigil__art` |
| Giro, color y opacidad del sello | `1.8s` de giro inicial; `5.4s` durante la bajada a `0.2`; luego rojo y `16.2s` por vuelta; cambio de color de `0.9s` | `script.js`: `startSigilTransition()`; filtro `--sigil-red-filter` y respaldo `sigil-*` en `styles.css` |
| Aparición de la convocatoria | `0.8s` por bloque, separación de `0.11s` | `script.js`: `showInvitation()`; respaldo `fallback-invitation` en `styles.css` |
| Ancho y tipografía de la convocatoria | Máximo `920px`; serif Palatino/Georgia | `styles.css`: `.invitation__content` y reglas `.invitation__*` |
| Imagen del sello | `img/sello38.png`, 1774 × 887 px | `index.html`: `.invitation__seal img`; ancho visible en `styles.css` |
| Tela de contacto | PNG de `1563 × 1006`, ancho máximo visible de `760px`; introducción serif y llamada en Kolker Brush blanco | `img/tela.png`, `fonts/KolkerBrush-Regular.ttf`; `styles.css`: `.invitation__contact-*` |

La duración total del barrido rojo depende de cuántas letras tenga el relato: aproximadamente `0.4s + (cantidad de letras − 1) × 0.0015s`. Después se suman la pausa de `0.12s` y la salida de `0.65s`.

## Estados y rutas de animación

| Estado o selector | Uso |
| --- | --- |
| `isTransitioning` | Bloquea más clics y detiene el 3D desde el inicio del giro. |
| `isAccepted` | Impide aceptar el ritual más de una vez. |
| `sigilTransitionStarted` | Impide iniciar dos veces la transición del sello. |
| `.gsap-ready` en `<body>` | Señala que GSAP está disponible y desactiva las animaciones CSS de respaldo. |
| `.js-ready` en `<body>` | Indica que `script.js` terminó de registrar los eventos; la aparición CSS de la escena 5 queda como respaldo solo cuando no hay JS. |
| `.is-immersed` en `#scene` | Mantiene el fondo y oculta la composición inicial tras el zoom. |
| `.is-visible` en `#story-text` | Hace visible e interactivo el relato. |
| `.is-visible` en `#invitation` | Muestra la convocatoria tras desaparecer el relato. |
| `.is-active`, `.is-background` e `.is-red` en `#ritual-sigil` | Muestran el sello, lo mantienen al `20%` y cambian las cuatro capas a rojo detrás de la convocatoria. |

Si GSAP no carga, las reglas `body:not(.gsap-ready)` de `styles.css` utilizan los checkboxes para ejecutar el giro, zoom, revelado, salida y animación del sello mediante `@keyframes`; `script.js` coordina el paso final a la convocatoria. Si tampoco carga JS, el selector `:has()` coordina toda esa ruta con tiempos CSS. Si el sistema indica `prefers-reduced-motion: reduce`, se omiten o simplifican el fuego inicial, el revelado letra por letra, el pulso y el giro del sello; con GSAP cargado, el giro y el zoom de la carta siguen ejecutándose.

## Mantenimiento

1. Editar el contenido del relato en `index.html`. `showStory()` procesa los nodos de texto que encuentre dentro de los párrafos de `#story-text`.
2. Ajustar las animaciones principales en `script.js` y, cuando corresponda, sus equivalentes de respaldo en `styles.css`.
3. Si se reemplaza `img/fondo.jpg` por otra imagen con proporción distinta, actualizar `backdropAspect` en `script.js`.
4. Revisar el resultado en una ventana ancha y una estrecha: en pantallas pequeñas el relato puede necesitar desplazamiento vertical.
5. Editar los datos de la convocatoria directamente en `#invitation` de `index.html`; ajustar su composición en las reglas `.invitation__*` de `styles.css`.

La documentación se basa en el código actual; no equivale a una prueba visual de la secuencia en el navegador.
