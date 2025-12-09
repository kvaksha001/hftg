import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAbN9xYWOeYMl7q51wQ5_ASK83wb9QaM08",
  authDomain: "hftg-game.firebaseapp.com",
  projectId: "hftg-game",
  storageBucket: "hftg-game.firebasestorage.app",
  messagingSenderId: "390436019406",
  appId: "1:390436019406:web:65ec1979ed551076d1049f",
  measurementId: "G-BPVFP4E4FZ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
