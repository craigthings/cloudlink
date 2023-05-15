import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAsJ3xYytgVsjIHmLeFfpXP0i1wSnKOD_A",
    authDomain: "ca-cloudlink.firebaseapp.com",
    projectId: "ca-cloudlink",
    storageBucket: "ca-cloudlink.appspot.com",
    messagingSenderId: "200343554244",
    appId: "1:200343554244:web:f35ddaebc7aa51c7c42191"
}

firebase.initializeApp(firebaseConfig);

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      console.log('Firebase app is fully initialized and ready for database calls.');
      // Make database calls here
    } else {
      console.log('User is not authenticated.');
    }
  });

export const auth = firebase.auth();
export const db = firebase.firestore();
