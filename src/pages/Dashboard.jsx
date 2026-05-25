import { useEffect, useState }
from "react";

import MainLayout
from "../layouts/MainLayout";

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
  ResponsiveContainer
} from "recharts";

export default function Dashboard() {

  const [stats, setStats] =
    useState({
      totalProducts: 0,
      totalQuantity: 0,
      totalValue: 0
    });

  const [lowStock, setLowStock] =
    useState([]);

  const [chartData, setChartData] =
    useState([]);

  useEffect(() => {

    loadDashboard();

  }, []);

  const loadDashboard = async () => {

    const statsData =
      await getInventoryStats();

    setStats(statsData);

    const lowStockData =
      await getLowStockProducts();

    setLowStock(lowStockData);

    const products =
      await getProducts();

    const formattedChart =
      products.map((product) => ({
        name: product.name,
        cantidad:
          Number(product.quantity)
      }));

    setChartData(formattedChart);

  };

  return (

    <MainLayout>

      <div>

        <h1 className="
          text-4xl
          font-bold
          mb-8
        ">
          Dashboard
        </h1>

        <div className="
          grid
          md:grid-cols-3
          gap-6
          mb-10
        ">

          <div className="
            bg-white
            p-6
            rounded-2xl
            shadow
          ">

            <h2 className="
              text-lg
              text-gray-500
            ">
              Productos
            </h2>

            <p className="
              text-4xl
              font-bold
              mt-2
            ">
              {stats.totalProducts}
            </p>

          </div>

          <div className="
            bg-white
            p-6
            rounded-2xl
            shadow
          ">

            <h2 className="
              text-lg
              text-gray-500
            ">
              Stock Total
            </h2>

            <p className="
              text-4xl
              font-bold
              mt-2
            ">
              {stats.totalQuantity}
            </p>

          </div>

          <div className="
            bg-white
            p-6
            rounded-2xl
            shadow
          ">

            <h2 className="
              text-lg
              text-gray-500
            ">
              Valor Inventario
            </h2>

            <p className="
              text-4xl
              font-bold
              mt-2
            ">
              ${stats.totalValue}
            </p>

          </div>

        </div>

        <div className="
          bg-white
          p-6
          rounded-2xl
          shadow
          mb-10
        ">

          <h2 className="
            text-2xl
            font-bold
            mb-6
          ">
            Inventario General
          </h2>

          <div style={{
            width: "100%",
            height: 300
          }}>

            <ResponsiveContainer>

              <BarChart
                data={chartData}
              >

                <XAxis dataKey="name" />

                <YAxis />

                <Tooltip />

                <Bar
                  dataKey="cantidad"
                  fill="#0f172a"
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>

        <div className="
          bg-white
          p-6
          rounded-2xl
          shadow
        ">

          <h2 className="
            text-2xl
            font-bold
            mb-6
          ">
            Productos Críticos
          </h2>

          {lowStock.length === 0 ? (

            <p>
              No hay alertas activas.
            </p>

          ) : (

            <div className="
              grid
              gap-4
            ">

              {lowStock.map((product) => (

                <div
                  key={product.id}
                  className="
                    bg-red-100
                    border
                    border-red-300
                    p-4
                    rounded-xl
                  "
                >

                  <h3 className="
                    text-xl
                    font-bold
                  ">
                    {product.name}
                  </h3>

                  <p>
                    Stock:
                    {" "}
                    {product.quantity}
                  </p>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>

    </MainLayout>
  );
}