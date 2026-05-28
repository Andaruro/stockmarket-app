import { useState } from "react";

import MainLayout from "../layouts/MainLayout";

import { addProduct }
from "../services/productService";

import OCRUploader
from "../components/OCRUploader";

import BarcodeScanner
from "../components/BarcodeScanner";

export default function Products() {

  const [product, setProduct] =
    useState({
      name: "",
      barcode: "",
      quantity: "",
      price: "",
      minStock: "",
      expirationDate: ""
    });

  const handleChange = (e) => {

    setProduct({
      ...product,
      [e.target.name]:
        e.target.value
    });

  };

  const handleOCRText = (text) => {

    const dateRegex =
      /\d{4}-\d{2}-\d{2}/;

    const match =
      text.match(dateRegex);

    if (match) {

      setProduct((prev) => ({
        ...prev,
        expirationDate:
          match[0]
      }));

    }

  };

  const handleBarcodeScan =
    (code) => {

      try {

        const cleanCode =
          code.trim();

        const values =
          cleanCode.split(",");

        if (
          values.length < 5
        ) {

          alert(
            "Formato QR inválido"
          );

          return;

        }

        setProduct({
          name:
            values[0].trim(),

          barcode:
            cleanCode,

          price:
            values[1].trim(),

          quantity:
            values[2].trim(),

          minStock:
            values[3].trim(),

          expirationDate:
            values[4].trim()
        });

      } catch (error) {

        console.error(
          "QR inválido",
          error
        );

      }

    };

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      try {

        await addProduct(
          product
        );

        alert(
          "Producto registrado"
        );

        setProduct({
          name: "",
          barcode: "",
          quantity: "",
          price: "",
          minStock: "",
          expirationDate: ""
        });

      } catch (error) {

        console.error(error);

      }

    };

  return (

    <MainLayout>

      <div className="
        max-w-xl
      ">

        <h1 className="
          text-3xl
          font-bold
          mb-6
        ">
          Registrar Producto
        </h1>

        <OCRUploader
          onTextDetected={
            handleOCRText
          }
        />

        <BarcodeScanner
          onScan={
            handleBarcodeScan
          }
        />

        <form
          onSubmit={
            handleSubmit
          }
          className="
            bg-white
            p-6
            rounded-2xl
            shadow
          "
        >

          <div className="
            mb-4
          ">

            <label className="
              block mb-2
            ">
              Nombre
            </label>

            <input
              type="text"
              name="name"
              value={product.name}
              onChange={
                handleChange
              }
              className="
                w-full
                border
                p-3
                rounded-lg
              "
              required
            />

          </div>

          <div className="
            mb-4
          ">

            <label className="
              block mb-2
            ">
              Código QR
            </label>

            <input
              type="text"
              name="barcode"
              value={
                product.barcode
              }
              onChange={
                handleChange
              }
              className="
                w-full
                border
                p-3
                rounded-lg
              "
            />

          </div>

          <div className="
            mb-4
          ">

            <label className="
              block mb-2
            ">
              Cantidad
            </label>

            <input
              type="number"
              name="quantity"
              value={
                product.quantity
              }
              onChange={
                handleChange
              }
              className="
                w-full
                border
                p-3
                rounded-lg
              "
              required
            />

          </div>

          <div className="
            mb-4
          ">

            <label className="
              block mb-2
            ">
              Stock mínimo
            </label>

            <input
              type="number"
              name="minStock"
              value={
                product.minStock
              }
              onChange={
                handleChange
              }
              className="
                w-full
                border
                p-3
                rounded-lg
              "
              required
            />

          </div>

          <div className="
            mb-4
          ">

            <label className="
              block mb-2
            ">
              Precio
            </label>

            <input
              type="number"
              name="price"
              value={
                product.price
              }
              onChange={
                handleChange
              }
              className="
                w-full
                border
                p-3
                rounded-lg
              "
              required
            />

          </div>

          <div className="
            mb-6
          ">

            <label className="
              block mb-2
            ">
              Fecha de vencimiento
            </label>

            <input
              type="date"
              name="expirationDate"
              value={
                product.expirationDate
              }
              onChange={
                handleChange
              }
              className="
                w-full
                border
                p-3
                rounded-lg
              "
            />

          </div>

          <button
            type="submit"
            className="
              bg-slate-900
              text-white
              px-6
              py-3
              rounded-lg
              hover:bg-slate-700
              transition
            "
          >
            Guardar Producto
          </button>

        </form>

      </div>

    </MainLayout>
  );
}

};
