import { Client, Photo } from '../types';
import { wordpressService } from './wordpressService';

class ClientService {
  private static instance: ClientService;
  private demoClients: Client[] = [
    {
      id: '1',
      couple: 'Sophie & Thomas',
      accessCode: 'MARIAGE2024',
      driveLink: 'https://drive.google.com/demo1',
      expiryDate: '2024-12-31',
      maxPhotos: {
        album: 1000,
        classique: 200
      }
    },
    {
      id: '2',
      couple: 'Marie & Jean',
      accessCode: 'AMOUR2024',
      driveLink: 'https://drive.google.com/demo2',
      expiryDate: '2024-12-31',
      maxPhotos: {
        album: 1000,
        classique: 200
      }
    }
  ];

  private demoSelections: Record<string, { album: Photo[]; classique: Photo[] }> = {
    '1': {
      album: Array.from({ length: 10 }, (_, i) => ({
        id: `album-${i + 1}`,
        url: `https://source.unsplash.com/800x600/?wedding&sig=${i}`,
        thumbnail: `https://source.unsplash.com/400x300/?wedding&sig=${i}`,
        selected: true,
        category: 'album' as const,
        title: `Photo de mariage ${i + 1}`
      })),
      classique: Array.from({ length: 5 }, (_, i) => ({
        id: `classique-${i + 1}`,
        url: `https://source.unsplash.com/800x600/?wedding,portrait&sig=${i + 20}`,
        thumbnail: `https://source.unsplash.com/400x300/?wedding,portrait&sig=${i + 20}`,
        selected: true,
        category: 'classique' as const,
        title: `Photo classique ${i + 1}`
      }))
    }
  };

  private constructor() {}

  public static getInstance(): ClientService {
    if (!ClientService.instance) {
      ClientService.instance = new ClientService();
    }
    return ClientService.instance;
  }

  async getClients(): Promise<Client[]> {
    try {
      // En mode développement, retourner les données de démo
      return this.demoClients;
    } catch (error) {
      console.error('Erreur lors de la récupération des clients:', error);
      return [];
    }
  }

  async getClientSelections(clientId: string): Promise<{ album: Photo[]; classique: Photo[] }> {
    // En mode développement, retourner les sélections de démo
    return this.demoSelections[clientId] || { album: [], classique: [] };
  }

  async createClient(client: Omit<Client, 'id'>): Promise<Client> {
    // En mode développement, simuler la création
    const newClient = {
      ...client,
      id: String(this.demoClients.length + 1)
    };
    this.demoClients.push(newClient);
    return newClient;
  }

  async updateClient(id: string, clientData: Partial<Client>): Promise<Client> {
    // En mode développement, simuler la mise à jour
    const index = this.demoClients.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Client non trouvé');
    
    this.demoClients[index] = {
      ...this.demoClients[index],
      ...clientData
    };
    return this.demoClients[index];
  }

  async deleteClient(id: string): Promise<void> {
    // En mode développement, simuler la suppression
    const index = this.demoClients.findIndex(c => c.id === id);
    if (index !== -1) {
      this.demoClients.splice(index, 1);
    }
  }
}

export const clientService = ClientService.getInstance();