// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDRpjHxKWM2QGoFrL3DQO4-sBA43wlpYJY",
  authDomain: "login-auth-ee559.firebaseapp.com",
  projectId: "login-auth-ee559",
  storageBucket: "login-auth-ee559.firebasestorage.app",
  messagingSenderId: "193044213995",
  appId: "1:193044213995:web:b98157b47a2506e1360eae"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db=getFirestore(app);
export default app;