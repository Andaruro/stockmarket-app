import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { exportToExcel, exportToPDF } from "../services/exportService";
import {
  getProducts,
  deleteProduct,
  updateProduct
} from "../services/productService";

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [showLowStock, setShowLowStock] = useState(false);
  const [showExpiring, setShowExpiring] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    quantity: "",
    price: "",
    minStock: "",
    expirationDate: ""
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const data = await getProducts();
    setProducts(data);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("¿Eliminar producto?");
    if (!confirmDelete) return;
    await deleteProduct(id);
    loadProducts();
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      quantity: product.quantity,
      price: product.price,
      minStock: product.minStock || "",
      expirationDate: product.expirationDate || ""
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

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesLowStock =
      !showLowStock ||
      Number(product.quantity) <= Number(product.minStock);
    const matchesExpiring =
      !showExpiring ||
      (product.expirationDate &&
        (new Date(product.expirationDate) - new Date()) /
          (1000 * 60 * 60 * 24) <=
          7);
    return matchesSearch && matchesLowStock && matchesExpiring;
  });

  const isLowStock = (p) =>
    Number(p.quantity) <= Number(p.minStock || 0) && Number(p.minStock || 0) > 0;

  const isExpiringSoon = (p) => {
    if (!p.expirationDate) return false;
    const days = (new Date(p.expirationDate) - new Date()) / (1000 * 60 * 60 * 24);
    return days <= 7 && days >= 0;
  };

  const formatMoney = (n) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0
    }).format(Number(n) || 0);

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-indigo-600 font-bold mb-2">
            Gestión
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight" style={{ fontFamily: 'Sora' }}>
            Inventario
          </h1>
          <p className="text-slate-500 mt-2 text-sm sm:text-base">
            {filteredProducts.length} producto{filteredProducts.length !== 1 ? "s" : ""} visibles
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => exportToExcel(products)}
            className="sm-btn sm-btn-success"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <span className="hidden sm:inline">Excel</span>
          </button>
          <button
            onClick={() => exportToPDF(products)}
            className="sm-btn sm-btn-danger"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <span className="hidden sm:inline">PDF</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="sm-card p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Buscar producto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="sm-input pl-11"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <FilterToggle
              active={showLowStock}
              onClick={() => setShowLowStock(!showLowStock)}
              activeClass="bg-amber-100 text-amber-800 border-amber-300"
              label="Stock bajo"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M12 9v4M12 17h.01"/>
                  <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                </svg>
              }
            />
            <FilterToggle
              active={showExpiring}
              onClick={() => setShowExpiring(!showExpiring)}
              activeClass="bg-orange-100 text-orange-800 border-orange-300"
              label="Próx. a vencer"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              }
            />
          </div>
        </div>
      </div>

      {/* Edit form */}
      {editingProduct && (
        <form
          onSubmit={handleUpdate}
          className="sm-card p-5 sm:p-7 mb-6 sm-fade-in"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2" style={{ fontFamily: 'Sora' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-indigo-600">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Editar producto
            </h2>
            <button
              type="button"
              onClick={cancelEdit}
              className="sm-btn sm-btn-ghost sm-btn-icon"
              aria-label="Cancelar"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="sm-label">Nombre</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="sm-input"/>
            </div>
            <div>
              <label className="sm-label">Cantidad</label>
              <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} className="sm-input"/>
            </div>
            <div>
              <label className="sm-label">Precio</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} className="sm-input"/>
            </div>
            <div>
              <label className="sm-label">Stock mínimo</label>
              <input type="number" name="minStock" value={formData.minStock} onChange={handleChange} className="sm-input"/>
            </div>
            <div>
              <label className="sm-label">Vencimiento</label>
              <input type="date" name="expirationDate" value={formData.expirationDate} onChange={handleChange} className="sm-input"/>
            </div>
          </div>

          <div className="flex gap-2 mt-5">
            <button type="submit" className="sm-btn sm-btn-primary flex-1 sm:flex-none">
              Guardar cambios
            </button>
            <button type="button" onClick={cancelEdit} className="sm-btn sm-btn-secondary flex-1 sm:flex-none">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* === Mobile: Cards === */}
      <div className="lg:hidden space-y-3">
        {filteredProducts.length === 0 ? (
          <div className="sm-card p-8 text-center text-slate-500">
            <p>No se encontraron productos.</p>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div key={product.id} className="sm-card p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-slate-900 truncate">{product.name}</h3>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {isLowStock(product) && (
                      <span className="sm-chip sm-chip-danger">Stock bajo</span>
                    )}
                    {isExpiringSoon(product) && (
                      <span className="sm-chip sm-chip-warning">Por vencer</span>
                    )}
                  </div>
                </div>
                <span className="text-lg font-extrabold text-indigo-600 shrink-0">
                  {formatMoney(product.price)}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 rounded-xl p-3 mb-3">
                <Mini label="Stock" value={product.quantity}/>
                <Mini label="Mín." value={product.minStock || "—"}/>
                <Mini label="Vence" value={product.expirationDate || "—"} small/>
              </div>

              <div className="flex gap-2">
                <button onClick={() => handleEdit(product)} className="sm-btn sm-btn-secondary flex-1 text-sm">
                  Editar
                </button>
                <button onClick={() => handleDelete(product.id)} className="sm-btn sm-btn-danger flex-1 text-sm">
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* === Desktop: Table === */}
      <div className="hidden lg:block sm-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-left text-xs uppercase tracking-wider font-bold text-slate-500">Producto</th>
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
                  <td colSpan="7" className="p-10 text-center text-slate-500">
                    No se encontraron productos.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-slate-100 hover:bg-slate-50/70 transition"
                  >
                    <td className="p-4 font-semibold text-slate-900">{product.name}</td>
                    <td className="p-4 text-slate-700">{product.quantity}</td>
                    <td className="p-4 font-semibold text-indigo-600">{formatMoney(product.price)}</td>
                    <td className="p-4 text-slate-700">{product.minStock || "—"}</td>
                    <td className="p-4 text-slate-700">{product.expirationDate || "N/A"}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {isLowStock(product) && (
                          <span className="sm-chip sm-chip-danger">Stock bajo</span>
                        )}
                        {isExpiringSoon(product) && (
                          <span className="sm-chip sm-chip-warning">Por vencer</span>
                        )}
                        {!isLowStock(product) && !isExpiringSoon(product) && (
                          <span className="sm-chip sm-chip-success">OK</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleEdit(product)}
                          className="sm-btn sm-btn-secondary text-sm py-1.5 px-3"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="sm-btn sm-btn-danger text-sm py-1.5 px-3"
                        >
                          Eliminar
                        </button>
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

function FilterToggle({ active, onClick, label, icon, activeClass }) {
  return (
    <button
      onClick={onClick}
      className={`
        sm-btn border transition
        ${active
          ? activeClass + " border"
          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
        }
      `}
    >
      {icon}
      {label}
    </button>
  );
}

function Mini({ label, value, small }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{label}</p>
      <p className={`font-bold text-slate-900 mt-0.5 ${small ? "text-xs" : "text-sm"}`}>
        {value}
      </p>
    </div>
  );
}
