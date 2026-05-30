import * as XLSX from "xlsx";

import { addProduct }
from "./productService";

export const importExcel =
  async (file) => {

    const data =
      await file.arrayBuffer();

    const workbook =
      XLSX.read(data);

    const sheetName =
      workbook.SheetNames[0];

    const worksheet =
      workbook.Sheets[sheetName];

    const products =
      XLSX.utils.sheet_to_json(
        worksheet
      );

    for (const product of products) {

      await addProduct(product);

    }

  };