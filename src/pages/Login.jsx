import { useState } from "react";

import { useNavigate }
from "react-router-dom";

import { loginUser }
from "../services/authService";

export default function Login() {

  const navigate = useNavigate();

  const [formData, setFormData] =
    useState({
      email: "",
      password: ""
    });

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    const user =
      await loginUser(
        formData.email,
        formData.password
      );

    if (user) {

      alert("Login exitoso");

      navigate("/");

    } else {

      alert("Credenciales inválidas");

    }

  };

  return (

    <div className="
      min-h-screen
      flex
      items-center
      justify-center
      bg-slate-100
    ">

      <form
        onSubmit={handleSubmit}
        className="
          bg-white
          p-8
          rounded-2xl
          shadow
          w-full
          max-w-md
        "
      >

        <h1 className="
          text-3xl
          font-bold
          mb-6
          text-center
        ">
          StockMarket Login
        </h1>

        <div className="mb-4">

          <label className="block mb-2">
            Email
          </label>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="
              w-full
              border
              p-3
              rounded-lg
            "
            required
          />

        </div>

        <div className="mb-6">

          <label className="block mb-2">
            Contraseña
          </label>

          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="
              w-full
              border
              p-3
              rounded-lg
            "
            required
          />

        </div>

        <button
          type="submit"
          className="
            w-full
            bg-slate-900
            text-white
            py-3
            rounded-lg
            hover:bg-slate-700
          "
        >
          Iniciar Sesión
        </button>

      </form>

    </div>
  );
}