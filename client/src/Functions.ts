import type BackendFunctions from '../../functions/src/Functions';
import CloudLink from "../../functions/src/CloudLink";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAsJ3xYytgVsjIHmLeFfpXP0i1wSnKOD_A",
  authDomain: "ca-cloudlink.firebaseapp.com",
  projectId: "ca-cloudlink",
  storageBucket: "ca-cloudlink.appspot.com",
  messagingSenderId: "200343554244",
  appId: "1:200343554244:web:f35ddaebc7aa51c7c42191"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth();
signInWithPopup(auth, new GoogleAuthProvider())
  .then((result) => {
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;
    const user = result.user;
  }).catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    const email = error.customData.email;
    const credential = GoogleAuthProvider.credentialFromError(error);
    // ...
  });

const baseUrl = 'http://localhost:5001';
// const baseUrl = 'http://localhost:5000/ca-cloudlink/us-central1';
const Functions = CloudLink.wrap<BackendFunctions>(baseUrl+"/methodRequest", getAuth());

async function init() {
  let user = await Functions.getUserProfileData("abc123");
  Functions.updateUserProfileData("abc123", {name: "John Doe", age: 44});
  console.log('user', user);
}

init();

Object(window)['Functions'] = Functions;

export default Functions;