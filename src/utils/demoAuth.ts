// Development/Demo mode authentication
// This is a fallback when Firebase is not configured

import { User } from "../types";

export interface AuthResult {
  success: boolean;
  message: string;
  user?: User;
}

class DemoAuthService {
  private currentUser: User | null = null;
  private authStateListeners: ((user: User | null) => void)[] = [];
  private users: any[] = [];

  // Subscribe to auth state changes
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    this.authStateListeners.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  private notifyListeners() {
    this.authStateListeners.forEach((listener) => listener(this.currentUser));
  }

  async register(
    username: string,
    email: string,
    password: string
  ): Promise<AuthResult> {
    // Check if user exists
    if (this.users.find((u) => u.email === email)) {
      return { success: false, message: "Email already exists" };
    }

    const user: User = {
      id: Date.now().toString(),
      username,
      email,
      createdAt: new Date().toISOString(),
    };

    this.users.push({ ...user, password });
    this.currentUser = user;
    this.notifyListeners();

    return { success: true, message: "Registration successful", user };
  }

  async login(email: string, password: string): Promise<AuthResult> {
    const userData = this.users.find((u) => u.email === email);

    if (!userData || userData.password !== password) {
      return { success: false, message: "Invalid email or password" };
    }

    this.currentUser = {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      createdAt: userData.createdAt,
    };

    this.notifyListeners();

    return {
      success: true,
      message: "Login successful",
      user: this.currentUser,
    };
  }

  async logout(): Promise<void> {
    this.currentUser = null;
    this.notifyListeners();
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }
}

export const demoAuth = new DemoAuthService();
