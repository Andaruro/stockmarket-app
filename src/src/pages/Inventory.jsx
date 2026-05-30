import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { exportToExcel, exportToPDF } from "../services/exportService";
import {
  getProducts,
  deleteProduct,
  updateProduct,
} from "../services/productService";

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [showLowStock, setShowLowStock] = useState(false);
  const [showExpiring, setShowExpiring] = useState(false);
  const [showWithoutBarcode, setShowWithoutBarcode] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    barcode: "",
    quantity: "",
    price: "",
    minStock: "",
    expirationDate: "",
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const data = await getProducts();
    setProducts(data || []);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar producto?")) return;
    await deleteProduct(id);
    loadProducts();
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || "",
      barcode: product.barcode || "",
      quantity: product.quantity ?? "",
      price: product.price ?? "",
      minStock: product.minStock || "",
      expirationDate: product.expirationDate || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    await updateProduct(editingProduct.id, formData);
    setEditingProduct(null);
    loadProducts();
  };

  const cancelEdit = () => setEditingProduct(null);

  const hasBarcode = (p) => Boolean(String(p.barcode || "").trim());

  const isLowStock = (p) =>
    Number(p.quantity) <= Number(p.minStock || 0) && Number(p.minStock || 0) > 0;

  const isExpiringSoon = (p) => {
    if (!p.expirationDate) return false;
    const days = (new Date(p.expirationDate) - new Date()) / (1000 * 60 * 60 * 24);
    return days <= 7 && days >= 0;
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      (product.name || "").toLowerCase().includes(search.toLowerCase()) ||
      String(product.barcode || "").includes(search);
    const matchesLowStock = !showLowStock || isLowStock(product);
    const matchesExpiring = !showExpiring || isExpiringSoon(product);
    const matchesWithoutBarcode = !showWithoutBarcode || !hasBarcode(product);
    return matchesSearch && matchesLowStock && matchesExpiring && matchesWithoutBarcode;
  });

  const formatMoney = (n) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(Number(n) || 0);

  const productsWithoutBarcode = products.filter((p) => !hasBarcode(p)).length;

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-indigo-600 font-bold mb-2">
            Gestión
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight" style={{ fontFamily: "Sora" }}>
            Inventario
          </h1>
          <p className="text-slate-500 mt-2 text-sm sm:text-base">
            {filteredProducts.length} producto{filteredProducts.length !== 1 ? "s" : ""} visible
            {productsWithoutBarcode > 0 && (
              <> · <span className="text-amber-600 font-semibold">{productsWithoutBarcode} sin código de barras</span></>
            )}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={() => exportToExcel(products)} className="sm-btn sm-btn-success">
            Excel
          </button>
          <button onClick={() => exportToPDF(products)} className="sm-btn sm-btn-danger">
            PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="sm-card p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-3">
          <input
            type="text"
            placeholder="Buscar por nombre o código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm-input flex-1"
          />

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setShowLowStock(!showLowStock)}
              className={`sm-btn border transition ${
                showLowStock
                  ? "bg-amber-100 text-amber-800 border-amber-300"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              Stock bajo
            </button>
            <button
              onClick={() => setShowExpiring(!showExpiring)}
              className={`sm-btn border transition ${
                showExpiring
                  ? "bg-orange-100 text-orange-800 border-orange-300"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              Próx. a vencer
            </button>
            <button
              onClick={() => setShowWithoutBarcode(!showWithoutBarcode)}
              className={`sm-btn border transition ${
                showWithoutBarcode
                  ? "bg-red-100 text-red-800 border-red-300"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              Sin código
            </button>
          </div>
        </div>
      </div>

      {/* Edit form */}
      {editingProduct && (
        <form onSubmit={handleUpdate} className="sm-card p-5 sm:p-7 mb-6 sm-fade-in">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl sm:text-2xl font-bold" style={{ fontFamily: "Sora" }}>
              Editar producto
            </h2>
            <button type="button" onClick={cancelEdit} className="sm-btn sm-btn-ghost sm-btn-icon">
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <label className="sm-label">Nombre</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="sm-input" required />
            </div>
            <div>
              <label className="sm-label">Código de barras</label>
              <input
                type="text"
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
                placeholder="Ej: 7701111000011"
                className="sm-input font-mono"
              />
            </div>
            <div>
              <label className="sm-label">Cantidad</label>
              <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} className="sm-input" />
            </div>
            <div>
              <label className="sm-label">Precio</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} className="sm-input" />
            </div>
            <div>
              <label className="sm-label">Stock mínimo</label>
              <input type="number" name="minStock" value={formData.minStock} onChange={handleChange} className="sm-input" />
            </div>
            <div>
              <label className="sm-label">Vencimiento</label>
              <input type="date" name="expirationDate" value={formData.expirationDate} onChange={handleChange} className="sm-input" />
            </div>
          </div>

          <div className="flex gap-2 mt-5">
            <button type="submit" className="sm-btn sm-btn-primary">Guardar cambios</button>
            <button type="button" onClick={cancelEdit} className="sm-btn sm-btn-secondary">Cancelar</button>
          </div>
        </form>
      )}

      {/* Mobile cards */}
      <div className="lg:hidden space-y-3">
        {filteredProducts.length === 0 ? (
          <div className="sm-card p-8 text-center text-slate-500">No se encontraron productos.</div>
        ) : (
          filteredProducts.map((product) => (
            <div key={product.id} className="sm-card p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-slate-900 truncate">{product.name}</h3>
                  {hasBarcode(product) ? (
                    <p className="text-[11px] font-mono text-slate-500 mt-0.5 truncate">📷 {product.barcode}</p>
                  ) : (
                    <p className="text-[11px] font-semibold text-amber-600 mt-0.5">⚠️ Sin código de barras</p>
                  )}
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {isLowStock(product) && <span className="sm-chip sm-chip-danger">Stock bajo</span>}
                    {isExpiringSoon(product) && <span className="sm-chip sm-chip-warning">Por vencer</span>}
                  </div>
                </div>
                <span className="text-lg font-extrabold text-indigo-600 shrink-0">{formatMoney(product.price)}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 rounded-xl p-3 mb-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Stock</p>
                  <p className="font-bold text-slate-900 mt-0.5 text-sm">{product.quantity}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Mín.</p>
                  <p className="font-bold text-slate-900 mt-0.5 text-sm">{product.minStock || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Vence</p>
                  <p className="font-bold text-slate-900 mt-0.5 text-xs">{product.expirationDate || "—"}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => handleEdit(product)} className="sm-btn sm-btn-secondary flex-1 text-sm">Editar</button>
                <button onClick={() => handleDelete(product.id)} className="sm-btn sm-btn-danger flex-1 text-sm">Eliminar</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block sm-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-left text-xs uppercase tracking-wider font-bold text-slate-500">Producto</th>
                <th className="p-4 text-left text-xs uppercase tracking-wider font-bold text-slate-500">Código de barras</th>
                <th className="p-4 text-left text-xs uppercase tracking-wider font-bold text-slate-500">Cantidad</th>
                <th className="p-4 text-left text-xs uppercase tracking-wider font-bold text-slate-500">Precio</th>
                <th className="p-4 text-left text-xs uppercase tracking-wider font-bold text-slate-500">Stock Mín.</th>
                <th className="p-4 text-left text-xs uppercase tracking-wider font-bold text-slate-500">Vencimiento</th>
                <th className="p-4 text-left text-xs uppercase tracking-wider font-bold text-slate-500">Estado</th>
                <th className="p-4 text-right text-xs uppercase tracking-wider font-bold text-slate-500">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-10 text-center text-slate-500">No se encontraron productos.</td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-slate-100 hover:bg-slate-50/70 transition">
                    <td className="p-4 font-semibold text-slate-900">{product.name}</td>
                    <td className="p-4">
                      {hasBarcode(product) ? (
                        <span className="font-mono text-xs text-slate-700 bg-slate-100 px-2 py-1 rounded-md">{product.barcode}</span>
                      ) : (
                        <span className="text-xs font-semibold text-amber-600">⚠️ Sin código</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-700">{product.quantity}</td>
                    <td className="p-4 font-semibold text-indigo-600">{formatMoney(product.price)}</td>
                    <td className="p-4 text-slate-700">{product.minStock || "—"}</td>
                    <td className="p-4 text-slate-700">{product.expirationDate || "N/A"}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {isLowStock(product) && <span className="sm-chip sm-chip-danger">Stock bajo</span>}
                        {isExpiringSoon(product) && <span className="sm-chip sm-chip-warning">Por vencer</span>}
                        {!isLowStock(product) && !isExpiringSoon(product) && <span className="sm-chip sm-chip-success">OK</span>}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => handleEdit(product)} className="sm-btn sm-btn-secondary text-sm py-1.5 px-3">Editar</button>
                        <button onClick={() => handleDelete(product.id)} className="sm-btn sm-btn-danger text-sm py-1.5 px-3">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}
