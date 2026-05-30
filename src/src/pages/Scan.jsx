import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import BarcodeScanner from "../components/BarcodeScanner";
import {
  getProducts,
  updateProduct,
} from "../services/productService";

/* ============================================================
   Scan page — uses the live inventory from Firestore
   ------------------------------------------------------------
   Flow:
     1. On mount → fetch all products (getProducts)
     2. User scans a barcode (or types it manually)
     3. Look it up by `barcode` field in the products list
     4. If found → updateProduct(id, { quantity: quantity + 1 })
        If not found → message: "Producto no registrado"
   ============================================================ */
export default function Scan() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [lastResult, setLastResult] = useState(null); // { ok, product?, code, addedQty? }
  const [history, setHistory] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [processing, setProcessing] = useState(false);

  /* ---------- Load inventory ---------- */
  useEffect(() => {
    refreshInventory();
  }, []);

  const refreshInventory = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data || []);
    } catch (err) {
      console.error(err);
      showFeedback("error", "Error al cargar el inventario");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Feedback ---------- */
  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3500);
  };

  /* ---------- Find product by barcode ---------- */
  const findByBarcode = (code) => {
    if (!code) return null;
    const clean = String(code).trim();
    return (
      products.find((p) => String(p.barcode || "").trim() === clean) || null
    );
  };

  /* ---------- Scan handler ---------- */
  const handleScan = async (code) => {
    setScannerOpen(false);
    if (processing) return;

    const cleanCode = String(code).trim();
    const product = findByBarcode(cleanCode);

    if (!product) {
      setLastResult({ ok: false, code: cleanCode });
      setHistory((h) =>
        [{ ok: false, code: cleanCode, ts: Date.now() }, ...h].slice(0, 8)
      );
      showFeedback(
        "error",
        `Código ${cleanCode} no registrado en el inventario`
      );
      return;
    }

    /* Found — increment quantity by 1 */
    setProcessing(true);
    const previousQty = Number(product.quantity) || 0;
    const newQty = previousQty + 1;

    try {
      await updateProduct(product.id, {
        ...product,
        quantity: newQty,
      });

      // Update local cache so the next scan uses the new value
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, quantity: newQty } : p
        )
      );

      const updatedProduct = { ...product, quantity: newQty };
      setLastResult({
        ok: true,
        product: updatedProduct,
        code: cleanCode,
        previousQty,
        newQty,
      });
      setHistory((h) =>
        [
          {
            ok: true,
            product: updatedProduct,
            code: cleanCode,
            previousQty,
            newQty,
            ts: Date.now(),
          },
          ...h,
        ].slice(0, 8)
      );
      showFeedback(
        "success",
        `✨ "${product.name}" actualizado: ${previousQty} → ${newQty}`
      );
    } catch (err) {
      console.error(err);
      showFeedback(
        "error",
        "Error al actualizar: " + (err?.message || "intenta de nuevo")
      );
    } finally {
      setProcessing(false);
    }
  };

  const formatMoney = (n) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(Number(n) || 0);

  /* ---------- Stats ---------- */
  const productsWithBarcode = products.filter(
    (p) => p.barcode && String(p.barcode).trim()
  ).length;

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
          Escanear y sumar
        </h1>
        <p className="text-slate-500 mt-2 text-sm sm:text-base">
          Escanea un producto del inventario y suma{" "}
          <span className="font-bold text-indigo-600">+1</span> a su cantidad
          automáticamente.
        </p>
      </div>

      {/* Feedback */}
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
          {/* Inventory status */}
          <div className="sm-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3
                className="font-bold text-lg"
                style={{ fontFamily: "Sora" }}
              >
                Inventario
              </h3>
              <button
                onClick={refreshInventory}
                className="sm-btn sm-btn-ghost text-xs"
                disabled={loading}
              >
                {loading ? "..." : "↻ Actualizar"}
              </button>
            </div>

            {loading ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm-skeleton h-20" />
            ) : products.length === 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-amber-800">
                  Inventario vacío
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Registra productos desde la pestaña "Productos" primero.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <p className="text-2xl font-extrabold text-indigo-600">
                    {products.length}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                    Productos totales
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <p className="text-2xl font-extrabold text-teal-600">
                    {productsWithBarcode}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                    Con código de barras
                  </p>
                </div>
              </div>
            )}

            {!loading &&
              products.length > 0 &&
              productsWithBarcode === 0 && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2 mt-3">
                  ⚠️ Ningún producto tiene código de barras registrado. Edita
                  un producto en la pestaña "Productos" para agregarle un
                  código.
                </p>
              )}
          </div>

          {/* Scanner */}
          <div className="sm-card p-5">
            <h3 className="font-bold text-lg mb-3" style={{ fontFamily: "Sora" }}>
              Escáner
            </h3>

            {!scannerOpen ? (
              <button
                onClick={() => setScannerOpen(true)}
                disabled={loading || products.length === 0 || processing}
                className="sm-btn sm-btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                📷{" "}
                {products.length === 0
                  ? "Inventario vacío"
                  : processing
                  ? "Procesando..."
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

            <ManualEntry
              onSubmit={handleScan}
              disabled={loading || products.length === 0 || processing}
            />
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-3 space-y-4">
          {lastResult ? (
            <ResultCard result={lastResult} formatMoney={formatMoney} />
          ) : (
            <div className="sm-card p-10 text-center">
              <h3
                className="text-lg font-bold"
                style={{ fontFamily: "Sora" }}
              >
                Listo para escanear
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Apunta al código y se sumará +1 a la cantidad del producto.
              </p>
            </div>
          )}

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
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white font-bold ${
                        h.ok ? "bg-emerald-500" : "bg-red-500"
                      }`}
                    >
                      {h.ok ? "✓" : "✗"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-900 truncate">
                        {h.ok ? h.product.name : "No registrado"}
                      </p>
                      <p className="text-xs text-slate-500 font-mono">
                        {h.code}
                      </p>
                    </div>
                    {h.ok && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md shrink-0">
                        {h.previousQty} → {h.newQty}
                      </span>
                    )}
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
   Subcomponents
   ============================================================ */
function ResultCard({ result, formatMoney }) {
  if (!result.ok) {
    return (
      <div className="sm-card p-6 border-l-4 border-red-500">
        <h3 className="font-bold text-lg" style={{ fontFamily: "Sora" }}>
          Producto no registrado
        </h3>
        <p className="text-sm text-slate-600 mt-1">
          El código{" "}
          <span className="font-mono font-bold">{result.code}</span> no está
          en el inventario.
        </p>
        <p className="text-xs text-slate-500 mt-2">
          Ve a la pestaña <strong>"Productos"</strong> para registrarlo, o
          edita un producto existente para agregarle este código de barras.
        </p>
      </div>
    );
  }

  const { product, code, previousQty, newQty } = result;
  return (
    <div className="sm-card p-6 border-l-4 border-emerald-500">
      <p className="text-xs uppercase tracking-wider font-bold text-emerald-600">
        ✓ Cantidad actualizada
      </p>
      <h3
        className="text-xl sm:text-2xl font-extrabold mt-1"
        style={{ fontFamily: "Sora" }}
      >
        {product.name}
      </h3>
      <p className="text-xs text-slate-500 font-mono mt-1">{code}</p>

      {/* Big quantity change */}
      <div className="my-5 flex items-center justify-center gap-4 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5">
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
            Antes
          </p>
          <p className="text-3xl font-extrabold text-slate-700 mt-1">
            {previousQty}
          </p>
        </div>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-8 h-8 text-emerald-500"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-600">
            Ahora
          </p>
          <p className="text-3xl font-extrabold text-emerald-700 mt-1">
            {newQty}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <DataTile label="Precio" value={formatMoney(product.price)} />
        <DataTile label="Stock mín." value={product.minStock || "—"} />
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
          small ? "text-sm" : "text-base"
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
