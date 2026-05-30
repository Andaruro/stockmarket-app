import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore";

import { db } from "../firebase/config";

const productsCollection = collection(db, "products");

export const addProduct = async (product) => {
  try {
    const formattedProduct = {
      name: product.name,
      barcode: product.barcode || "",            // ← NEW: persist barcode
      price: Number(product.price),
      quantity: Number(product.quantity),
      minStock: Number(product.minStock || 0),
      expirationDate: product.expirationDate || null,
    };

    const docRef = await addDoc(productsCollection, formattedProduct);
    return docRef.id;
  } catch (error) {
    console.error(error);
  }
};

export const getProducts = async () => {
  try {
    const querySnapshot = await getDocs(productsCollection);
    const products = [];
    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    return products;
  } catch (error) {
    console.error(error);
  }
};

export const deleteProduct = async (id) => {
  try {
    const productDoc = doc(db, "products", id);
    await deleteDoc(productDoc);
  } catch (error) {
    console.error(error);
  }
};

export const updateProduct = async (id, updatedData) => {
  try {
    const productDoc = doc(db, "products", id);

    const formattedData = {
      name: updatedData.name,
      barcode: updatedData.barcode || "",        // ← NEW: persist barcode
      price: Number(updatedData.price),
      quantity: Number(updatedData.quantity),
      minStock: Number(updatedData.minStock || 0),
      expirationDate: updatedData.expirationDate || null,
    };

    await updateDoc(productDoc, formattedData);
  } catch (error) {
    console.error(error);
  }
};

export const getInventoryStats = async () => {
  try {
    const querySnapshot = await getDocs(productsCollection);
    let totalProducts = 0;
    let totalQuantity = 0;
    let totalValue = 0;

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      totalProducts++;
      totalQuantity += Number(data.quantity);
      totalValue += Number(data.quantity) * Number(data.price);
    });

    return { totalProducts, totalQuantity, totalValue };
  } catch (error) {
    console.error(error);
  }
};

export const getLowStockProducts = async () => {
  try {
    const querySnapshot = await getDocs(productsCollection);
    const lowStock = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (Number(data.quantity) <= Number(data.minStock || 0)) {
        lowStock.push({
          id: doc.id,
          ...data,
        });
      }
    });
    return lowStock;
  } catch (error) {
    console.error(error);
  }
};

export const getExpiringProducts = async () => {
  try {
    const querySnapshot = await getDocs(productsCollection);
    const expiring = [];
    const today = new Date();

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (!data.expirationDate) return;

      const expiration = new Date(data.expirationDate);
      const difference = expiration - today;
      const daysRemaining = difference / (1000 * 60 * 60 * 24);

      if (daysRemaining <= 7) {
        expiring.push({
          id: doc.id,
          ...data,
          daysRemaining: Math.floor(daysRemaining),
        });
      }
    });
    return expiring;
  } catch (error) {
    console.error(error);
  }
};

/* ============================================================
   NEW HELPER — find a product by barcode (case-insensitive,
   trimmed). Optional, but handy if you want to use it elsewhere.
   ============================================================ */
export const getProductByBarcode = async (barcode) => {
  try {
    const clean = String(barcode || "").trim();
    if (!clean) return null;
    const all = await getProducts();
    return (
      all.find((p) => String(p.barcode || "").trim() === clean) || null
    );
  } catch (error) {
    console.error(error);
    return null;
  }
};
