import AllFunctions from "./AllFunctions";
import * as FunctionsProxy from './FunctionsProxyBackend';
import * as admin from 'firebase-admin';
import serviceAccount from './ServiceAccount';

admin.initializeApp({
    credential: admin.credential.cert(Object(serviceAccount))
});

export const db = admin.firestore();

const Functions = new AllFunctions(db);

export const getUserProfileData = FunctionsProxy.createProxyFunction(Functions.getUserProfileData);
export const updateUserProfileData = FunctionsProxy.createProxyFunction(Functions.updateUserProfileData);
