import * as functions from "firebase-functions";

import AllFunctions from "./AllFunctions";
import FunctionsProxy from './FunctionsProxyBackend';

let WrappedFunctions = FunctionsProxy.proxy(AllFunctions);

export const getUserProfileData = WrappedFunctions.getUserProfileData;
export const updateUserProfileData = WrappedFunctions.updateUserProfileData;