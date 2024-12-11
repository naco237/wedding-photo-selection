import { toast, ToastOptions } from 'react-toastify';

export interface NotificationOptions extends ToastOptions {
    email?: boolean;
    push?: boolean;
}

class NotificationService {
    private static instance: NotificationService;
    private vapidPublicKey: string = ''; // Clé publique pour les notifications push

    private constructor() {
        this.initializePushNotifications();
    }

    public static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    private async initializePushNotifications() {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            try {
                const registration = await navigator.serviceWorker.register('/service-worker.js');
                console.log('ServiceWorker registered:', registration);
            } catch (error) {
                console.error('ServiceWorker registration failed:', error);
            }
        }
    }

    public async requestPushPermission(): Promise<boolean> {
        if (!('Notification' in window)) {
            return false;
        }

        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    public async notify(
        message: string,
        options: NotificationOptions = {}
    ): Promise<void> {
        const defaultOptions: ToastOptions = {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
        };

        // Notification toast
        toast(message, { ...defaultOptions, ...options });

        // Notification par email
        if (options.email) {
            await this.sendEmailNotification(message);
        }

        // Notification push
        if (options.push) {
            await this.sendPushNotification(message);
        }
    }

    private async sendEmailNotification(message: string): Promise<void> {
        try {
            const response = await fetch('/wp-json/wedding-photo-selection/v1/notifications/email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
            });

            if (!response.ok) {
                throw new Error('Failed to send email notification');
            }
        } catch (error) {
            console.error('Email notification error:', error);
            throw error;
        }
    }

    private async sendPushNotification(message: string): Promise<void> {
        if (!this.vapidPublicKey) {
            return;
        }

        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.vapidPublicKey,
            });

            await fetch('/wp-json/wedding-photo-selection/v1/notifications/push', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    subscription,
                    message,
                }),
            });
        } catch (error) {
            console.error('Push notification error:', error);
            throw error;
        }
    }

    public async subscribeToNotifications(userId: string, types: string[]): Promise<void> {
        try {
            await fetch('/wp-json/wedding-photo-selection/v1/notifications/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    types,
                }),
            });
        } catch (error) {
            console.error('Notification subscription error:', error);
            throw error;
        }
    }
}

export const notificationService = NotificationService.getInstance();
