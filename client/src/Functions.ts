import FunctionsProxyFrontend from './FunctionsProxyFrontend';
import AllFunctions from '../../functions/src/AllFunctions';
import { db } from './FirebaseConfig';

const baseUrl = 'http://localhost:5000/ca-cloudlink/us-central1';
FunctionsProxyFrontend.setFunctionsUrl(baseUrl);
const Functions = FunctionsProxyFrontend.proxy(new AllFunctions(db));

Object(window)['AllFunctions'] = AllFunctions;

Functions.getUserProfileData('abc123a');

export default Functions;