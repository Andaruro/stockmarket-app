import * as XLSX from "xlsx";

import jsPDF from "jspdf";

import autoTable from "jspdf-autotable";

export const exportToExcel = (
  products
) => {

  const worksheet =
    XLSX.utils.json_to_sheet(products);

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Inventario"
  );

  XLSX.writeFile(
    workbook,
    "inventario.xlsx"
  );

};

export const exportToPDF = (
  products
) => {

  const doc = new jsPDF();

  doc.text(
    "Reporte Inventario",
    14,
    15
  );

  autoTable(doc, {

    startY: 25,

    head: [[
      "Producto",
      "Cantidad",
      "Precio",
      "Stock Min",
      "Vencimiento"
    ]],

    body: products.map((p) => ([
      p.name,
      p.quantity,
      p.price,
      p.minStock,
      p.expirationDate || "N/A"
    ]))

  });

  doc.save("inventario.pdf");

};