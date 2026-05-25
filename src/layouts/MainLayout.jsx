import { Link, useNavigate } from "react-router-dom";

import { logoutUser } from "../services/authService";

export default function MainLayout({ children }) {

  const navigate = useNavigate();

  const handleLogout = async () => {

    await logoutUser();

    navigate("/login");

  };

  return (

    <div className="flex min-h-screen bg-slate-100">

      <aside className="w-64 bg-slate-900 text-white p-6">

        <h1 className="text-2xl font-bold">
          StockMarket
        </h1>

        <nav className="flex flex-col gap-4 mt-10">

          <Link className={linkStyle} to="/">
            Dashboard
          </Link>

          <Link className={linkStyle} to="/inventory">
            Inventario
          </Link>

          <Link className={linkStyle} to="/products">
            Productos
          </Link>

          <Link className={linkStyle} to="/alerts">
            Alertas
          </Link>

          <button
            onClick={handleLogout}
            className="
              bg-red-500
              text-white
              p-3
              rounded-lg
              hover:bg-red-600
              transition
              mt-6
            "
          >
            Cerrar Sesión
          </button>

        </nav>

      </aside>

      <main className="flex-1 p-8">

        {children}

      </main>

    </div>
  );
}

const linkStyle =
  "hover:bg-slate-700 p-3 rounded-lg transition";