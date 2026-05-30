import {
  getAuth,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";

import { initializeApp }
from "firebase/app";

import { db }
from "../firebase/config";

const auth = getAuth();

export const loginUser = async (
  email,
  password
) => {

  try {

    const userCredential =
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

    return userCredential.user;

  } catch (error) {

    console.error(error);

  }

};

export const logoutUser = async () => {

  try {

    await signOut(auth);

  } catch (error) {

    console.error(error);

  }

};