import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyDoYtbcsjrPnuJTVaWmxm-83GD41FJQWpU",
  authDomain: "coinagency-5deab.firebaseapp.com",
  projectId: "coinagency-5deab",
  storageBucket: "coinagency-5deab.firebasestorage.app",
  messagingSenderId: "277438699467",
  appId: "1:277438699467:web:e79a76c73b25bbb942c84e"
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

export { auth, db, storage }
export default app