import './firebaseConfig';
import FunctionsProxyFrontend from './FunctionsProxyFrontend';
import AllFunctions from '../../functions/src/AllFunctions';

const baseUrl = 'https://your-cloud-functions-url.com';
FunctionsProxyFrontend.initialize(baseUrl);
const Functions = FunctionsProxyFrontend.proxy(AllFunctions);

export default Functions;

let a = await Functions.getUserProfileData('abc123');