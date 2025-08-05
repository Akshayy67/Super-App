import { User, AuthToken } from '../types';

const AUTH_TOKEN_KEY = 'super_study_auth_token';
const USERS_KEY = 'super_study_users';

export const authUtils = {
  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  hashPassword(password: string): string {
    // Simple hash simulation for demo purposes
    return btoa(password + 'salt123');
  },

  verifyPassword(password: string, hash: string): boolean {
    return this.hashPassword(password) === hash;
  },

  generateToken(user: User): AuthToken {
    const token = btoa(JSON.stringify({
      userId: user.id,
      timestamp: Date.now(),
      random: Math.random()
    }));
    
    return {
      token,
      user,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };
  },

  getStoredUsers(): any[] {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
  },

  storeUser(userData: any): void {
    const users = this.getStoredUsers();
    users.push(userData);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  findUserByEmail(email: string): any | null {
    const users = this.getStoredUsers();
    return users.find(user => user.email === email) || null;
  },

  findUserByUsername(username: string): any | null {
    const users = this.getStoredUsers();
    return users.find(user => user.username === username) || null;
  },

  register(username: string, email: string, password: string): { success: boolean; message: string; token?: AuthToken } {
    if (this.findUserByEmail(email)) {
      return { success: false, message: 'Email already exists' };
    }
    
    if (this.findUserByUsername(username)) {
      return { success: false, message: 'Username already exists' };
    }

    const user: User = {
      id: this.generateId(),
      username,
      email,
      createdAt: new Date().toISOString()
    };

    const userData = {
      ...user,
      passwordHash: this.hashPassword(password)
    };

    this.storeUser(userData);
    const token = this.generateToken(user);
    this.storeToken(token);

    return { success: true, message: 'Registration successful', token };
  },

  login(email: string, password: string): { success: boolean; message: string; token?: AuthToken } {
    const userData = this.findUserByEmail(email);
    
    if (!userData) {
      return { success: false, message: 'User not found' };
    }

    if (!this.verifyPassword(password, userData.passwordHash)) {
      return { success: false, message: 'Invalid password' };
    }

    const user: User = {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      createdAt: userData.createdAt
    };

    const token = this.generateToken(user);
    this.storeToken(token);

    return { success: true, message: 'Login successful', token };
  },

  storeToken(token: AuthToken): void {
    localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(token));
  },

  getStoredToken(): AuthToken | null {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) return null;

    try {
      const parsedToken: AuthToken = JSON.parse(token);
      if (new Date(parsedToken.expiresAt) < new Date()) {
        this.logout();
        return null;
      }
      return parsedToken;
    } catch {
      return null;
    }
  },

  logout(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  },

  isAuthenticated(): boolean {
    return this.getStoredToken() !== null;
  },

  getCurrentUser(): User | null {
    const token = this.getStoredToken();
    return token ? token.user : null;
  }
};