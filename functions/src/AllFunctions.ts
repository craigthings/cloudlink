
export type UserData = {
  name: string;
  age: number;
};

let db: FirebaseFirestore.Firestore;

class AllFunctions {
  constructor(dbRef: FirebaseFirestore.Firestore) {
    db = dbRef;
  }

  async getUserProfileData(userID: string) {
    const doc = await db.collection('users').doc(userID).get();
    return doc.data() as UserData;
  }

  async updateUserProfileData(userID: string, userData: UserData) {
    await db.collection('users').doc(userID).set(userData);
    return userData;
  }
}

export default AllFunctions;