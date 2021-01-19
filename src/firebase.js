import firebase from "firebase/app"
import "firebase/auth"
import "firebase/storage"
import "firebase/database"

var firebaseConfig = {
    apiKey: "AIzaSyAF01RJBlAcelF4Sf7_icX9mgaVvKpgB84",
    authDomain: "react-slack-app-10e29.firebaseapp.com",
    projectId: "react-slack-app-10e29",
    storageBucket: "react-slack-app-10e29.appspot.com",
    messagingSenderId: "166559944837",
    appId: "1:166559944837:web:a4be33007db3a2cddcd9ec",
    measurementId: "G-9Z83TVXH2Y"
  };

firebase.initializeApp(firebaseConfig);

export default firebase;
