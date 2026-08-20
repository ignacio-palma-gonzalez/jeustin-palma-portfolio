# Jeustin Palma — sitio web

Sitio estático premium. Sin frameworks, sin `npm install`, sin compilación.
Se edita con Visual Studio Code y se sube tal cual a cualquier hosting.

## Archivos

| Archivo         | Qué contiene                                                  |
|-----------------|---------------------------------------------------------------|
| `index.html`    | Estructura y todos los textos                                 |
| `styles.css`    | Colores, tipografías y diseño. Todo lo global está en `:root`  |
| `main.js`       | Animaciones, marquesina, lightbox y formulario                |
| `assets/img/`   | Las 8 fotos                                                   |
| `assets/fonts/` | Kanit y Space Grotesk (van con el sitio, no dependen de nadie) |
| `.htaccess`     | Compresión, caché y MIME para Hostinger y similares            |

## Cómo trabajarlo

1. En VS Code: **Archivo → Abrir carpeta…** y elegí esta carpeta.
2. Instalá la extensión **Live Server**, clic derecho en `index.html` →
   *Open with Live Server*. Se recarga solo al guardar.

Abrirlo con doble clic también funciona, pero hay que refrescar a mano.

## Lo que vas a querer cambiar

**Textos y enlaces** → `index.html`. Todo lo que está entre corchetes es un
marcador pendiente de completar:

- `[00]+` y `[000]+` — años tatuando y piezas realizadas, en la portada
- `[₡000.000]` — precios de cada estilo
- `[Contame acá cómo empezaste…]` — tu historia, en la sección *Artista*
- `[ciudad]`, `[Nombre del estudio]`, `[dirección, ciudad]`, `[correo@ejemplo.com]`
- `[Detallá acá tu política de depósito.]` — en *Tu cita*
- `[https://www.facebook.com/tu-perfil]` — en el pie

**Colores y tipografía** → arriba de `styles.css`, bloque `:root`.
La paleta es amatista: morado profundo, no neón. Los tres tonos salen del
mismo matiz:

```css
--accent:      #7B3FE4;  /* amatista: botones, puntos, líneas */
--accent-deep: #3E1A78;  /* violeta profundo: degradados y halos */
--accent-soft: #CBB6F2;  /* lila claro: numeritos y textos en hover */
```

Cambiando esas tres líneas se repinta el sitio entero. El amatista va en lo
gráfico (botones, iconos, líneas) y el lila en los textos pequeños, donde se
lee mucho mejor sobre negro.

**WhatsApp y marquesina** → arriba de `main.js`, bloque `CONFIG`:

```js
whatsapp: '50661461066',   // con código de país, solo dígitos
mensajeInicial: '...',     // texto con el que se abre el chat
mqVelocidad: 38,           // marquesina: píxeles por segundo
mqEmpuje: 0.9              // cuánto la empuja el scroll (0 = solo se mueve sola)
```

**Los números que suben solos**: un `<b data-count="100">0</b>` cuenta de 0 a
100 al entrar en pantalla. Cuando reemplaces `[00]+` por tu número real, podés
ponerle `data-count` para que también se anime.

## Qué trae

- **Carga de entrada** con el nombre descubriéndose, barra de progreso y
  contador 0→100. Al terminar sube como un telón y descubre la portada.
- **Marquesina de fotos** en dos filas que se mueven solas en sentidos
  opuestos. El scroll las empuja; al parar, siguen andando.
- **Riel lateral** en escritorio en vez de barra superior: la marca girada,
  el índice de secciones y la etiqueta que sale al pasar el cursor. En móvil
  se convierte en barra + menú a pantalla completa.
- **Portada a pantalla completa**: la foto de fondo se difumina hacia el negro
  con tres capas de velo, y el texto va encima.
- **Estilos con su foto**: un bloque por estilo, alternando el lado, con
  número, precio y botón de consultar.
- **Trabajos en carrusel horizontal**: se arrastra con el ratón o el dedo, con
  flechas y barra de avance. Si arrastraste, el clic no abre el lightbox.
- **Campo de luz**: dos halos de amatista van a la deriva detrás del nombre en
  la pantalla de carga y detrás de la frase. Duran 26 s y 34 s para que nunca
  se sincronicen. Se anima `transform`, no el degradado, que obligaría a
  repintar en cada fotograma.
- **Cursor propio** que se abre y dice "Ver" sobre las fotos.
- **Lightbox**: se navega con ← → y se cierra con Esc. Al cambiar de foto hace
  un fundido de 180 ms en vez de saltar de golpe.
- **Respuesta al pulsar**: botones, flechas y menú se hunden un 3% al tocarlos.
  Es el único movimiento del sitio que contesta al usuario en vez de decorar.
- **Fotos que entran como telón**, de abajo hacia arriba.
- **Titulares palabra por palabra**, parallax, botones magnéticos, barra de
  progreso de lectura y grano de película.
- **Formulario** que arma el mensaje y abre WhatsApp con el texto ya escrito.

## Detalles técnicos

- Las fuentes van dentro del sitio: se ve igual sin internet.
- Cada bloque de JS va envuelto en `safe()`: si uno falla, el resto sigue.
- Hay redes de seguridad por todos lados — si el JS no corre, los textos y las
  fotos igual se ven.
- Con `prefers-reduced-motion` activado se apaga el grano y el ticker va muy
  lento, pero la marquesina **no se congela**: baja a un cuarto de velocidad.
  Windows trae esa opción puesta en muchos equipos y un sitio quieto se lee
  como si estuviera roto.
- Sin desbordes horizontales, probado de 375 px a 1440 px.
- La pantalla de carga se muestra **una sola vez por sesión** (`sessionStorage`).
  En la segunda visita serían 3,7 s de peaje, no una bienvenida.
- Solo se anima `transform` y `opacity`, nunca `width`, `height` ni `padding`,
  que obligan al navegador a recalcular el diseño en cada fotograma.

## Sobre las fotos

Las 8 actuales son verticales y de 560×839 px (el retrato, 760×1139). Por eso el
diseño las usa siempre en vertical y nunca las estira a pantalla completa: una
banda horizontal a todo ancho se vería borrosa con ese tamaño.

**Lo que más levantaría el sitio es fotografía más grande.** Con imágenes de
1600 px de ancho o más se pueden abrir bandas a pantalla completa y una portada
a sangre entera. Si conseguís esas fotos, reemplazá los archivos de
`assets/img/` y avisame para ajustar el diseño.

## Para publicarlo

Subí todo el contenido de la carpeta (incluido `.htaccess` y las subcarpetas de
`assets/`) a la raíz de tu hosting. No hace falta ningún paso de compilación.

Si cambiás `styles.css` o `main.js` una vez publicado, subí el número de versión
en `index.html` (`styles.css?v=20260816` → `?v=20260817`) para que a tus
visitantes les llegue la versión nueva y no la vieja en caché.
