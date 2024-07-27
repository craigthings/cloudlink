import { GoogleAuthProvider, signInWithPopup, UserCredential, User as FirebaseUser } from 'firebase/auth';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from './FirebaseConfig';

export class AuthService {
  private googleProvider: GoogleAuthProvider;
  private currentUser: FirebaseUser | null = null;
  private currentToken: string | null = null;

  constructor() {
    this.googleProvider = new GoogleAuthProvider();
  }

  get user(): FirebaseUser | null {
    return this.currentUser;
  }

  get token(): string | null {
    return this.currentToken;
  }

  init() {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.currentUser = user as FirebaseUser;
        this.currentToken = await user.getIdToken();
        console.log('Firebase app is fully initialized and ready for database calls.');
        // Make database calls here
      } else {
        this.currentUser = null;
        this.currentToken = null;
        console.log('User is not authenticated.');
      }
    });
  }

  async login(): Promise<UserCredential | null> {
    try {
      const result = await signInWithPopup(auth, this.googleProvider);
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      // The signed-in user info.
      this.currentUser = result.user;
      this.currentToken = await result.user.getIdToken();
      console.log('User signed in:', this.currentUser);
      return result;
    } catch (error: any) {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error('Error signing in:', errorCode, errorMessage);
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(auth);
      this.currentUser = null;
      this.currentToken = null;
      console.log('User signed out successfully');
      // You can add additional logic here, such as redirecting to a login page
    } catch (error) {
      console.error('Error signing out:', error);
      // Handle any errors here
    }
  }

  async refreshToken(): Promise<string | null> {
    if (this.currentUser) {
      try {
        this.currentToken = await this.currentUser.getIdToken(true);
        return this.currentToken;
      } catch (error) {
        console.error('Error refreshing token:', error);
        return null;
      }
    }
    return null;
  }
}

export default new AuthService();