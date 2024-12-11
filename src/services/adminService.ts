import { AdminSettings } from '../types';

class AdminService {
  private static instance: AdminService;
  private settings: AdminSettings = {
    defaultMaxPhotosAlbum: 1000,
    defaultMaxPhotosClassique: 200,
    accessCodeLength: 8,
    accessCodeExpiration: 90
  };

  private constructor() {}

  public static getInstance(): AdminService {
    if (!AdminService.instance) {
      AdminService.instance = new AdminService();
    }
    return AdminService.instance;
  }

  async getSettings(): Promise<AdminSettings> {
    // En mode développement, retourner les paramètres par défaut
    return this.settings;
  }

  async updateSettings(newSettings: Partial<AdminSettings>): Promise<void> {
    // En mode développement, mettre à jour les paramètres locaux
    this.settings = {
      ...this.settings,
      ...newSettings
    };
  }

  async generateAccessCode(length: number = 8): Promise<string> {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}

export const adminService = AdminService.getInstance();