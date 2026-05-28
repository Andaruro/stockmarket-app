/**
 * Catalog service
 * ----------------------------------------------------------
 * Loads an Excel catalog (columns: name, barcode, quantity,
 * price, minStock, expirationDate) and lets the scanner look
 * up a product by its barcode.
 *
 * The catalog is kept in localStorage so it survives reloads
 * — load it once from the "Catálogo" page and the scanner
 * works offline afterwards.
 * ----------------------------------------------------------
 */

import * as XLSX from "xlsx";

const STORAGE_KEY = "stockmarket.catalog.v1";

/* ---------------------------------------------------------- */
/* Read catalog from localStorage                              */
/* ---------------------------------------------------------- */
export function getCatalog() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/* ---------------------------------------------------------- */
/* Save catalog to localStorage                                */
/* ---------------------------------------------------------- */
export function saveCatalog(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

/* ---------------------------------------------------------- */
/* Clear catalog                                               */
/* ---------------------------------------------------------- */
export function clearCatalog() {
  localStorage.removeItem(STORAGE_KEY);
}

/* ---------------------------------------------------------- */
/* Load catalog from an uploaded Excel file                    */
/* ---------------------------------------------------------- */
export async function loadCatalogFromExcel(file) {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  // raw: false so the barcode column comes back as a string with leading zeros
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false });

  // Normalise — accept Spanish or English headers
  const items = rows
    .map((row) => {
      const name =
        row.name ?? row.Name ?? row.nombre ?? row.Nombre ?? "";
      const barcode =
        row.barcode ?? row.Barcode ?? row.codigo ?? row.Código ?? row["Código de barras"] ?? "";
      const quantity =
        row.quantity ?? row.Quantity ?? row.cantidad ?? row.Cantidad ?? 0;
      const price =
        row.price ?? row.Price ?? row.precio ?? row.Precio ?? 0;
      const minStock =
        row.minStock ??
        row.MinStock ??
        row["Stock mínimo"] ??
        row.minimo ??
        0;
      const expirationDate =
        row.expirationDate ??
        row.ExpirationDate ??
        row.vencimiento ??
        row.Vencimiento ??
        "";

      return {
        name: String(name).trim(),
        barcode: String(barcode).trim(),
        quantity: Number(quantity) || 0,
        price: Number(price) || 0,
        minStock: Number(minStock) || 0,
        expirationDate: String(expirationDate).trim(),
      };
    })
    .filter((p) => p.name && p.barcode);

  saveCatalog(items);
  return items;
}

/* ---------------------------------------------------------- */
/* Find a product by barcode                                   */
/* ---------------------------------------------------------- */
export function findByBarcode(code) {
  if (!code) return null;
  const clean = String(code).trim();
  const catalog = getCatalog();
  return catalog.find((p) => p.barcode === clean) || null;
}

/* ---------------------------------------------------------- */
/* Quick stats                                                 */
/* ---------------------------------------------------------- */
export function getCatalogStats() {
  const items = getCatalog();
  return {
    total: items.length,
    lastUpdated: localStorage.getItem(STORAGE_KEY + ".updatedAt") || null,
  };
}

export function markCatalogUpdated() {
  localStorage.setItem(STORAGE_KEY + ".updatedAt", new Date().toISOString());
}
