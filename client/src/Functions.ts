import type AllFunctions from '../../functions/src/AllFunctions';
import { db } from './FirebaseConfig';

import CloudLink from "../../CloudLink";

const baseUrl = 'http://localhost:5000/ca-cloudlink/us-central1';
const Functions = CloudLink.wrap<AllFunctions>(baseUrl+"/methodRequest");

async function init() {
  let user = await Functions.getUserProfileData("abc123");
  console.log(user.name);
}

init();

Object(window)['Functions'] = Functions;

export default Functions;