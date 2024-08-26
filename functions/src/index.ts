import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as cors from 'cors';
import serviceAccount from './ServiceAccount';
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as any),
});

import Functions from "./Functions";
import CloudLink from '@lib/CloudLink';

const corsHandler = cors({ origin: true });

export const methodRequest = CloudLink.expose(Functions, functions.https.onRequest, corsHandler, admin.auth());
