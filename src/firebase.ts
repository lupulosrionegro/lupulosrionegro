// Importa las funciones que necesitas de los SDKs de Firebase
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";

// Configuración de tu aplicación web Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDHsT85-qxs8PEIHPsOjmFYjlGtnsCwoqw",
  authDomain: "esp32proyectolrn.firebaseapp.com",
  databaseURL: "https://esp32proyectolrn-default-rtdb.firebaseio.com",
  projectId: "esp32proyectolrn",
  storageBucket: "esp32proyectolrn.appspot.com",
  messagingSenderId: "838420293232",
  appId: "1:838420293232:web:e2ad782c0cfc28554b36b5",
  measurementId: "G-3GNQLV3V4R"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);

export { app, analytics, database };