import { useEffect, useState } from "react";

import MainLayout from "../layouts/MainLayout";

import {
  getLowStockProducts
} from "../services/productService";

export default function Alerts() {

  const [alerts, setAlerts] =
    useState([]);

  useEffect(() => {

    loadAlerts();

  }, []);

  const loadAlerts = async () => {

    const data =
      await getLowStockProducts();

    setAlerts(data);

  };

  return (

    <MainLayout>

      <div>

        <h1 className="
          text-4xl
          font-bold
          mb-8
        ">
          Alertas de Stock
        </h1>

        {alerts.length === 0 ? (

          <div className="
            bg-white
            p-6
            rounded-2xl
            shadow
          ">

            <p>
              No hay alertas activas.
            </p>

          </div>

        ) : (

          <div className="grid gap-4">

            {alerts.map((product) => (

              <div
                key={product.id}
                className="
                  bg-red-100
                  border
                  border-red-400
                  p-6
                  rounded-2xl
                "
              >

                <h2 className="
                  text-2xl
                  font-bold
                  text-red-700
                ">
                  {product.name}
                </h2>

                <p className="mt-2">

                  Stock actual:
                  {" "}

                  <strong>
                    {product.quantity}
                  </strong>

                </p>

                <p>

                  Stock mínimo:
                  {" "}

                  <strong>
                    {product.minStock}
                  </strong>

                </p>

              </div>

            ))}

          </div>

        )}

      </div>

    </MainLayout>
  );
}