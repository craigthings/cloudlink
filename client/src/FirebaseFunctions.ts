import type Functions from '../../functions/src/Functions';
import CloudLink from "../../functions/src/CloudLink";
import authManager from './FirebaseAuthManager';
import { auth } from './FirebaseConfig';

const baseUrl = 'http://127.0.0.1:5001/ca-cloudlink/us-central1/';
const baseMethod = 'methodRequest';
const url = baseUrl + baseMethod;

const functions = CloudLink.wrap<Functions>(url, auth);

export async function saveTestUserData() {
  let user = await functions.getUserProfileData("abc123");
  console.log(user.name, user.age);
  functions.updateUserProfileData("abc123", {name: "John Doe", age: 44});
}

export async function saveUserData() {
  let { user } = authManager;
  if(!user) return;
  functions.updateUserProfileData(user.uid, {age: 30, name: user.displayName || ''});
}

export default {
  functions,
  saveTestUserData,
  saveUserData
}