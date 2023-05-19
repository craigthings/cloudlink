import type BackendFunctions from '../../functions/src/Functions';
import CloudLink from "../../functions/src/CloudLink";
import { db } from './FirebaseConfig';


const baseUrl = 'http://localhost:5001/ca-cloudlink/us-central1';
const Functions = CloudLink.wrap<BackendFunctions>(baseUrl+"/methodRequest");

async function init() {
  let user = await Functions.getUserProfileData("abc123");
  console.log(user.name, user.age);
  Functions.updateUserProfileData("abc123", {name: "John Doe", age: 44});
}

init();

Object(window)['Functions'] = Functions;

export default Functions;