import type BackendFunctions from '../../functions/src/Functions';
import CloudLink from "../../CloudLink";
import { db } from './FirebaseConfig';


const baseUrl = 'http://localhost:5000/ca-cloudlink/us-central1';
const Functions = CloudLink.wrap<BackendFunctions>(baseUrl+"/methodRequest");

async function init() {
  let user = await Functions.getUserProfileData("abc123");
  console.log(user.name);
}

init();

Object(window)['Functions'] = Functions;

export default Functions;