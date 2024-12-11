import axios, { AxiosInstance } from 'axios';

class WordPressService {
  private api: AxiosInstance;
  private static instance: WordPressService;

  private constructor() {
    const API_URL = window.wpApiSettings?.root || '/wp-json/wedding-photos/v1';
    
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }

  public static getInstance(): WordPressService {
    if (!WordPressService.instance) {
      WordPressService.instance = new WordPressService();
    }
    return WordPressService.instance;
  }

  public async get(endpoint: string) {
    return this.api.get(endpoint);
  }

  public async post(endpoint: string, data: any) {
    return this.api.post(endpoint, data);
  }

  public async put(endpoint: string, data: any) {
    return this.api.put(endpoint, data);
  }

  public async delete(endpoint: string) {
    return this.api.delete(endpoint);
  }
}

export const wordpressService = WordPressService.getInstance();