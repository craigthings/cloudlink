import './firebaseConfig';
import FunctionsProxyFrontend from './FunctionsProxyFrontend';
import AllFunctions from '../../functions/src/AllFunctions';

const baseUrl = 'http://localhost:5001';
FunctionsProxyFrontend.setFunctionsUrl(baseUrl);
const Functions = FunctionsProxyFrontend.proxy(AllFunctions);

export default Functions;