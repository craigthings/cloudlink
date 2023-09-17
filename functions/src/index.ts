import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as cors from 'cors';
import serviceAccount from './ServiceAccount';
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as any),
});

import AllFunctions from "./Functions";
import CloudLink from './CloudLink';

const corsHandler = cors({ origin: true });

export const methodRequest = CloudLink.expose(AllFunctions, functions.https.onRequest, corsHandler, admin.auth());
