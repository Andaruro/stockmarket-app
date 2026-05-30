import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import {
  getInventoryStats,
  getLowStockProducts,
  getProducts
} from "../services/productService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalQuantity: 0,
    totalValue: 0
  });
  const [lowStock, setLowStock] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const statsData = await getInventoryStats();
      setStats(statsData);

      const lowStockData = await getLowStockProducts();
      setLowStock(lowStockData);

      const products = await getProducts();
      const formattedChart = products
        .map((product) => ({
          name:
            product.name.length > 12
              ? product.name.slice(0, 12) + "…"
              : product.name,
          cantidad: Number(product.quantity)
        }))
        .slice(0, 12);
      setChartData(formattedChart);
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (n) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0
    }).format(Number(n) || 0);

  return (
    <MainLayout>
      {/* === Header === */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-indigo-600 font-bold mb-2">
            Panel principal
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight" style={{ fontFamily: 'Sora' }}>
            Dashboard
          </h1>
          <p className="text-slate-500 mt-2 text-sm sm:text-base">
            Resumen de tu inventario en tiempo real.
          </p>
        </div>

        <button
          onClick={loadDashboard}
          className="sm-btn sm-btn-secondary self-start sm:self-end"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <polyline points="23 4 23 10 17 10"/>
            <polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          Actualizar
        </button>
      </div>

      {/* === KPI Cards === */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm-stagger">
        <KpiCard
          label="Productos"
          value={loading ? "—" : stats.totalProducts}
          accent="indigo"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
            </svg>
          }
        />
        <KpiCard
          label="Stock total"
          value={loading ? "—" : stats.totalQuantity}
          accent="teal"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M3 3v18h18"/>
              <path d="M7 16l4-8 4 6 4-10"/>
            </svg>
          }
        />
        <KpiCard
          label="Valor inventario"
          value={loading ? "—" : formatMoney(stats.totalValue)}
          accent="amber"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          }
        />
      </div>

      {/* === Chart === */}
      <div className="sm-card p-5 sm:p-7 mb-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold" style={{ fontFamily: 'Sora' }}>
              Inventario general
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Top productos por cantidad en stock
            </p>
          </div>
          <span className="sm-chip sm-chip-info hidden sm:inline-flex">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"/>
            En vivo
          </span>
        </div>

        <div className="w-full" style={{ height: 320 }}>
          {chartData.length > 0 ? (
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#14b8a6" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false}/>
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(99,102,241,0.06)" }}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 10px 25px -5px rgba(15,23,42,0.1)",
                    fontSize: 13
                  }}
                />
                <Bar
                  dataKey="cantidad"
                  fill="url(#barGradient)"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={42}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState
              title="Sin datos aún"
              subtitle="Agrega productos para ver el gráfico."
            />
          )}
        </div>
      </div>

      {/* === Critical products === */}
      <div className="sm-card p-5 sm:p-7">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2" style={{ fontFamily: 'Sora' }}>
              Productos críticos
              {lowStock.length > 0 && (
                <span className="sm-chip sm-chip-danger sm-pulse-danger">
                  {lowStock.length}
                </span>
              )}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Stock por debajo del mínimo
            </p>
          </div>
        </div>

        {lowStock.length === 0 ? (
          <EmptyState
            title="¡Todo bajo control!"
            subtitle="No hay alertas activas en este momento."
            success
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStock.map((product) => (
              <div
                key={product.id}
                className="
                  relative overflow-hidden
                  bg-gradient-to-br from-red-50 to-rose-50
                  border border-red-200
                  rounded-2xl p-4
                  hover:shadow-md transition
                "
              >
                <div className="absolute top-3 right-3">
                  <span className="sm-chip sm-chip-danger">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
                      <path d="M12 9v4M12 17h.01"/>
                      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    </svg>
                    Crítico
                  </span>
                </div>
                <h3 className="font-bold text-red-900 pr-16 truncate">
                  {product.name}
                </h3>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold text-red-700">
                    {product.quantity}
                  </span>
                  <span className="text-xs text-red-500/80">
                    / mín {product.minStock || "—"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

/* === Helpers === */

function KpiCard({ label, value, icon, accent }) {
  const accents = {
    indigo: {
      bg: "from-indigo-500 to-indigo-600",
      glow: "shadow-indigo-500/25",
      ring: "ring-indigo-100"
    },
    teal: {
      bg: "from-teal-500 to-emerald-600",
      glow: "shadow-teal-500/25",
      ring: "ring-teal-100"
    },
    amber: {
      bg: "from-amber-500 to-orange-500",
      glow: "shadow-amber-500/25",
      ring: "ring-amber-100"
    }
  };
  const c = accents[accent] || accents.indigo;

  return (
    <div className="sm-card p-5 sm:p-6 relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wider font-semibold text-slate-500">
            {label}
          </p>
          <p className="text-3xl sm:text-4xl font-extrabold mt-2 tracking-tight truncate" style={{ fontFamily: 'Sora' }}>
            {value}
          </p>
        </div>
        <div className={`
          shrink-0 w-11 h-11 rounded-xl
          bg-gradient-to-br ${c.bg}
          text-white shadow-lg ${c.glow}
          flex items-center justify-center
          ring-4 ${c.ring}
        `}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ title, subtitle, success = false }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className={`
        w-14 h-14 rounded-2xl flex items-center justify-center mb-3
        ${success ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"}
      `}>
        {success ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M3 9h18"/>
          </svg>
        )}
      </div>
      <p className="font-semibold text-slate-700">{title}</p>
      <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
    </div>
  );
}
