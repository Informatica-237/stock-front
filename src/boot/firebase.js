// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD9pJHUYb3jgpjRtNsj2fzDzryB4roi1uQ",
  authDomain: "stock-c1d16.firebaseapp.com",
  projectId: "stock-c1d16",
  storageBucket: "stock-c1d16.firebasestorage.app",
  messagingSenderId: "146544357523",
  appId: "1:146544357523:web:17457612fd0e69a5f61d66"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app)

export const auth = getAuth(app)
export { db }
