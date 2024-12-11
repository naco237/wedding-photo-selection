import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

class AuthService {
  private static instance: AuthService;
  private tokenKey = 'wedding_photo_token';
  private refreshTokenKey = 'wedding_photo_refresh_token';

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(credentials: { username: string; password: string }) {
    try {
      const response = await axios.post('/api/auth/login', credentials);
      const { token, refreshToken } = response.data;
      
      this.setTokens(token, refreshToken);
      return response.data;
    } catch (error) {
      throw new Error('Échec de l\'authentification');
    }
  }

  private setTokens(token: string, refreshToken: string) {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
      return decoded.exp! * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
  }
}

export const authService = AuthService.getInstance();