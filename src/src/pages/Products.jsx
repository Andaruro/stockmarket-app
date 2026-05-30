import { useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { addProduct } from "../services/productService";
import { importExcel } from "../services/importService";
import OCRUploader from "../components/OCRUploader";
import BarcodeScanner from "../components/BarcodeScanner";

export default function Products() {
  const [product, setProduct] = useState({
    name: "",
    barcode: "",
    quantity: "",
    price: "",
    minStock: "",
    expirationDate: ""
  });
  const [feedback, setFeedback] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activeTool, setActiveTool] = useState(null); // 'ocr' | 'scan' | 'excel'

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleOCRText = (text) => {
    const dateRegex = /\d{4}-\d{2}-\d{2}/;
    const match = text.match(dateRegex);
    if (match) {
      setProduct((prev) => ({ ...prev, expirationDate: match[0] }));
      showFeedback("success", `Fecha detectada: ${match[0]}`);
    }
  };

  const handleBarcodeScan = (code) => {
    setProduct((prev) => ({ ...prev, barcode: code }));
    showFeedback("success", `Código capturado: ${code}`);
    setActiveTool(null);
  };

  const handleExcelImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await importExcel(file);
      showFeedback("success", "Productos importados correctamente");
    } catch (err) {
      showFeedback("error", "No se pudo importar el archivo");
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await addProduct(product);
      showFeedback("success", "✨ Producto registrado");
      setProduct({
        name: "",
        barcode: "",
        quantity: "",
        price: "",
        minStock: "",
        expirationDate: ""
      });
    } catch (err) {
      showFeedback("error", "Error al guardar el producto");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-indigo-600 font-bold mb-2">
          Catálogo
        </p>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight" style={{ fontFamily: 'Sora' }}>
          Registrar producto
        </h1>
        <p className="text-slate-500 mt-2 text-sm sm:text-base">
          Agrega productos manualmente o usa las herramientas inteligentes.
        </p>
      </div>

      {/* Feedback toast */}
      {feedback && (
        <div className={`
          mb-5 p-4 rounded-xl border flex items-start gap-2.5 sm-fade-in
          ${feedback.type === "success"
            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
            : "bg-red-50 border-red-200 text-red-800"
          }
        `}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0 mt-0.5">
            {feedback.type === "success" ? (
              <polyline points="20 6 9 17 4 12"/>
            ) : (
              <>
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </>
            )}
          </svg>
          <span className="font-medium text-sm">{feedback.message}</span>
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-6">
        {/* === Tools === */}
        <div className="lg:col-span-2 space-y-4">
          <div className="sm-card p-5">
            <h2 className="text-lg font-bold mb-1" style={{ fontFamily: 'Sora' }}>
              Herramientas inteligentes
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              Captura información automáticamente.
            </p>

            <div className="space-y-2">
              <ToolButton
                active={activeTool === "ocr"}
                onClick={() => setActiveTool(activeTool === "ocr" ? null : "ocr")}
                title="OCR con IA"
                subtitle="Lee fechas desde una imagen"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="9" cy="9" r="2"/>
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                  </svg>
                }
                gradient="from-indigo-500 to-purple-500"
              />

              <ToolButton
                active={activeTool === "scan"}
                onClick={() => setActiveTool(activeTool === "scan" ? null : "scan")}
                title="Escanear código"
                subtitle="Cámara para leer códigos de barras"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M3 7V5a2 2 0 0 1 2-2h2"/>
                    <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
                    <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
                    <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
                    <line x1="7" y1="8" x2="7" y2="16"/>
                    <line x1="11" y1="8" x2="11" y2="16"/>
                    <line x1="15" y1="8" x2="15" y2="16"/>
                  </svg>
                }
                gradient="from-teal-500 to-emerald-500"
              />

              <ToolButton
                active={activeTool === "excel"}
                onClick={() => setActiveTool(activeTool === "excel" ? null : "excel")}
                title="Importar Excel"
                subtitle="Carga masiva desde .xlsx"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="9" y1="15" x2="15" y2="15"/>
                    <line x1="9" y1="11" x2="15" y2="11"/>
                  </svg>
                }
                gradient="from-amber-500 to-orange-500"
              />
            </div>
          </div>

          {/* Tool content */}
          {activeTool === "ocr" && (
            <OCRUploader onTextDetected={handleOCRText} />
          )}

          {activeTool === "scan" && (
            <BarcodeScanner onScan={handleBarcodeScan} />
          )}

          {activeTool === "excel" && (
            <div className="sm-card p-5 sm-fade-in">
              <h3 className="font-bold text-lg mb-1" style={{ fontFamily: 'Sora' }}>
                Importar desde Excel
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                Selecciona un archivo .xlsx o .xls con tus productos.
              </p>

              <label className="
                flex flex-col items-center justify-center
                p-6 border-2 border-dashed border-slate-300
                rounded-xl bg-slate-50/70
                cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/40
                transition
              ">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-slate-400 mb-2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <p className="font-semibold text-sm text-slate-700">
                  Clic para seleccionar
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  .xlsx o .xls
                </p>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleExcelImport}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        {/* === Form === */}
        <form
          onSubmit={handleSubmit}
          className="sm-card p-5 sm:p-7 lg:col-span-3"
        >
          <h2 className="text-lg font-bold mb-5" style={{ fontFamily: 'Sora' }}>
            Datos del producto
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="sm-label">Nombre *</label>
              <input
                type="text"
                name="name"
                value={product.name}
                onChange={handleChange}
                className="sm-input"
                placeholder="Ej: Leche entera 1L"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="sm-label">Código de barras</label>
              <input
                type="text"
                name="barcode"
                value={product.barcode}
                onChange={handleChange}
                className="sm-input"
                placeholder="Escanea o escribe el código"
              />
            </div>

            <div>
              <label className="sm-label">Cantidad *</label>
              <input
                type="number"
                name="quantity"
                value={product.quantity}
                onChange={handleChange}
                className="sm-input"
                placeholder="0"
                required
              />
            </div>

            <div>
              <label className="sm-label">Stock mínimo *</label>
              <input
                type="number"
                name="minStock"
                value={product.minStock}
                onChange={handleChange}
                className="sm-input"
                placeholder="0"
                required
              />
            </div>

            <div>
              <label className="sm-label">Precio *</label>
              <input
                type="number"
                name="price"
                value={product.price}
                onChange={handleChange}
                className="sm-input"
                placeholder="0"
                required
              />
            </div>

            <div>
              <label className="sm-label">Fecha vencimiento</label>
              <input
                type="date"
                name="expirationDate"
                value={product.expirationDate}
                onChange={handleChange}
                className="sm-input"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="sm-btn sm-btn-primary w-full mt-6 py-3.5 disabled:opacity-60"
          >
            {saving ? (
              <>
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeOpacity="0.25" strokeWidth="4"/>
                  <path d="M4 12a8 8 0 0 1 8-8" stroke="white" strokeWidth="4" strokeLinecap="round"/>
                </svg>
                Guardando...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Guardar producto
              </>
            )}
          </button>
        </form>
      </div>
    </MainLayout>
  );
}

function ToolButton({ active, onClick, title, subtitle, icon, gradient }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`
        w-full flex items-center gap-3
        p-3 rounded-xl border transition
        ${active
          ? "border-indigo-300 bg-indigo-50/50 shadow-sm"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
        }
      `}
    >
      <div className={`
        w-10 h-10 rounded-lg shrink-0
        bg-gradient-to-br ${gradient}
        text-white flex items-center justify-center
        shadow-md
      `}>
        {icon}
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className="font-semibold text-slate-900 text-sm">{title}</p>
        <p className="text-xs text-slate-500 truncate">{subtitle}</p>
      </div>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-4 h-4 text-slate-400 transition ${active ? "rotate-90" : ""}`}>
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </button>
  );
}
