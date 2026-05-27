import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { logoutUser } from "../services/authService";

const ICONS = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="3" y="3" width="7" height="9" rx="1.5"/>
      <rect x="14" y="3" width="7" height="5" rx="1.5"/>
      <rect x="14" y="12" width="7" height="9" rx="1.5"/>
      <rect x="3" y="16" width="7" height="5" rx="1.5"/>
    </svg>
  ),
  inventory: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
      <path d="m3.3 7 8.7 5 8.7-5"/>
      <path d="M12 22V12"/>
    </svg>
  ),
  products: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M5 7h14l-1.5 12.5a2 2 0 0 1-2 1.5h-7a2 2 0 0 1-2-1.5Z"/>
      <path d="M9 7V5a3 3 0 0 1 6 0v2"/>
    </svg>
  ),
  alerts: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  menu: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <line x1="4" y1="6" x2="20" y2="6"/>
      <line x1="4" y1="12" x2="20" y2="12"/>
      <line x1="4" y1="18" x2="20" y2="18"/>
    </svg>
  ),
  close: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
};

const NAV_ITEMS = [
  { to: "/",          label: "Dashboard",  icon: ICONS.dashboard },
  { to: "/inventory", label: "Inventario", icon: ICONS.inventory },
  { to: "/products",  label: "Productos",  icon: ICONS.products },
  { to: "/alerts",    label: "Alertas",    icon: ICONS.alerts },
];

export default function MainLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  const isActive = (to) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  return (
    <div className="min-h-screen flex">
      {/* === Sidebar - Desktop === */}
      <aside className="
        hidden lg:flex flex-col
        w-72 shrink-0
        bg-slate-900 text-white
        sticky top-0 h-screen
        relative overflow-hidden
      ">
        {/* Decorative gradient */}
        <div className="absolute inset-0 pointer-events-none opacity-60"
             style={{ background: "radial-gradient(600px 300px at 0% 0%, rgba(99,102,241,0.25), transparent 60%), radial-gradient(500px 250px at 100% 100%, rgba(45,212,191,0.18), transparent 60%)" }}/>

        <div className="relative flex flex-col h-full p-6">
          <BrandLogo />

          <nav className="flex flex-col gap-1.5 mt-10 flex-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                {...item}
                active={isActive(item.to)}
              />
            ))}
          </nav>

          <button
            onClick={handleLogout}
            className="
              flex items-center gap-3
              px-4 py-3 rounded-xl
              text-slate-300 hover:text-white
              hover:bg-red-500/20
              transition
              font-medium
            "
          >
            {ICONS.logout}
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* === Mobile Topbar === */}
      <header className="
        lg:hidden
        fixed top-0 inset-x-0 z-30
        flex items-center justify-between
        px-4 py-3
        bg-white/85 backdrop-blur-lg
        border-b border-slate-200/70
      ">
        <BrandLogo compact />
        <button
          onClick={() => setMobileOpen(true)}
          className="sm-btn sm-btn-ghost sm-btn-icon"
          aria-label="Abrir menú"
        >
          {ICONS.menu}
        </button>
      </header>

      {/* === Mobile drawer === */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className="
              relative ml-auto w-72 h-full
              bg-slate-900 text-white
              p-6 flex flex-col
              sm-fade-in
            "
            style={{ animationDuration: "0.25s" }}
          >
            <div className="flex items-center justify-between">
              <BrandLogo />
              <button
                onClick={() => setMobileOpen(false)}
                className="text-white/80 hover:text-white"
                aria-label="Cerrar menú"
              >
                {ICONS.close}
              </button>
            </div>

            <nav className="flex flex-col gap-1.5 mt-8 flex-1">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  {...item}
                  active={isActive(item.to)}
                  onClick={() => setMobileOpen(false)}
                />
              ))}
            </nav>

            <button
              onClick={() => { setMobileOpen(false); handleLogout(); }}
              className="
                flex items-center gap-3
                px-4 py-3 rounded-xl
                text-slate-300 hover:text-white
                hover:bg-red-500/20
                transition font-medium
              "
            >
              {ICONS.logout}
              Cerrar sesión
            </button>
          </aside>
        </div>
      )}

      {/* === Main content === */}
      <main className="
        flex-1 min-w-0
        pt-20 lg:pt-0
        pb-24 lg:pb-0
        px-4 sm:px-6 lg:px-10
        py-6 lg:py-10
      ">
        <div className="max-w-7xl mx-auto sm-fade-in">
          {children}
        </div>
      </main>

      {/* === Bottom nav (mobile) === */}
      <nav className="
        lg:hidden
        fixed bottom-0 inset-x-0 z-30
        bg-white/95 backdrop-blur-lg
        border-t border-slate-200/70
        sm-safe-bottom
      ">
        <div className="flex items-center justify-around px-2 py-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`
                flex flex-col items-center justify-center
                flex-1 py-1.5 rounded-xl
                transition
                ${isActive(item.to)
                  ? "text-indigo-600"
                  : "text-slate-500 hover:text-slate-700"
                }
              `}
            >
              <div className={`
                p-1.5 rounded-lg
                ${isActive(item.to) ? "bg-indigo-50" : ""}
              `}>
                {item.icon}
              </div>
              <span className="text-[10px] font-semibold mt-0.5">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

/* === Sub-components === */

function BrandLogo({ compact = false }) {
  return (
    <Link to="/" className="flex items-center gap-2.5 group">
      <div className="
        relative w-10 h-10 rounded-xl
        bg-gradient-to-br from-indigo-500 via-indigo-600 to-teal-500
        flex items-center justify-center
        shadow-lg shadow-indigo-500/30
        group-hover:scale-105 transition
      ">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
          <path d="m3.3 7 8.7 5 8.7-5"/>
          <path d="M12 22V12"/>
        </svg>
      </div>
      {!compact && (
        <div className="flex flex-col leading-none">
          <span className="font-extrabold text-lg tracking-tight" style={{ fontFamily: 'Sora' }}>
            StockMarket
          </span>
          <span className="text-[10px] text-white/50 tracking-[0.2em] uppercase mt-0.5">
            Inventory OS
          </span>
        </div>
      )}
      {compact && (
        <span className="font-extrabold text-lg tracking-tight text-slate-900" style={{ fontFamily: 'Sora' }}>
          StockMarket
        </span>
      )}
    </Link>
  );
}

function NavLink({ to, label, icon, active, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`
        relative flex items-center gap-3
        px-4 py-3 rounded-xl
        font-medium text-sm
        transition
        ${active
          ? "bg-white/10 text-white shadow-inner"
          : "text-slate-300 hover:text-white hover:bg-white/5"
        }
      `}
    >
      {active && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gradient-to-b from-indigo-400 to-teal-400"
        />
      )}
      <span className={active ? "text-indigo-300" : ""}>
        {icon}
      </span>
      {label}
    </Link>
  );
}
