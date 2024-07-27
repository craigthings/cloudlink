import type Functions from '../../functions/src/Functions';
import CloudLink from "../../functions/src/CloudLink";

const functions = CloudLink.wrap<Functions>("http://localhost:5000/ca-cloudlink/us-central1/methodRequest");

async function init() {
  let user = await functions.getUserProfileData("abc123");
  console.log(user.name, user.age);
  functions.updateUserProfileData("abc123", {name: "John Doe", age: 44});
}

init();

export default functions;