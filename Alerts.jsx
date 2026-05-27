import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { getLowStockProducts } from "../services/productService";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const data = await getLowStockProducts();
      setAlerts(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-red-600 font-bold mb-2">
            Centro de notificaciones
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight flex items-center gap-3" style={{ fontFamily: 'Sora' }}>
            Alertas
            {alerts.length > 0 && (
              <span className="
                inline-flex items-center justify-center
                min-w-[34px] h-9 px-3
                text-sm font-bold
                bg-gradient-to-br from-red-500 to-rose-600 text-white
                rounded-full shadow-lg shadow-red-500/30
                sm-pulse-danger
              ">
                {alerts.length}
              </span>
            )}
          </h1>
          <p className="text-slate-500 mt-2 text-sm sm:text-base">
            Productos que requieren tu atención inmediata.
          </p>
        </div>

        <button onClick={loadAlerts} className="sm-btn sm-btn-secondary self-start sm:self-end">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <polyline points="23 4 23 10 17 10"/>
            <polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          Actualizar
        </button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="sm-card p-5 h-36 sm-skeleton"/>
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="sm-card p-10 sm:p-16 text-center">
          <div className="
            w-20 h-20 mx-auto mb-5 rounded-3xl
            bg-gradient-to-br from-emerald-400 to-teal-500
            flex items-center justify-center
            shadow-xl shadow-emerald-500/30
          ">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-2" style={{ fontFamily: 'Sora' }}>
            ¡Todo en orden!
          </h2>
          <p className="text-slate-500 max-w-md mx-auto">
            No hay alertas activas. Tu inventario está saludable.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm-stagger">
          {alerts.map((product) => {
            const deficit = Number(product.minStock) - Number(product.quantity);
            return (
              <div
                key={product.id}
                className="
                  relative overflow-hidden
                  bg-gradient-to-br from-red-50 via-white to-rose-50
                  border border-red-200/70
                  rounded-2xl p-5
                  shadow-sm hover:shadow-lg
                  transition
                "
              >
                {/* Top stripe */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-500 via-rose-500 to-red-600"/>

                <div className="flex items-start justify-between mb-3">
                  <div className="
                    w-11 h-11 rounded-xl
                    bg-gradient-to-br from-red-500 to-rose-600
                    text-white flex items-center justify-center
                    shadow-md shadow-red-500/30
                  ">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                  </div>
                  <span className="sm-chip sm-chip-danger">
                    Crítico
                  </span>
                </div>

                <h3 className="font-extrabold text-lg text-slate-900 truncate" title={product.name}>
                  {product.name}
                </h3>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-red-100">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-red-500/80">
                      Stock actual
                    </p>
                    <p className="text-2xl font-extrabold text-red-700 mt-0.5">
                      {product.quantity}
                    </p>
                  </div>
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-red-100">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                      Stock mínimo
                    </p>
                    <p className="text-2xl font-extrabold text-slate-700 mt-0.5">
                      {product.minStock}
                    </p>
                  </div>
                </div>

                {deficit > 0 && (
                  <p className="mt-3 text-xs font-semibold text-red-700 bg-red-100/50 px-3 py-2 rounded-lg">
                    Faltan {deficit} unidades para alcanzar el mínimo
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </MainLayout>
  );
}
