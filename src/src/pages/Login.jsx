import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await loginUser(formData.email, formData.password);
      if (user) {
        navigate("/");
      } else {
        setError("Credenciales inválidas. Intenta de nuevo.");
      }
    } catch (err) {
      setError("Ocurrió un error. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2">
      {/* === Decorative panel (desktop) === */}
      <div className="
        hidden lg:flex relative overflow-hidden
        bg-slate-900
        flex-col justify-between
        p-12 text-white
      ">
        <div className="absolute inset-0 pointer-events-none"
             style={{
               background: `
                 radial-gradient(800px 500px at 0% 0%, rgba(99,102,241,0.35), transparent 60%),
                 radial-gradient(700px 400px at 100% 100%, rgba(45,212,191,0.25), transparent 60%),
                 radial-gradient(400px 300px at 80% 20%, rgba(244,114,182,0.18), transparent 60%)
               `
             }}/>

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.04]"
             style={{
               backgroundImage:
                 "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
               backgroundSize: "32px 32px"
             }}/>

        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="
              w-12 h-12 rounded-2xl
              bg-gradient-to-br from-indigo-500 via-indigo-600 to-teal-500
              flex items-center justify-center
              shadow-xl shadow-indigo-500/40
            ">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
                <path d="m3.3 7 8.7 5 8.7-5"/>
                <path d="M12 22V12"/>
              </svg>
            </div>
            <div>
              <div className="font-extrabold text-2xl tracking-tight" style={{ fontFamily: 'Sora' }}>
                StockMarket
              </div>
              <div className="text-xs text-white/50 tracking-[0.25em] uppercase">
                Inventory OS
              </div>
            </div>
          </div>
        </div>

        <div className="relative max-w-md">
          <h2 className="text-5xl font-extrabold leading-[1.05] mb-6" style={{ fontFamily: 'Sora' }}>
            Controla tu <span className="bg-gradient-to-r from-indigo-300 to-teal-300 bg-clip-text text-transparent">inventario</span> sin esfuerzo.
          </h2>
          <p className="text-white/70 text-lg leading-relaxed">
            Escanea, registra, exporta y mantén bajo control cada producto. Todo en un solo lugar.
          </p>

          <div className="grid grid-cols-3 gap-4 mt-10">
            <Stat number="OCR" label="Reconocimiento IA"/>
            <Stat number="📊" label="Reportes en vivo"/>
            <Stat number="🔔" label="Alertas smart"/>
          </div>
        </div>

        <div className="relative text-xs text-white/40">
          © {new Date().getFullYear()} StockMarket — Gestión inteligente de inventario
        </div>
      </div>

      {/* === Form panel === */}
      <div className="flex items-center justify-center p-6 sm:p-10 bg-white relative">
        {/* Mobile brand */}
        <div className="lg:hidden absolute top-6 left-6 flex items-center gap-2">
          <div className="
            w-10 h-10 rounded-xl
            bg-gradient-to-br from-indigo-500 via-indigo-600 to-teal-500
            flex items-center justify-center
            shadow-lg shadow-indigo-500/30
          ">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
              <path d="m3.3 7 8.7 5 8.7-5"/>
              <path d="M12 22V12"/>
            </svg>
          </div>
          <span className="font-extrabold text-lg" style={{ fontFamily: 'Sora' }}>
            StockMarket
          </span>
        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md sm-fade-in"
        >
          <div className="mb-8 mt-12 lg:mt-0">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ fontFamily: 'Sora' }}>
              Bienvenido 👋
            </h1>
            <p className="text-slate-500 mt-2">
              Inicia sesión para continuar a tu panel.
            </p>
          </div>

          {error && (
            <div className="
              mb-5 p-3.5 rounded-xl
              bg-red-50 border border-red-200
              text-red-700 text-sm font-medium
              flex items-start gap-2
            ">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <div className="mb-5">
            <label className="sm-label">Correo electrónico</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@empresa.com"
              className="sm-input"
              required
              autoComplete="email"
            />
          </div>

          <div className="mb-6">
            <label className="sm-label">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="sm-input pr-12"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                aria-label="Mostrar contraseña"
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="sm-btn sm-btn-primary w-full py-3.5 text-base disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeOpacity="0.25" strokeWidth="4"/>
                  <path d="M4 12a8 8 0 0 1 8-8" stroke="white" strokeWidth="4" strokeLinecap="round"/>
                </svg>
                Iniciando sesión...
              </>
            ) : (
              <>
                Iniciar sesión
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </>
            )}
          </button>

          <p className="text-center text-xs text-slate-400 mt-8">
            Acceso protegido · Solo para personal autorizado
          </p>
        </form>
      </div>
    </div>
  );
}

function Stat({ number, label }) {
  return (
    <div className="
      bg-white/5 backdrop-blur-sm
      border border-white/10
      rounded-2xl p-4
      text-center
    ">
      <div className="text-2xl font-extrabold mb-1">{number}</div>
      <div className="text-[11px] text-white/60 uppercase tracking-wider">{label}</div>
    </div>
  );
}
