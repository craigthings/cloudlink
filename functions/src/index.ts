import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as cors from 'cors';
admin.initializeApp();

// import serviceAccount from './ServiceAccount';
import AllFunctions from "./Functions";
import CloudLink from './CloudLink';


const corsHandler = cors({ origin: true });

export const methodRequest = CloudLink.expose(AllFunctions, functions.https.onRequest, corsHandler);
