
# ⚠ In Development ⚠

# CloudLink Library

CloudLink is a lightweight library that simplifies the interaction between client-side code and Firebase Cloud Functions. It provides an abstraction layer inspired by Comlink, allowing you to call server-side functions as if they were local asynchronous functions.

## Key Features

1. **Simplified Function Calls**: Simplifies remote function calls. Instead of manually constructing HTTP requests, you can call server functions as if they were local async functions.
2. **Automatic Authentication Handling**: The library automatically includes the user's authentication token in requests, saving you from manually managing this for each call.
3. **Type Safety**: By using TypeScript generics, CloudLink provides type checking for both function names and their arguments, catching potential errors at compile-time.
4. **Unified Error Handling**: Provides a consistent way of handling errors from the server, making it easier to manage and debug issues.
5. **JSON Compatibility Checks**: Automatically checks for JSON-incompatible values, preventing silent failures due to serialization issues.
6. **CORS Handling**: On the server side, it integrates CORS handling, simplifying the setup for cross-origin requests.
7. **Code Organization**: Encourages a clear separation between your API definition and its implementation, potentially improving code organization.
8. **Reduced Boilerplate**: No need to write repetitive code for making HTTP requests, parsing responses, or handling common errors for each function call.
9. **Easy Mocking for Tests**: Makes it easier to mock server calls in your client-side tests.

## Client-Side Usage

### Setup

```typescript
import CloudLink from "./CloudLink";
import type BackendFunctions from '../../functions/src/Functions';
import { auth } from './FirebaseConfig';

const baseUrl = 'http://127.0.0.1:5001/ca-cloudlink/us-central1/';
const baseMethod = 'methodRequest';
const url = baseUrl + baseMethod;

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


