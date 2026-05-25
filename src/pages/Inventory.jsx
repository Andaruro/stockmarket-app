import { useEffect, useState } from "react";

import MainLayout from "../layouts/MainLayout";

import {
  exportToExcel,
  exportToPDF
} from "../services/exportService";

import {
  getProducts,
  deleteProduct,
  updateProduct
} from "../services/productService";

export default function Inventory() {

  const [products, setProducts] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [showLowStock, setShowLowStock] =
    useState(false);

  const [showExpiring, setShowExpiring] =
    useState(false);

  const [editingProduct, setEditingProduct] =
    useState(null);

  const [formData, setFormData] =
    useState({
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

    const data =
      await getProducts();

    setProducts(data);

  };

  const handleDelete = async (id) => {

    const confirmDelete =
      window.confirm(
        "¿Eliminar producto?"
      );

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
      expirationDate:
        product.expirationDate || ""
    });

  };

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  };

  const handleUpdate = async (e) => {

    e.preventDefault();

    await updateProduct(
      editingProduct.id,
      formData
    );

    setEditingProduct(null);

    loadProducts();

  };

  const filteredProducts =
    products.filter((product) => {

      const matchesSearch =
        product.name
          .toLowerCase()
          .includes(
            search.toLowerCase()
          );

      const matchesLowStock =
        !showLowStock ||
        Number(product.quantity) <=
        Number(product.minStock);

      const matchesExpiring =
        !showExpiring ||
        (
          product.expirationDate &&
          (
            new Date(product.expirationDate)
            - new Date()
          ) /
          (1000 * 60 * 60 * 24)
          <= 7
        );

      return (
        matchesSearch &&
        matchesLowStock &&
        matchesExpiring
      );

    });

  return (

    <MainLayout>

      <div>

        <h1 className="
          text-4xl
          font-bold
          mb-8
        ">
          Inventario
        </h1>

        <div className="
          flex
          gap-4
          mb-6
          flex-wrap
        ">

          <button
            onClick={() =>
              exportToExcel(products)
            }
            className="
              bg-green-600
              text-white
              px-4
              py-2
              rounded-lg
            "
          >
            Exportar Excel
          </button>

          <button
            onClick={() =>
              exportToPDF(products)
            }
            className="
              bg-red-600
              text-white
              px-4
              py-2
              rounded-lg
            "
          >
            Exportar PDF
          </button>

        </div>

        <div className="
          flex
          flex-wrap
          gap-4
          mb-6
        ">

          <input
            type="text"
            placeholder="Buscar producto..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="
              border
              p-3
              rounded-lg
              flex-1
            "
          />

          <button
            onClick={() =>
              setShowLowStock(
                !showLowStock
              )
            }
            className="
              bg-yellow-500
              text-white
              px-4
              py-2
              rounded-lg
            "
          >
            Stock Bajo
          </button>

          <button
            onClick={() =>
              setShowExpiring(
                !showExpiring
              )
            }
            className="
              bg-orange-500
              text-white
              px-4
              py-2
              rounded-lg
            "
          >
            Próximos a Vencer
          </button>

        </div>

        {editingProduct && (

          <form
            onSubmit={handleUpdate}
            className="
              bg-white
              p-6
              rounded-2xl
              shadow
              mb-8
              grid
              gap-4
            "
          >

            <h2 className="
              text-2xl
              font-bold
            ">
              Editar Producto
            </h2>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="
                border
                p-3
                rounded-lg
              "
            />

            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="
                border
                p-3
                rounded-lg
              "
            />

            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="
                border
                p-3
                rounded-lg
              "
            />

            <input
              type="number"
              name="minStock"
              value={formData.minStock}
              onChange={handleChange}
              className="
                border
                p-3
                rounded-lg
              "
            />

            <input
              type="date"
              name="expirationDate"
              value={formData.expirationDate}
              onChange={handleChange}
              className="
                border
                p-3
                rounded-lg
              "
            />

            <button
              type="submit"
              className="
                bg-blue-600
                text-white
                p-3
                rounded-lg
              "
            >
              Guardar Cambios
            </button>

          </form>

        )}

        <div className="
          bg-white
          rounded-2xl
          shadow
          p-6
          overflow-x-auto
        ">

          <table className="w-full">

            <thead>

              <tr className="border-b">

                <th className="p-3 text-left">
                  Producto
                </th>

                <th className="p-3 text-left">
                  Cantidad
                </th>

                <th className="p-3 text-left">
                  Precio
                </th>

                <th className="p-3 text-left">
                  Stock Mínimo
                </th>

                <th className="p-3 text-left">
                  Vencimiento
                </th>

                <th className="p-3 text-left">
                  Acciones
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredProducts.map((product) => (

                <tr
                  key={product.id}
                  className="border-b"
                >

                  <td className="p-3">
                    {product.name}
                  </td>

                  <td className="p-3">
                    {product.quantity}
                  </td>

                  <td className="p-3">
                    ${product.price}
                  </td>

                  <td className="p-3">
                    {product.minStock}
                  </td>

                  <td className="p-3">
                    {
                      product.expirationDate ||
                      "N/A"
                    }
                  </td>

                  <td className="
                    p-3
                    flex
                    gap-2
                  ">

                    <button
                      onClick={() =>
                        handleEdit(product)
                      }
                      className="
                        bg-blue-500
                        text-white
                        px-4
                        py-2
                        rounded-lg
                      "
                    >
                      Editar
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(product.id)
                      }
                      className="
                        bg-red-500
                        text-white
                        px-4
                        py-2
                        rounded-lg
                      "
                    >
                      Eliminar
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </MainLayout>
  );
}