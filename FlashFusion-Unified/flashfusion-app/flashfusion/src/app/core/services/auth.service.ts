import { Injectable, inject, signal } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail, updatePassword, onAuthStateChanged, User as FirebaseUser } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc, updateDoc } from '@angular/fire/firestore';
import { Observable, BehaviorSubject, from, throwError } from 'rxjs';
import { map, switchMap, tap, catchError } from 'rxjs/operators';
import { User, LoginCredentials, RegisterCredentials, AuthState, SubscriptionTier, UserPreferences, UserStatistics, Theme, FontSize, ProfileVisibility, ProgressVisibility } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  
  private authState = signal<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    token: null
  });

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  
  readonly currentUser$ = this.currentUserSubject.asObservable();
  readonly authState$ = this.authState.asReadonly();
  readonly isAuthenticated$ = this.currentUser$.pipe(map(user => !!user));
  readonly isLoading$ = this.currentUserSubject.pipe(map(() => this.authState().isLoading));

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    onAuthStateChanged(this.auth, async (firebaseUser) => {
      this.authState.update(state => ({ ...state, isLoading: true }));
      
      try {
        if (firebaseUser) {
          const user = await this.getUserProfile(firebaseUser.uid);
          const token = await firebaseUser.getIdToken();
          
          this.authState.update(state => ({
            ...state,
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            token
          }));
          
          this.currentUserSubject.next(user);
        } else {
          this.authState.update(state => ({
            ...state,
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            token: null
          }));
          
          this.currentUserSubject.next(null);
        }
      } catch (error) {
        this.authState.update(state => ({
          ...state,
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Authentication error',
          token: null
        }));
        
        this.currentUserSubject.next(null);
      }
    });
  }

  async login(credentials: LoginCredentials): Promise<User> {
    try {
      this.authState.update(state => ({ ...state, isLoading: true, error: null }));
      
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        credentials.email,
        credentials.password
      );
      
      const user = await this.getUserProfile(userCredential.user.uid);
      
      // Update last login
      await this.updateLastLogin(user.id);
      
      return user;
    } catch (error) {
      const errorMessage = this.getAuthErrorMessage(error);
      this.authState.update(state => ({
        ...state,
        isLoading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }

  async register(credentials: RegisterCredentials): Promise<User> {
    try {
      this.authState.update(state => ({ ...state, isLoading: true, error: null }));
      
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        credentials.email,
        credentials.password
      );
      
      const newUser = await this.createUserProfile(userCredential.user, credentials.displayName);
      
      return newUser;
    } catch (error) {
      const errorMessage = this.getAuthErrorMessage(error);
      this.authState.update(state => ({
        ...state,
        isLoading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
    } catch (error) {
      const errorMessage = this.getAuthErrorMessage(error);
      throw new Error(errorMessage);
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }

    try {
      // Re-authenticate user first
      await signInWithEmailAndPassword(this.auth, user.email!, currentPassword);
      
      // Update password
      await updatePassword(user, newPassword);
    } catch (error) {
      const errorMessage = this.getAuthErrorMessage(error);
      throw new Error(errorMessage);
    }
  }

  private async getUserProfile(uid: string): Promise<User> {
    const userDoc = doc(this.firestore, 'users', uid);
    const userSnap = await getDoc(userDoc);
    
    if (!userSnap.exists()) {
      throw new Error('User profile not found');
    }
    
    const userData = userSnap.data();
    return {
      id: uid,
      ...userData,
      created: userData['created']?.toDate() || new Date(),
      updated: userData['updated']?.toDate() || new Date(),
      lastLogin: userData['lastLogin']?.toDate() || new Date()
    } as User;
  }

  private async createUserProfile(firebaseUser: FirebaseUser, displayName: string): Promise<User> {
    const now = new Date();
    const defaultPreferences: UserPreferences = {
      theme: Theme.AUTO,
      language: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      notifications: {
        email: true,
        push: true,
        studyReminders: true,
        achievementUnlocks: true,
        weeklyProgress: true,
        socialUpdates: false
      },
      studyReminders: {
        enabled: true,
        times: ['09:00', '18:00'],
        days: [1, 2, 3, 4, 5], // Monday to Friday
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        minCardsBeforeReminder: 5
      },
      accessibility: {
        fontSize: FontSize.MEDIUM,
        highContrast: false,
        reducedMotion: false,
        screenReader: false,
        keyboardNavigation: false
      },
      privacy: {
        profileVisibility: ProfileVisibility.FRIENDS,
        progressVisibility: ProgressVisibility.FRIENDS,
        allowDataCollection: true,
        allowAnalytics: true
      }
    };

    const defaultStatistics: UserStatistics = {
      totalCardsStudied: 0,
      totalStudyTime: 0,
      currentStreak: 0,
      longestStreak: 0,
      averageAccuracy: 0,
      totalDecks: 0,
      level: 1,
      experiencePoints: 0,
      achievementsUnlocked: 0,
      studySessionsCompleted: 0,
      averageSessionLength: 0
    };

    const newUser: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName,
      subscription: SubscriptionTier.FREE,
      preferences: defaultPreferences,
      statistics: defaultStatistics,
      created: now,
      updated: now,
      lastLogin: now,
      isEmailVerified: firebaseUser.emailVerified,
      isActive: true
    };

    // Save to Firestore
    const userDoc = doc(this.firestore, 'users', firebaseUser.uid);
    await setDoc(userDoc, {
      ...newUser,
      created: now,
      updated: now,
      lastLogin: now
    });

    return newUser;
  }

  private async updateLastLogin(userId: string): Promise<void> {
    const userDoc = doc(this.firestore, 'users', userId);
    await updateDoc(userDoc, {
      lastLogin: new Date(),
      updated: new Date()
    });
  }

  private getAuthErrorMessage(error: any): string {
    if (typeof error === 'string') return error;
    
    const code = error?.code || error?.message || 'unknown-error';
    
    switch (code) {
      case 'auth/user-not-found':
        return 'No account found with this email address';
      case 'auth/wrong-password':
        return 'Invalid password';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/user-disabled':
        return 'This account has been disabled';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection';
      default:
        return 'An authentication error occurred';
    }
  }

  getCurrentUser(): User | null {
    return this.authState().user;
  }

  getCurrentUserId(): string | null {
    return this.authState().user?.id || null;
  }

  isAuthenticated(): boolean {
    return this.authState().isAuthenticated;
  }

  getAuthToken(): string | null {
    return this.authState().token;
  }
}