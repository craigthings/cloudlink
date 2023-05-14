import * as admin from 'firebase-admin';
export const db = admin.firestore();

export type UserData = {
  name: string;
  age: number;
};

class AllFunctions {
  async getUserProfileData(userID: string) {
    const doc = await db.collection('users').doc(userID).get();
    return doc.data() as UserData;
  }

  async updateUserProfileData(userID: string, userData: UserData): Promise<void> {
    await db.collection('users').doc(userID).set(userData);
  }
}

export default AllFunctions;