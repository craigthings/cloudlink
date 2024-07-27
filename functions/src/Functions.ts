import * as admin from 'firebase-admin';
export const db = admin.firestore();

export type UserData = {
  name: string;
  age: number;
};

class AllFunctions {
  async getUserProfileData(userID: string) {
    console.log('getUserProfileData', userID);
    const doc = await db.collection('users').doc(userID).get();
    return doc.data() as UserData | undefined;
  }

  async updateUserProfileData(userID: string, userData: UserData) {
    console.log('updateUserProfileData', userID, userData);
    await db.collection('users').doc(userID).set(userData);
    return userData;
  }
}

export default AllFunctions;