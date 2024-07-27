import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import firebaseAuthManager from './FirebaseAuthManager';

export const config = {
  apiKey: "AIzaSyAsJ3xYytgVsjIHmLeFfpXP0i1wSnKOD_A",
  authDomain: "ca-cloudlink.firebaseapp.com",
  projectId: "ca-cloudlink",
  storageBucket: "ca-cloudlink.appspot.com",
  messagingSenderId: "200343554244",
  appId: "1:200343554244:web:f35ddaebc7aa51c7c42191"
}

export function init() {
  firebase.initializeApp(config);
}

init();

export const auth = firebase.auth();
export const db = firebase.firestore();
