import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import BarcodeScanner from "../components/BarcodeScanner";

/* ============================================================
   STORAGE
   ============================================================ */
const STORAGE_KEY = "stockmarket.catalog.v1";

function getCatalog() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCatalog(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function clearCatalog() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_KEY + ".updatedAt");
}

function findByBarcode(code) {
  if (!code) return null;
  const clean = String(code).trim();
  return getCatalog().find((p) => String(p.barcode).trim() === clean) || null;
}

function getCatalogStats() {
  return {
    total: getCatalog().length,
    lastUpdated: localStorage.getItem(STORAGE_KEY + ".updatedAt") || null,
  };
}

/* ============================================================
   SMART EXCEL PARSER
   Tries multiple strategies in order:
   1. Default (headers in row 1)
   2. Skip 1 title row (headers in row 2)
   3. Skip 2 title rows (headers in row 3)  ← MY catalog
   Picks whichever yields the most usable products.
   ============================================================ */
function normalizeKey(k) {
  return String(k || "")
    .toLowerCase()
    .replace(/[áàä]/g, "a")
    .replace(/[éèë]/g, "e")
    .replace(/[íìï]/g, "i")
    .replace(/[óòö]/g, "o")
    .replace(/[úùü]/g, "u")
    .replace(/[^a-z0-9]/g, "");
}

const FIELD_MAP = {
  name:           ["name", "nombre", "producto", "descripcion", "description"],
  barcode:        ["barcode", "codigo", "codigodebarras", "codigobarras", "ean", "ean13", "sku"],
  quantity:       ["quantity", "cantidad", "stock", "existencia", "qty"],
  price:          ["price", "precio", "valor", "costo"],
  minStock:       ["minstock", "stockminimo", "minimo", "min"],
  expirationDate: ["expirationdate", "vencimiento", "fechavencimiento", "expiracion", "expira"],
};

function rowToProduct(row) {
  // Build a normalized index: { normalizedKey: rawValue }
  const idx = {};
  for (const [k, v] of Object.entries(row)) {
    idx[normalizeKey(k)] = v;
  }

  // For each target field, try every alias
  const pick = (field) => {
    for (const alias of FIELD_MAP[field]) {
      if (idx[alias] !== undefined && idx[alias] !== "") return idx[alias];
    }
    return undefined;
  };

  const name = String(pick("name") ?? "").trim();
  const barcode = String(pick("barcode") ?? "").trim();
  if (!name || !barcode) return null;

  return {
    name,
    barcode,
    quantity: Number(pick("quantity")) || 0,
    price: Number(pick("price")) || 0,
    minStock: Number(pick("minStock")) || 0,
    expirationDate: String(pick("expirationDate") ?? "").trim(),
  };
}

async function loadCatalogFromExcel(file) {
  const XLSX = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]];

  let best = [];
  let bestSkip = -1;

  // Try skipping 0, 1, 2, 3, 4 rows — keep the version with most products
  for (let skip = 0; skip <= 4; skip++) {
    const rows = XLSX.utils.sheet_to_json(sheet, {
      defval: "",
      raw: false,
      range: skip, // skip N rows BEFORE the header row
    });

    const items = rows.map(rowToProduct).filter(Boolean);
    console.log(
      `[Catalog] Skipping ${skip} row(s) → found ${items.length} products`
    );
    if (items.length > best.length) {
      best = items;
      bestSkip = skip;
    }
  }

  if (best.length === 0) {
    // Help the user debug
    const rawRows = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: "",
      raw: false,
    });
    console.error(
      "[Catalog] No products detected. First 5 raw rows:",
      rawRows.slice(0, 5)
    );
    throw new Error(
      "El Excel se leyó pero no encontré columnas reconocibles (name/barcode). Mira la consola (F12) para ver las primeras filas."
    );
  }

  console.log(
    `[Catalog] ✓ Best result: ${best.length} products with skip=${bestSkip}`
  );
  saveCatalog(best);
  localStorage.setItem(STORAGE_KEY + ".updatedAt", new Date().toISOString());
  return best;
}

/* ============================================================
   LAZY SAVE PRODUCT
   ============================================================ */
async function saveProduct(product) {
  const mod = await import("../services/productService");
  if (typeof mod.addProduct === "function") {
    return await mod.addProduct(product);
  }
  throw new Error("addProduct no existe en productService");
}

/* ============================================================
   MAIN PAGE
   ============================================================ */
export default function Scan() {
  const [stats, setStats] = useState({ total: 0, lastUpdated: null });
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    setStats(getCatalogStats());
  }, []);

  const refreshStats = () => setStats(getCatalogStats());

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4500);
  };

  const handleCatalogUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoadingCatalog(true);
    try {
      const items = await loadCatalogFromExcel(file);
      refreshStats();
      showFeedback("success", `✓ ${items.length} productos cargados`);
    } catch (err) {
      console.error(err);
      showFeedback("error", err?.message || "No se pudo leer el archivo");
    } finally {
      setLoadingCatalog(false);
      e.target.value = "";
    }
  };

  const handleClearCatalog = () => {
    if (!window.confirm("¿Borrar el catálogo cargado?")) return;
    clearCatalog();
    refreshStats();
    showFeedback("success", "Catálogo borrado");
  };

  const handleScan = async (code) => {
    setScannerOpen(false);
    const product = findByBarcode(code);

    if (!product) {
      setLastResult({ ok: false, code });
      setHistory((h) => [{ ok: false, code, ts: Date.now() }, ...h].slice(0, 8));
      showFeedback("error", `Código ${code} no está en el catálogo`);
      return;
    }

    try {
      await saveProduct(product);
      setLastResult({ ok: true, product, code });
      setHistory((h) =>
        [{ ok: true, product, code, ts: Date.now() }, ...h].slice(0, 8)
      );
      showFeedback("success", `✨ "${product.name}" guardado`);
    } catch (err) {
      showFeedback("error", "Error al guardar: " + (err?.message || ""));
    }
  };

  const formatMoney = (n) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(Number(n) || 0);

  return (
    <MainLayout>
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-teal-600 font-bold mb-2">
          Captura rápida
        </p>
        <h1
          className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight"
          style={{ fontFamily: "Sora" }}
        >
          Escanear y guardar
        </h1>
        <p className="text-slate-500 mt-2 text-sm sm:text-base">
          Carga un catálogo desde Excel y escanea el código del producto.
        </p>
      </div>

      {feedback && (
        <div
          className={`mb-5 p-4 rounded-xl border flex items-start gap-2.5 ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <span className="font-medium text-sm">{feedback.message}</span>
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="sm-card p-5">
            <h3 className="font-bold text-lg mb-3" style={{ fontFamily: "Sora" }}>
              Catálogo
            </h3>

            {stats.total > 0 ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-3">
                <p className="text-2xl font-extrabold text-indigo-600">
                  {stats.total}
                </p>
                <p className="text-xs text-slate-500">productos cargados</p>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-3">
                <p className="text-sm font-semibold text-amber-800">
                  Sin catálogo
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Carga el archivo catalogo_productos.xlsx
                </p>
              </div>
            )}

            <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-indigo-200 rounded-xl cursor-pointer bg-indigo-50/30 hover:bg-indigo-50/60 transition">
              <p className="font-semibold text-sm text-slate-700">
                {loadingCatalog ? "Cargando..." : "📁 Cargar Excel"}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">.xlsx o .xls</p>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleCatalogUpload}
                className="hidden"
                disabled={loadingCatalog}
              />
            </label>

            {stats.total > 0 && (
              <button
                onClick={handleClearCatalog}
                className="sm-btn sm-btn-ghost w-full mt-2 text-xs"
              >
                Borrar catálogo
              </button>
            )}
          </div>

          <div className="sm-card p-5">
            <h3 className="font-bold text-lg mb-3" style={{ fontFamily: "Sora" }}>
              Escáner
            </h3>

            {!scannerOpen ? (
              <button
                onClick={() => setScannerOpen(true)}
                disabled={stats.total === 0}
                className="sm-btn sm-btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                📷{" "}
                {stats.total === 0
                  ? "Carga un catálogo primero"
                  : "Abrir cámara"}
              </button>
            ) : (
              <div className="space-y-2">
                <BarcodeScanner onScan={handleScan} />
                <button
                  onClick={() => setScannerOpen(false)}
                  className="sm-btn sm-btn-secondary w-full"
                >
                  Cancelar
                </button>
              </div>
            )}

            <ManualEntry onSubmit={handleScan} disabled={stats.total === 0} />
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-3 space-y-4">
          {lastResult ? (
            <ResultCard result={lastResult} formatMoney={formatMoney} />
          ) : (
            <div className="sm-card p-10 text-center">
              <h3 className="text-lg font-bold" style={{ fontFamily: "Sora" }}>
                Listo para escanear
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Apunta al código y el producto se guardará automáticamente.
              </p>
            </div>
          )}

          {history.length > 0 && (
            <div className="sm-card p-5">
              <h3 className="font-bold text-lg mb-3" style={{ fontFamily: "Sora" }}>
                Historial reciente
              </h3>
              <div className="space-y-2">
                {history.map((h, i) => (
                  <div
                    key={h.ts + "-" + i}
                    className={`flex items-center gap-3 p-3 rounded-xl border ${
                      h.ok
                        ? "bg-emerald-50/50 border-emerald-200"
                        : "bg-red-50/50 border-red-200"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white ${
                        h.ok ? "bg-emerald-500" : "bg-red-500"
                      }`}
                    >
                      {h.ok ? "✓" : "✗"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-900 truncate">
                        {h.ok ? h.product.name : "No encontrado"}
                      </p>
                      <p className="text-xs text-slate-500 font-mono">
                        {h.code}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

function ResultCard({ result, formatMoney }) {
  if (!result.ok) {
    return (
      <div className="sm-card p-6 border-l-4 border-red-500">
        <h3 className="font-bold text-lg" style={{ fontFamily: "Sora" }}>
          Producto no encontrado
        </h3>
        <p className="text-sm text-slate-600 mt-1">
          El código <span className="font-mono font-bold">{result.code}</span>{" "}
          no está en el catálogo cargado.
        </p>
      </div>
    );
  }

  const { product, code } = result;
  return (
    <div className="sm-card p-6 border-l-4 border-emerald-500">
      <p className="text-xs uppercase tracking-wider font-bold text-emerald-600">
        ✓ Guardado en inventario
      </p>
      <h3
        className="text-xl sm:text-2xl font-extrabold mt-1"
        style={{ fontFamily: "Sora" }}
      >
        {product.name}
      </h3>
      <p className="text-xs text-slate-500 font-mono mt-1">{code}</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        <DataTile label="Cantidad" value={product.quantity} />
        <DataTile label="Precio" value={formatMoney(product.price)} />
        <DataTile label="Stock mín." value={product.minStock} />
        <DataTile
          label="Vence"
          value={product.expirationDate || "—"}
          small
        />
      </div>
    </div>
  );
}

function DataTile({ label, value, small }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
        {label}
      </p>
      <p
        className={`font-extrabold text-slate-900 mt-0.5 ${
          small ? "text-sm" : "text-lg"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function ManualEntry({ onSubmit, disabled }) {
  const [code, setCode] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!code.trim()) return;
        onSubmit(code.trim());
        setCode("");
      }}
      className="mt-3 pt-3 border-t border-slate-100"
    >
      <label className="sm-label">O escribe el código</label>
      <div className="flex gap-2">
        <input
          type="text"
          inputMode="numeric"
          className="sm-input"
          placeholder="Ej: 7701111000011"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={disabled}
        />
        <button
          type="submit"
          className="sm-btn sm-btn-primary"
          disabled={disabled || !code.trim()}
        >
          Buscar
        </button>
      </div>
    </form>
  );
}
