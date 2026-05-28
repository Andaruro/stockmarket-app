import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import {
  loadCatalogFromExcel,
  getCatalogStats,
  findByBarcode,
  clearCatalog,
  markCatalogUpdated,
} from "../services/catalogService";
import { addProduct } from "../services/productService";
import BarcodeScanner from "../components/BarcodeScanner";

export default function Scan() {
  const [stats, setStats] = useState({ total: 0, lastUpdated: null });
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [lastResult, setLastResult] = useState(null); // { ok, product, code }
  const [history, setHistory] = useState([]);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    refreshStats();
  }, []);

  const refreshStats = () => setStats(getCatalogStats());

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  /* ---------- Catalog upload ---------- */
  const handleCatalogUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoadingCatalog(true);
    try {
      const items = await loadCatalogFromExcel(file);
      markCatalogUpdated();
      refreshStats();
      showFeedback("success", `✓ ${items.length} productos cargados al catálogo`);
    } catch (err) {
      console.error(err);
      showFeedback("error", "No se pudo leer el archivo. Revisa el formato.");
    } finally {
      setLoadingCatalog(false);
      e.target.value = ""; // allow re-upload
    }
  };

  const handleClearCatalog = () => {
    if (!window.confirm("¿Borrar el catálogo cargado?")) return;
    clearCatalog();
    refreshStats();
    showFeedback("success", "Catálogo borrado");
  };

  /* ---------- Scan handler ---------- */
  const handleScan = async (code) => {
    setScannerOpen(false);

    const product = findByBarcode(code);
    if (!product) {
      setLastResult({ ok: false, code });
      setHistory((h) => [{ ok: false, code, ts: Date.now() }, ...h].slice(0, 8));
      showFeedback("error", `Código ${code} no encontrado en el catálogo`);
      return;
    }

    try {
      await addProduct(product);
      setLastResult({ ok: true, product, code });
      setHistory((h) =>
        [{ ok: true, product, code, ts: Date.now() }, ...h].slice(0, 8)
      );
      showFeedback("success", `✨ "${product.name}" guardado`);
    } catch (err) {
      console.error(err);
      showFeedback("error", "Error al guardar en la base de datos");
    }
  };

  const formatMoney = (n) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(Number(n) || 0);

  const formatDate = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "short",
    });
  };

  return (
    <MainLayout>
      {/* Header */}
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
          Carga un catálogo desde Excel, escanea un código y el producto se
          guarda automáticamente.
        </p>
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className={`mb-5 p-4 rounded-xl border flex items-start gap-2.5 sm-fade-in ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <span className="font-medium text-sm">{feedback.message}</span>
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-6">
        {/* === Left column: catalog + scanner === */}
        <div className="lg:col-span-2 space-y-4">
          {/* Catalog card */}
          <div className="sm-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-xl text-white flex items-center justify-center shadow-md"
                style={{
                  background:
                    "linear-gradient(135deg, #4f46e5, #6366f1)",
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg" style={{ fontFamily: "Sora" }}>
                  Catálogo
                </h3>
                <p className="text-xs text-slate-500">
                  Archivo .xlsx con los productos
                </p>
              </div>
            </div>

            {stats.total > 0 ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-extrabold text-indigo-600">
                      {stats.total}
                    </p>
                    <p className="text-xs text-slate-500">productos cargados</p>
                  </div>
                  <span className="sm-chip sm-chip-success">Listo</span>
                </div>
                {stats.lastUpdated && (
                  <p className="text-[11px] text-slate-400 mt-2">
                    Actualizado: {formatDate(stats.lastUpdated)}
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-3">
                <p className="text-sm font-semibold text-amber-800">
                  Sin catálogo cargado
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Carga el archivo <code>catalogo_productos.xlsx</code> para
                  empezar.
                </p>
              </div>
            )}

            <label
              className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-xl cursor-pointer transition"
              style={{
                borderColor: "rgba(99,102,241,0.3)",
                background: "rgba(99,102,241,0.04)",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-7 h-7 text-indigo-400 mb-1"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <p className="font-semibold text-sm text-slate-700">
                {loadingCatalog ? "Cargando..." : "Cargar Excel"}
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

          {/* Scanner card */}
          <div className="sm-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-xl text-white flex items-center justify-center shadow-md"
                style={{
                  background:
                    "linear-gradient(135deg, #0d9488, #14b8a6)",
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                  <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                  <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                  <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                  <line x1="7" y1="8" x2="7" y2="16" />
                  <line x1="11" y1="8" x2="11" y2="16" />
                  <line x1="15" y1="8" x2="15" y2="16" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg" style={{ fontFamily: "Sora" }}>
                  Escáner
                </h3>
                <p className="text-xs text-slate-500">
                  Cámara o lector USB
                </p>
              </div>
            </div>

            {!scannerOpen ? (
              <button
                onClick={() => setScannerOpen(true)}
                disabled={stats.total === 0}
                className="sm-btn sm-btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                {stats.total === 0 ? "Carga un catálogo primero" : "Abrir cámara"}
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

            {/* Manual entry fallback */}
            <ManualEntry onSubmit={handleScan} disabled={stats.total === 0} />
          </div>
        </div>

        {/* === Right column: last result + history === */}
        <div className="lg:col-span-3 space-y-4">
          {lastResult ? (
            <ResultCard result={lastResult} formatMoney={formatMoney} />
          ) : (
            <div className="sm-card p-10 text-center">
              <div
                className="w-16 h-16 mx-auto mb-3 rounded-2xl flex items-center justify-center"
                style={{ background: "#f1f3f9" }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-8 h-8 text-slate-400"
                >
                  <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                  <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                  <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                  <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                  <line x1="7" y1="8" x2="7" y2="16" />
                  <line x1="11" y1="8" x2="11" y2="16" />
                  <line x1="15" y1="8" x2="15" y2="16" />
                </svg>
              </div>
              <h3
                className="text-lg font-bold"
                style={{ fontFamily: "Sora" }}
              >
                Listo para escanear
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Apunta al código y el producto se guardará en el inventario.
              </p>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="sm-card p-5">
              <h3
                className="font-bold text-lg mb-3"
                style={{ fontFamily: "Sora" }}
              >
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
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        h.ok
                          ? "bg-emerald-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {h.ok ? (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          className="w-4 h-4"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          className="w-4 h-4"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-900 truncate">
                        {h.ok ? h.product.name : "No encontrado"}
                      </p>
                      <p className="text-xs text-slate-500 font-mono">
                        {h.code}
                      </p>
                    </div>
                    <span className="text-[11px] text-slate-400 shrink-0">
                      {formatDate(new Date(h.ts).toISOString())}
                    </span>
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

/* ============================================================
   Sub-components
   ============================================================ */

function ResultCard({ result, formatMoney }) {
  if (!result.ok) {
    return (
      <div className="sm-card p-6 border-l-4 border-red-500 sm-fade-in">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center shrink-0">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-5 h-5"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-lg" style={{ fontFamily: "Sora" }}>
              Producto no encontrado
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              El código <span className="font-mono font-bold">{result.code}</span>{" "}
              no está en el catálogo cargado.
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Asegúrate de haber cargado el Excel correcto, o agrega el producto
              manualmente desde la pestaña "Productos".
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { product, code } = result;
  return (
    <div className="sm-card p-6 border-l-4 border-emerald-500 sm-fade-in">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-wider font-bold text-emerald-600">
            Guardado en inventario
          </p>
          <h3
            className="text-xl sm:text-2xl font-extrabold mt-0.5"
            style={{ fontFamily: "Sora" }}
          >
            {product.name}
          </h3>
          <p className="text-xs text-slate-500 font-mono mt-1">{code}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        <DataTile label="Cantidad" value={product.quantity} />
        <DataTile label="Precio" value={formatMoney(product.price)} />
        <DataTile label="Stock mín." value={product.minStock} />
        <DataTile label="Vence" value={product.expirationDate || "—"} small />
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

  const submit = (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    onSubmit(code.trim());
    setCode("");
  };

  return (
    <form onSubmit={submit} className="mt-3 pt-3 border-t border-slate-100">
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
