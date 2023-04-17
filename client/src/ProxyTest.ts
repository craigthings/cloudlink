import './firebaseConfig';
import FunctionsProxyFrontend from './FunctionsProxyFrontend';
import AllFunctions from '../../functions/src/AllFunctions';

const baseUrl = 'https://your-cloud-functions-url.com';
FunctionsProxyFrontend.setFunctionsUrl(baseUrl);
const Functions = FunctionsProxyFrontend.proxy(AllFunctions);

export default Functions;

let userData = await Functions.getUserProfileData('abc123');