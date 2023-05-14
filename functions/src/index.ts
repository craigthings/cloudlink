import AllFunctions from "./AllFunctions";
import CloudLink from '../../CloudLink';
import serviceAccount from './ServiceAccount';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as cors from 'cors';

const corsHandler = cors({ origin: true });

admin.initializeApp({
    credential: admin.credential.cert(Object(serviceAccount))
});

export const methodRequest = CloudLink.expose(AllFunctions, functions.https.onRequest, corsHandler);