# 🎨 StockMarket — Frontend rediseñado

Rediseño completo del frontend de tu aplicación de inventario con **diseño moderno, vibrante y 100% responsive**.

## ✨ Lo que cambió

### 🎯 Sistema de diseño nuevo
- **Tipografías distintivas**: `Sora` (display, headings) + `Plus Jakarta Sans` (body) en lugar de fuentes genéricas
- **Paleta vibrante**: Indigo + Teal como colores primarios con acentos semánticos (success/warning/danger/info)
- **Variables CSS centralizadas** en `index.css` (`--brand-*`, `--accent-*`, `--shadow-*`, etc.) para mantenimiento fácil
- **Gradientes y glow-shadows** en botones primarios y KPIs
- **Animaciones suaves**: fade-in, stagger, pulse para alertas críticas

### 📱 Responsive (mobile-first)
| Pantalla | Navegación |
|----------|------------|
| 📱 Móvil (<1024px)  | Top bar + drawer lateral + **bottom nav** sticky con safe-area |
| 💻 Desktop (≥1024px) | Sidebar fijo de 288px con resaltado de ítem activo |

- Tablas se convierten en **tarjetas apiladas** en móvil (Inventario)
- Grid adaptable: 1 col móvil → 2 cols tablet → 3 cols desktop
- Inputs con tamaño confortable para tap en móviles
- Botones colapsan a iconos cuando hay poco espacio

### 🧩 Componentes mejorados
- **Login**: split-screen con panel decorativo (gradientes, grid pattern), toggle mostrar contraseña, estado de loading, manejo de errores inline
- **Dashboard**: KPI cards con iconos en gradient, chart con gradient bars (recharts mejorado), grid de productos críticos con estado vacío "todo en orden"
- **Inventario**: filtros toggle con estado visual, formulario de edición desplegable + cancelable, **chips de estado** (Stock bajo / Por vencer / OK) por producto
- **Productos**: layout 2 columnas con **panel de herramientas inteligentes** desplegables (OCR/Scanner/Excel) + formulario principal con validación visual + sistema de feedback (toasts)
- **Alertas**: tarjetas con stripe rojo, badge pulsante con conteo, cálculo de déficit, estado vacío celebratorio
- **OCRUploader**: dropzone con preview de imagen, indicador de progreso, área scrolleable para texto detectado
- **BarcodeScanner**: header con icono, marco contenedor estilizado

### ♿ Accesibilidad
- Roles ARIA (`dialog`, `aria-modal`, `aria-label`)
- Focus visible con `box-shadow` glow
- Contraste WCAG AA en todos los textos
- Inputs con `autoComplete` apropiado en login

### 🚫 Lo que NO cambió
- ✅ **Toda la lógica de negocio** se mantiene intacta
- ✅ **Servicios** (`authService`, `productService`, `exportService`, `importService`) sin tocar
- ✅ **Rutas** (`AppRoutes`, `ProtectedRoute`) sin tocar
- ✅ Las **firmas de funciones** y props de componentes son idénticas

## 📁 Archivos modificados

```
src/
├── index.css                       ← NUEVO sistema de diseño
├── layouts/
│   └── MainLayout.jsx              ← Sidebar + bottom nav responsive
├── components/
│   ├── OCRUploader.jsx             ← Dropzone con preview
│   └── BarcodeScanner.jsx          ← Header estilizado
└── pages/
    ├── Login.jsx                   ← Split-screen
    ├── Dashboard.jsx               ← KPIs + chart + críticos
    ├── Inventory.jsx               ← Tabla desktop / cards móvil
    ├── Products.jsx                ← Panel herramientas + formulario
    └── Alerts.jsx                  ← Cards con stripe + pulsing badge
```

## 🚀 Instalación

1. **Copia los archivos** sobre tu proyecto existente (respeta la estructura `src/...`)

2. **Asegúrate de importar `index.css`** en tu `main.jsx`:
   ```jsx
   import "./index.css";
   ```

3. **No necesitas instalar paquetes nuevos** — todo usa lo que ya tienes (`tailwindcss`, `recharts`, `tesseract.js`, `html5-qrcode`, `react-router-dom`).

4. La **fuente de Google Fonts** se importa automáticamente desde `index.css` (no requiere configuración extra).

5. **Tailwind config**: si tu `tailwind.config.js` no incluye los paths, asegúrate de tener:
   ```js
   content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"]
   ```

## 🎨 Personalización rápida

Cambia los colores del brand editando `src/index.css`:

```css
:root {
  --brand-500: #6366f1;  /* color primario */
  --brand-600: #4f46e5;  /* hover/dark */
  --accent-500: #14b8a6; /* acento (teal) */
}
```

Cualquier cambio se propaga automáticamente a todos los componentes. 🎯
