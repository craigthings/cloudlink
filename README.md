# ⚠ In Development ⚠

# CloudLink Library

CloudLink is a lightweight library that simplifies the interaction between client-side code and Firebase Cloud Functions. It provides an abstraction layer inspired by Comlink, allowing you to call server-side functions as if they were local asynchronous functions.

## Call Firebase Functions like local functions

### Server-side

```ts
async function getUserData() {
    return { name: 'John Doe', age: 34 }
}
```

### Client-side

```ts
let user = await functions.getUserData();
// user. <--- autocomplete support for data object
```

## Key Features

1. **Simplified Function Calls**: Simplifies remote function calls. Instead of manually constructing HTTP requests, you can call server functions as if they were local async functions.
2. **Automatic Authentication Handling**: The library automatically includes the user's authentication token in requests, saving you from manually managing this for each call.
3. **Type Safety**: By using TypeScript generics, CloudLink provides type checking for both function names and their arguments, catching potential errors at compile-time.
4. **Error Handling**: Provides a consistent way of handling errors from the server, making it easier to manage and debug issues.
5. **JSON Compatibility Checks**: Automatically checks for JSON-incompatible values, preventing silent failures due to serialization issues.
6. **CORS Handling**: On the server side, it integrates CORS handling, simplifying the setup for cross-origin requests.
7. **Easy Mocking for Tests**: Makes it easier to mock server calls in your client-side tests.

## Server-Side Usage

### Setup

```typescript
import * as functions from 'firebase-functions';
import * as cors from 'cors';
import CloudLink from './CloudLink';
import BackendFunctions from "./BackendFunctions";

const corsHandler = cors({ origin: true });

export const methodRequest = CloudLink.expose(BackendFunctions, functions.https.onRequest, corsHandler, admin.auth());
```

### Defining Functions

```typescript
import * as admin from 'firebase-admin';
export const db = admin.firestore();

export type UserData = {
    name: string;
    age: number;
};

class BackendFunctions {
    async getUserProfileData(userID: string) {
        const doc = await db.collection('users').doc(userID).get();
        return doc.data() as UserData | undefined;
    }

    async updateUserProfileData(userID: string, userData: UserData) {
        await db.collection('users').doc(userID).set(userData);
        return userData;
    }
}

export default BackendFunctions;
```

## Client-Side Usage

### Setup

```typescript
import CloudLink from "./CloudLink";
import type BackendFunctions from '../../functions/src/Functions';
import { auth } from './FirebaseConfig';

const url = 'http://127.0.0.1:5001/ca-cloudlink/us-central1/methodRequest';
const functions = CloudLink.wrap<BackendFunctions>(url, auth);
```

### Calling Functions

```typescript
// Get user profile data
let user = await functions.getUserProfileData("abc123");
if (user) console.log(user.name, user.age);

// Update user profile data
await functions.updateUserProfileData("abc123", { name: "John Doe", age: 44 });
```

## API Documentation

```typescript
CloudLink.wrap( endpoint, auth )
```

Wraps a remote API exposed by `CloudLink.expose` and returns an object with methods that can be called as if they were local async functions.

#### Parameters
- `endpoint` (string): The URL of the remote API.
- `auth` (optional Auth): The Firebase Auth object for the client. If provided, the user's token will be automatically included in the requests.

```typescript
CloudLink.expose( api, onRequest, cors, auth )
```

Exposes a local API class as a Cloud Function that can be called remotely via HTTP requests.

#### Parameters
- `api` (class): The API class to expose. The class should have methods that return promises.
- `onRequest` (functions.https.HttpsFunction): The Firebase Functions HTTPS trigger.
- `cors` (optional CorsFunction): A CORS middleware function to handle cross-origin requests.
- `auth` (optional Auth): The Firebase Admin Auth object. If provided, the user's token will be automatically verified for each request.

#### Returns
- (functions.https.HttpsFunction): The Firebase HTTPS function to be exported.